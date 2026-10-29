/**
 * Sign-in options shown on /login. Email (magic link) is always on.
 * Each social provider must also be switched on in the Supabase dashboard
 * (Authentication → Sign In / Providers) before it will work.
 */
export type OAuthProviderId = "google" | "linkedin_oidc";

export const oauthProviders: { id: OAuthProviderId; label: string }[] = [
  // On unless NEXT_PUBLIC_AUTH_GOOGLE=false.
  ...(process.env.NEXT_PUBLIC_AUTH_GOOGLE !== "false" ? [{ id: "google" as const, label: "Google" }] : []),
  // Off until NEXT_PUBLIC_AUTH_LINKEDIN=true.
  ...(process.env.NEXT_PUBLIC_AUTH_LINKEDIN === "true" ? [{ id: "linkedin_oidc" as const, label: "LinkedIn" }] : []),
];
