import { NextRequest, NextResponse } from "next/server";
import { extractMemories } from "@/server/services/extraction";
import { storeExtraction } from "@/server/services/memoryStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId, message } = (await req.json()) as { userId?: string; message?: string };
    if (!userId || !message) {
      return NextResponse.json({ error: "userId and message are required" }, { status: 400 });
    }
    const extraction = await extractMemories(message);
    const created = await storeExtraction(userId, extraction);
    return NextResponse.json({ stored: created });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
