import { getRadar } from "@/lib/radar";

/**
 * GET /api/radar: the Radar headlines as JSON ({ items, fetchedAt, sources }),
 * for reuse elsewhere (e.g. the Lab). Refreshed at most once an hour.
 */
export async function GET() {
  return Response.json(await getRadar());
}
