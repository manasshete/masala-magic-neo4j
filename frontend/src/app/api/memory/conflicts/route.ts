import { NextRequest, NextResponse } from "next/server";
import { detectConflicts } from "@/server/services/conflict";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { userId } = (await req.json()) as { userId?: string };
    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });
    const conflicts = await detectConflicts(userId);
    return NextResponse.json({ conflicts });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
