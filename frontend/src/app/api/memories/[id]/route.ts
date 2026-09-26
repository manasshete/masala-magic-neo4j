import { NextResponse } from "next/server";
import { getMemoryById } from "@/server/services/memoryStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { node, related } = await getMemoryById(id);
    if (!node) return NextResponse.json({ error: "Memory not found" }, { status: 404 });
    return NextResponse.json({ memory: node, related });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
