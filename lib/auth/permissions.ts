import "server-only";
import { showDrafts } from "@/lib/courses";

/**
 * Who may turn a Radar headline into a draft news post ("Make this a post").
 *
 * For now: anyone, but only when SHOW_DRAFTS=true (i.e. on your own computer).
 * To restrict it to the site owner instead, replace the body with:
 *   return hasRole(await getRole(), "owner");
 * (imports: getRole from "./server", hasRole from "./roles"). That reads the
 * visitor's cookies, so the parts of the page that call this must sit inside
 * <Suspense>; the Radar panel on /news already does.
 */
export async function canDraftPosts(): Promise<boolean> {
  return showDrafts();
}
