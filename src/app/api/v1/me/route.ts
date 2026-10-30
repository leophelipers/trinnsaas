import { NextRequest } from "next/server";
import { GET as verifyGet, OPTIONS as verifyOptions } from "../auth/verify/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return verifyOptions();
}

export async function GET(req: NextRequest) {
  return verifyGet(req);
}
