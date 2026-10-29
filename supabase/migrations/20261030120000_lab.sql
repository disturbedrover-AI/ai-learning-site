-- The Lab: private entries for the owner and approved members, the members
-- allowlist, and access requests. Run AFTER 20261029120000_accounts.sql.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste this file → Run.
-- Safe to run again.

-- ---------------------------------------------------------------------------
-- Helpers: the signed-in user's role (used by the rules below).
-- security definer so the rules can read it without extra permissions.
-- ---------------------------------------------------------------------------
create or replace function public.lab_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke execute on function public.lab_role() from public, anon;
grant execute on function public.lab_role() to authenticated;

-- ---------------------------------------------------------------------------
-- lab_allowlist: who may use the Lab. When someone on it signs up, they get
-- its role automatically (see handle_new_user below). Owner only.
-- ---------------------------------------------------------------------------
create table if not exists public.lab_allowlist (
  email text primary key check (email = lower(email)),
  role text not null default 'member' check (role in ('member', 'owner')),
  invited_at timestamptz not null default now(),
  invited_by uuid references auth.users (id) on delete set null,
  accepted boolean not null default false,
  accepted_at timestamptz
);

alter table public.lab_allowlist enable row level security;

drop policy if exists "Owner can read the allowlist" on public.lab_allowlist;
create policy "Owner can read the allowlist"
  on public.lab_allowlist for select
  to authenticated
  using (public.lab_role() = 'owner');

-- Changes only through the functions below, which keep profiles.role in step.
revoke all on public.lab_allowlist from anon, authenticated;
grant select on public.lab_allowlist to authenticated;

-- ---------------------------------------------------------------------------
-- lab_access_requests: "Request access" from signed-in users. One per user.
-- ---------------------------------------------------------------------------
create table if not exists public.lab_access_requests (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

alter table public.lab_access_requests enable row level security;

drop policy if exists "Users see their own request; owner sees all" on public.lab_access_requests;
create policy "Users see their own request; owner sees all"
  on public.lab_access_requests for select
  to authenticated
  using ((select auth.uid()) = user_id or public.lab_role() = 'owner');

revoke all on public.lab_access_requests from anon, authenticated;
grant select on public.lab_access_requests to authenticated;

-- ---------------------------------------------------------------------------
-- lab_entries: experiments, tips, notes and snippets.
-- Owner: everything. Members: read anything that isn't a draft. Nobody else: nothing.
-- ---------------------------------------------------------------------------

-- Tags as plain text, for search. (Marked immutable so it can feed the search column.)
create or replace function public.lab_tags_text(tags text[])
returns text
language sql
immutable
as $$
  select coalesce(array_to_string(tags, ' '), '');
$$;

create table if not exists public.lab_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null default 'note' check (kind in ('experiment', 'tip', 'note', 'snippet')),
  title text not null check (char_length(title) between 1 and 200),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  body text not null default '',
  status text not null default 'draft' check (status in ('draft', 'active', 'done', 'archived')),
  tags text[] not null default '{}',
  collection text,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Full-text search over title (most important), tags, then body.
  search tsvector generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', public.lab_tags_text(tags)), 'B') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'C')
  ) stored
);

create index if not exists lab_entries_search_idx on public.lab_entries using gin (search);
create index if not exists lab_entries_collection_idx on public.lab_entries (collection);

create or replace function public.lab_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists lab_entries_updated_at on public.lab_entries;
create trigger lab_entries_updated_at
  before update on public.lab_entries
  for each row execute function public.lab_touch_updated_at();

alter table public.lab_entries enable row level security;

drop policy if exists "Owner reads all; members read non-drafts" on public.lab_entries;
create policy "Owner reads all; members read non-drafts"
  on public.lab_entries for select
  to authenticated
  using (public.lab_role() = 'owner' or (public.lab_role() = 'member' and status <> 'draft'));

drop policy if exists "Owner adds entries" on public.lab_entries;
create policy "Owner adds entries"
  on public.lab_entries for insert
  to authenticated
  with check (public.lab_role() = 'owner' and owner_id = (select auth.uid()));

drop policy if exists "Owner edits entries" on public.lab_entries;
create policy "Owner edits entries"
  on public.lab_entries for update
  to authenticated
  using (public.lab_role() = 'owner')
  with check (public.lab_role() = 'owner');

drop policy if exists "Owner deletes entries" on public.lab_entries;
create policy "Owner deletes entries"
  on public.lab_entries for delete
  to authenticated
  using (public.lab_role() = 'owner');

revoke all on public.lab_entries from anon;
grant select, insert, update, delete on public.lab_entries to authenticated;

-- ---------------------------------------------------------------------------
-- lab_entry_links: external references for an entry. Visible whenever the entry is.
-- ---------------------------------------------------------------------------
create table if not exists public.lab_entry_links (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.lab_entries (id) on delete cascade,
  url text not null check (url ~* '^https?://'),
  label text,
  position integer not null default 0
);

create index if not exists lab_entry_links_entry_idx on public.lab_entry_links (entry_id);

alter table public.lab_entry_links enable row level security;

drop policy if exists "Links are visible with their entry" on public.lab_entry_links;
create policy "Links are visible with their entry"
  on public.lab_entry_links for select
  to authenticated
  using (exists (select 1 from public.lab_entries e where e.id = entry_id));

drop policy if exists "Owner manages links" on public.lab_entry_links;
create policy "Owner manages links"
  on public.lab_entry_links for all
  to authenticated
  using (public.lab_role() = 'owner')
  with check (public.lab_role() = 'owner');

revoke all on public.lab_entry_links from anon;
grant select, insert, update, delete on public.lab_entry_links to authenticated;

-- ---------------------------------------------------------------------------
-- Sign-up: create the profile, with the allowlist role if this email was invited.
-- (Replaces the version from the accounts migration.)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invited_role text;
begin
  select role into invited_role from public.lab_allowlist where email = lower(new.email);

  insert into public.profiles (id, display_name, avatar_url, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    coalesce(invited_role, 'user')
  )
  on conflict (id) do nothing;

  if invited_role is not null then
    update public.lab_allowlist set accepted = true, accepted_at = now() where email = lower(new.email);
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Owner actions (called from /lab/members). Each checks the caller is the owner,
-- and keeps lab_allowlist and profiles.role in step.
-- ---------------------------------------------------------------------------

-- Add someone, or change their role. If they already have an account, it applies now.
create or replace function public.lab_invite(p_email text, p_role text default 'member')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_user uuid;
begin
  if public.lab_role() is distinct from 'owner' then
    raise exception 'Only the owner can manage members.' using errcode = '42501';
  end if;
  if p_role not in ('member', 'owner') then
    raise exception 'Role must be member or owner.';
  end if;
  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'That doesn''t look like an email address.';
  end if;

  select id into v_user from auth.users where lower(email) = v_email;
  if v_user = auth.uid() and p_role <> 'owner' then
    raise exception 'You can''t remove your own owner access.';
  end if;

  insert into public.lab_allowlist (email, role, invited_by, accepted, accepted_at)
  values (v_email, p_role, auth.uid(), v_user is not null, case when v_user is not null then now() end)
  on conflict (email) do update set role = excluded.role;

  if v_user is not null then
    update public.profiles set role = p_role where id = v_user;
    update public.lab_access_requests
      set status = 'approved', decided_at = now()
      where user_id = v_user and status = 'pending';
  end if;
end;
$$;

-- Take someone off the allowlist; their account goes back to a plain user.
create or replace function public.lab_remove(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(trim(p_email));
  v_user uuid;
begin
  if public.lab_role() is distinct from 'owner' then
    raise exception 'Only the owner can manage members.' using errcode = '42501';
  end if;
  select id into v_user from auth.users where lower(email) = v_email;
  if v_user = auth.uid() then
    raise exception 'You can''t remove your own owner access.';
  end if;

  delete from public.lab_allowlist where email = v_email;
  if v_user is not null then
    update public.profiles set role = 'user' where id = v_user;
  end if;
end;
$$;

-- Approve (adds them as a member) or decline an access request.
create or replace function public.lab_decide_request(p_user_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text;
begin
  if public.lab_role() is distinct from 'owner' then
    raise exception 'Only the owner can manage members.' using errcode = '42501';
  end if;
  select email into v_email from public.lab_access_requests where user_id = p_user_id;
  if v_email is null then
    raise exception 'That request no longer exists.';
  end if;

  if p_approve then
    perform public.lab_invite(v_email, 'member');
  end if;
  update public.lab_access_requests
    set status = case when p_approve then 'approved' else 'declined' end, decided_at = now()
    where user_id = p_user_id;
end;
$$;

-- "Request access" for the signed-in user (members and the owner don't need to).
create or replace function public.lab_request_access(p_message text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in first.' using errcode = '42501';
  end if;
  if public.lab_role() in ('member', 'owner') then
    return;
  end if;

  insert into public.lab_access_requests (user_id, email, message)
  select id, lower(email), left(p_message, 500) from auth.users where id = auth.uid()
  on conflict (user_id) do update
    set status = 'pending', message = excluded.message, created_at = now(), decided_at = null;
end;
$$;

revoke execute on function public.lab_invite(text, text) from public, anon;
revoke execute on function public.lab_remove(text) from public, anon;
revoke execute on function public.lab_decide_request(uuid, boolean) from public, anon;
revoke execute on function public.lab_request_access(text) from public, anon;
grant execute on function public.lab_invite(text, text) to authenticated;
grant execute on function public.lab_remove(text) to authenticated;
grant execute on function public.lab_decide_request(uuid, boolean) to authenticated;
grant execute on function public.lab_request_access(text) to authenticated;
