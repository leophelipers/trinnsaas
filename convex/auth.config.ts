import type { AuthConfig } from "convex/server";

const configuredDomain =
  process.env.CLERK_FRONTEND_API_URL ||
  "https://epic-sponge-2961.clerk.accounts.dev";

const uniqueDomains = Array.from(
  new Set(
    [
      configuredDomain,
      "https://clerk.kriativa.app",
      "https://epic-sponge-2961.clerk.accounts.dev",
    ].map((d) => d.trim().replace(/\/$/, ""))
  )
);

const authConfig = {
  providers: uniqueDomains.map((domain) => ({
    domain,
    applicationID: "convex",
  })),
} satisfies AuthConfig;

export default authConfig;
