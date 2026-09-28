import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

type ClerkWebhookPayload = {
  type: string;
  data: {
    id?: string;
    email_addresses?: Array<{ id: string; email_address: string }>;
    primary_email_address_id?: string;
    first_name?: string | null;
    last_name?: string | null;
    username?: string | null;
    image_url?: string | null;
  };
};

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
      return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const payload = await request.text();

    const wh = new Webhook(webhookSecret);
    let evt: ClerkWebhookPayload;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as unknown as ClerkWebhookPayload;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Invalid webhook signature", { status: 400 });
    }

    const eventType = evt.type;
    const data = evt.data;

    if (eventType === "user.created" || eventType === "user.updated") {
      if (!data.id) {
        return new Response("Missing user ID", { status: 400 });
      }

      const email =
        data.email_addresses?.find(
          (e) => e.id === data.primary_email_address_id
        )?.email_address ||
        data.email_addresses?.[0]?.email_address ||
        "";

      const name =
        [data.first_name, data.last_name].filter(Boolean).join(" ") ||
        data.username ||
        undefined;

      const imageUrl = data.image_url || undefined;

      await ctx.runMutation(internal.users.upsertFromClerk, {
        clerkId: data.id,
        email,
        name,
        imageUrl,
      });
    } else if (eventType === "user.deleted") {
      if (data.id) {
        await ctx.runMutation(internal.users.deleteFromClerk, {
          clerkId: data.id,
        });
      }
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
