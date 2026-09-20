import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rawLeadsToCsv } from "@/lib/csv";

export async function GET(_req: Request, ctx: RouteContext<"/api/batches/[batchId]/export">) {
  const { batchId } = await ctx.params;

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      groups: {
        orderBy: { groupNumber: "asc" },
        include: {
          members: {
            include: { lead: { include: { upload: { select: { columns: true } } } } },
            orderBy: { revenue: "desc" },
          },
        },
      },
    },
  });

  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  const leads = batch.groups.flatMap((g) =>
    g.members.map((m) => ({ ...m.lead, columnOrder: m.lead.upload?.columns })),
  );
  const groupLabels = batch.groups.flatMap((g) =>
    g.members.map(() => g.name ?? `Group ${g.groupNumber}`),
  );

  const csv = rawLeadsToCsv(leads, { header: "Group", values: groupLabels });

  const filename = `${batch.label.replace(/[^a-z0-9]+/gi, "-")}-all-groups.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
