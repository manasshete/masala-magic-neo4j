import { NextResponse } from "next/server";
import { verifyConnection, ensureConstraintsOnce } from "@/server/services/neo4j";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureConstraintsOnce();
    const connected = await verifyConnection();
    return NextResponse.json({ ok: true, neo4j: connected });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
