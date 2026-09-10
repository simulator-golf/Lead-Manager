import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : null;

  if (!name) {
    return NextResponse.json({ error: "Promo name is required" }, { status: 400 });
  }

  const promo = await prisma.promo.create({ data: { name, notes: notes || null } });
  return NextResponse.json({ promo });
}
