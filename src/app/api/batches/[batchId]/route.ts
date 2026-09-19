import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, ctx: RouteContext<"/api/batches/[batchId]">) {
  const { batchId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label.trim() : "";

  if (!label) {
    return NextResponse.json({ error: "Label cannot be empty" }, { status: 400 });
  }

  const batch = await prisma.batch.update({
    where: { id: batchId },
    data: { label },
  });

  return NextResponse.json({ batch });
}
