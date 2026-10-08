import * as dotenv from "dotenv";
import { config, higgsfield } from "@higgsfield/client/v2";

// Load environment variables from .env.local without exposing values
dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  const credentials = process.env.HF_CREDENTIALS;

  if (!credentials) {
    console.error(
      "Error: HF_CREDENTIALS is not set in .env.local. Please configure HF_CREDENTIALS=<key-id>:<key-secret> in .env.local."
    );
    process.exit(1);
  }

  // Configure SDK credentials server-side
  config({
    credentials,
  });

  console.log("Submitting video generation request to bytedance/seedance-2.5/text-to-video...");
  console.log("Parameters: prompt='A cinematic scene at sunset', duration=5, resolution=720p, aspect_ratio=16:9");

  try {
    const result = await higgsfield.subscribe(
      "bytedance/seedance-2.5/text-to-video",
      {
        input: {
          prompt: "A cinematic scene at sunset",
          duration: 5,
          resolution: "720p",
          aspect_ratio: "16:9",
        },
        withPolling: true,
      }
    );

    console.log(`Request completed with status: ${result.status}`);

    if (result.status === "completed") {
      const videoUrl = result.video?.url;
      if (videoUrl) {
        console.log("Video generation succeeded!");
        console.log(`Generated Video URL: ${videoUrl}`);
      } else {
        console.error("Request marked as completed, but no video URL was returned in response.");
        process.exit(1);
      }
    } else if (result.status === "failed") {
      console.error(`Request failed. Status: ${result.status}`);
      process.exit(1);
    } else if (result.status === "nsfw") {
      console.error(`Request was moderated (NSFW filter triggered). Status: ${result.status}`);
      process.exit(1);
    } else {
      console.error(`Request ended with unhandled status: ${result.status}`);
      process.exit(1);
    }
  } catch (error: any) {
    console.error("Error executing Higgsfield request:", error?.message || error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err?.message || err);
  process.exit(1);
});
