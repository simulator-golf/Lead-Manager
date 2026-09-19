import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, ctx: RouteContext<"/api/groups/[groupId]">) {
  const { groupId } = await ctx.params;
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
  }

  const group = await prisma.group.update({
    where: { id: groupId },
    data: { name },
  });

  return NextResponse.json({ group });
}
