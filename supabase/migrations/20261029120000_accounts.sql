-- Accounts: profiles, lesson progress, row level security, and a sign-up trigger.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste this file → Run.
-- Safe to run again: everything checks whether it already exists.

-- ---------------------------------------------------------------------------
-- profiles: one row per user, created automatically on sign-up.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'member', 'owner')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Users may only change their name and avatar. "role" (and "id", "created_at")
-- can only be changed by the service role or in the SQL editor.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- lesson_progress: one row per user + course + track + lesson.
-- ---------------------------------------------------------------------------
create table if not exists public.lesson_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  course_slug text not null,
  track_slug text not null,
  lesson_slug text not null,
  completed_at timestamptz,
  last_opened_at timestamptz,
  primary key (user_id, course_slug, track_slug, lesson_slug)
);

alter table public.lesson_progress enable row level security;

drop policy if exists "Users can read their own progress" on public.lesson_progress;
create policy "Users can read their own progress"
  on public.lesson_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add their own progress" on public.lesson_progress;
create policy "Users can add their own progress"
  on public.lesson_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own progress" on public.lesson_progress;
create policy "Users can update their own progress"
  on public.lesson_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own progress" on public.lesson_progress;
create policy "Users can delete their own progress"
  on public.lesson_progress for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.lesson_progress from anon;
grant select, insert, update, delete on public.lesson_progress to authenticated;

-- ---------------------------------------------------------------------------
-- Create a profile when someone signs up (name and avatar from their provider).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- "Delete my account" on /account: removes the signed-in user. Their profile and
-- progress go with it (on delete cascade).
-- ---------------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
