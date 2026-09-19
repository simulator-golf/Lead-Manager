import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stringify } from "csv-stringify/sync";

export async function GET(_req: Request, ctx: RouteContext<"/api/batches/[batchId]/export">) {
  const { batchId } = await ctx.params;

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      groups: {
        orderBy: { groupNumber: "asc" },
        include: { members: { include: { lead: true }, orderBy: { revenue: "desc" } } },
      },
    },
  });

  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  const rows = batch.groups.flatMap((g) =>
    g.members.map((m) => ({
      group: g.name ?? `Group ${g.groupNumber}`,
      name: m.lead.name,
      phone: m.lead.phone ?? "",
      email: m.lead.email ?? "",
      company: m.lead.company ?? "",
      revenue: m.lead.revenue,
    })),
  );

  const csv = stringify(rows, {
    header: true,
    columns: [
      { key: "group", header: "Group" },
      { key: "name", header: "Name" },
      { key: "phone", header: "Phone" },
      { key: "email", header: "Email" },
      { key: "company", header: "Company" },
      { key: "revenue", header: "Revenue" },
    ],
  });

  const filename = `${batch.label.replace(/[^a-z0-9]+/gi, "-")}-all-groups.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
