/**
 * POST /api/auth-error: the sign-in form sends the real Supabase auth error here so
 * it shows up in the Vercel logs. The browser only ever shows the person a friendly
 * message, which used to hide the actual cause (paused project, rate limit, 5xx...).
 *
 * It only logs — nothing is stored, and no reply body is returned. Values are strings
 * from the client, so each is clamped to keep a flood of requests from bloating the logs.
 */

/** Keep a single logged field short so the logs stay readable and can't be spammed huge. */
const clamp = (value: unknown, max = 300) => (typeof value === "string" ? value.slice(0, max) : value);

export async function POST(request: Request) {
  let detail: Record<string, unknown> = {};
  try {
    detail = (await request.json()) as Record<string, unknown>;
  } catch {
    // Malformed or empty body: still log that an auth error was reported.
  }

  console.error(
    "[auth] sign-in failed:",
    JSON.stringify({
      stage: clamp(detail.stage, 20),
      name: clamp(detail.name, 60),
      status: typeof detail.status === "number" ? detail.status : undefined,
      code: clamp(detail.code, 60),
      message: clamp(detail.message),
    }),
  );

  return new Response(null, { status: 204 });
}
