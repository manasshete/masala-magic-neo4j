import { NextRequest, NextResponse } from "next/server";
import { addOutcome } from "@/server/services/memoryStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId, decisionId, content, sentiment } = (await req.json()) as {
      userId?: string;
      decisionId?: string;
      content?: string;
      sentiment?: "positive" | "negative" | "neutral";
    };
    if (!userId || !decisionId || !content) {
      return NextResponse.json(
        { error: "userId, decisionId and content are required" },
        { status: 400 }
      );
    }
    const outcome = await addOutcome(userId, decisionId, content, sentiment ?? "neutral");
    return NextResponse.json({ outcome });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
