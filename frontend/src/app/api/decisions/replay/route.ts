import { NextRequest, NextResponse } from "next/server";
import { replayDecision } from "@/server/services/decisionReplay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId, question } = (await req.json()) as { userId?: string; question?: string };
    if (!userId || !question) {
      return NextResponse.json({ error: "userId and question are required" }, { status: 400 });
    }
    const result = await replayDecision(userId, question);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
