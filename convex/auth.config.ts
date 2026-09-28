import type { AuthConfig } from "convex/server";

const domain =
  process.env.CLERK_FRONTEND_API_URL ||
  process.env.CLERK_JWT_ISSUER_DOMAIN ||
  "";

const authConfig = {
  providers: [
    {
      domain,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;

export default authConfig;
