import { NextRequest, NextResponse } from "next/server";
import { getGraph } from "@/server/services/memoryStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId query param is required" }, { status: 400 });
    const graph = await getGraph(userId);
    return NextResponse.json(graph);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
