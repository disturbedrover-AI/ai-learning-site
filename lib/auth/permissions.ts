import "server-only";
import { hasRole } from "./roles";
import { getRole } from "./server";

/**
 * Who may turn a Radar headline into a draft news post ("Make this a post"):
 * the site owner only. This reads the visitor's cookies, so the parts of a page
 * that call it must sit inside <Suspense> (the Radar panel on /news does).
 */
export async function canDraftPosts(): Promise<boolean> {
  return hasRole(await getRole(), "owner");
}
