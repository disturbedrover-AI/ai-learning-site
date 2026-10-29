/**
 * Roles, from lowest to highest. Each role can do everything the ones before it can.
 *   user   – anyone who has signed up (the default)
 *   member – can use members-only areas (e.g. the Lab, once it's gated)
 *   owner  – the site owner
 * A role is stored in profiles.role and can only be changed with the service
 * role (e.g. the Supabase SQL editor), never by the user. See CLAUDE.md.
 */
export const ROLES = ["user", "member", "owner"] as const;
export type Role = (typeof ROLES)[number];

/** True when `role` is at least `needed`. */
export function hasRole(role: Role | null | undefined, needed: Role) {
  return !!role && ROLES.indexOf(role) >= ROLES.indexOf(needed);
}

export function isRole(value: unknown): value is Role {
  return ROLES.includes(value as Role);
}
