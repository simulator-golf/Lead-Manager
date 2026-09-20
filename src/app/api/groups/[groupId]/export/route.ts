import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rawLeadsToCsv } from "@/lib/csv";

export async function GET(_req: Request, ctx: RouteContext<"/api/groups/[groupId]/export">) {
  const { groupId } = await ctx.params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      batch: true,
      members: {
        include: { lead: { include: { upload: { select: { columns: true } } } } },
        orderBy: { revenue: "desc" },
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const csv = rawLeadsToCsv(
    group.members.map((m) => ({ ...m.lead, columnOrder: m.lead.upload?.columns })),
  );

  const groupLabel = group.name ?? `group-${group.groupNumber}`;
  const filename = `${group.batch.label.replace(/[^a-z0-9]+/gi, "-")}-${groupLabel.replace(/[^a-z0-9]+/gi, "-")}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
