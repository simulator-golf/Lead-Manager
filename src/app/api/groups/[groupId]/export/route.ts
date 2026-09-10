import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { leadsToCsv } from "@/lib/csv";

export async function GET(_req: Request, ctx: RouteContext<"/api/groups/[groupId]/export">) {
  const { groupId } = await ctx.params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      batch: true,
      members: { include: { lead: true }, orderBy: { revenue: "desc" } },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const csv = leadsToCsv(
    group.members.map((m) => ({
      name: m.lead.name,
      phone: m.lead.phone,
      email: m.lead.email,
      company: m.lead.company,
      revenue: m.lead.revenue,
    })),
  );

  const filename = `${group.batch.label.replace(/[^a-z0-9]+/gi, "-")}-group-${group.groupNumber}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
