import { NextRequest, NextResponse } from "next/server";
import { getAllMemories } from "@/server/services/memoryStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId query param is required" }, { status: 400 });
    const memories = await getAllMemories(userId);
    return NextResponse.json({ memories });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
