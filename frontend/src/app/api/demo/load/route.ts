import { NextRequest, NextResponse } from "next/server";
import { seedDemoData, DEMO_USER_ID } from "@/server/services/demoSeed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = (body?.userId as string) || DEMO_USER_ID;
    await seedDemoData(userId);
    return NextResponse.json({ ok: true, userId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
