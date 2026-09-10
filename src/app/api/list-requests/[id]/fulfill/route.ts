import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, ctx: RouteContext<"/api/list-requests/[id]/fulfill">) {
  const { id } = await ctx.params;

  const listRequest = await prisma.listRequest.update({
    where: { id },
    data: { status: "fulfilled", fulfilledAt: new Date() },
  });

  return NextResponse.json({ listRequest });
}
