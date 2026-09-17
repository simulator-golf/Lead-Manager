import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidExportToken } from "@/lib/exportAuth";
import { stringify } from "csv-stringify/sync";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!isValidExportToken(token)) {
    return NextResponse.json({ error: "Invalid or missing token" }, { status: 401 });
  }

  const [leads, promos, callLogs] = await Promise.all([
    prisma.lead.findMany({ orderBy: { name: "asc" } }),
    prisma.promo.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.callLog.findMany({ select: { leadId: true, promoId: true, calledAt: true } }),
  ]);

  const calledAt = new Map<string, Date>();
  for (const log of callLogs) {
    calledAt.set(`${log.leadId}:${log.promoId}`, log.calledAt);
  }

  const columns = [
    { key: "name", header: "Name" },
    { key: "phone", header: "Phone" },
    { key: "email", header: "Email" },
    { key: "company", header: "Company" },
    { key: "revenue", header: "Revenue" },
    ...promos.map((p) => ({ key: p.id, header: p.name })),
  ];

  const rows = leads.map((lead) => {
    const row: Record<string, string | number> = {
      name: lead.name,
      phone: lead.phone ?? "",
      email: lead.email ?? "",
      company: lead.company ?? "",
      revenue: lead.revenue,
    };
    for (const promo of promos) {
      const called = calledAt.get(`${lead.id}:${promo.id}`);
      row[promo.id] = called ? called.toISOString().slice(0, 10) : "";
    }
    return row;
  });

  const csv = stringify(rows, { header: true, columns });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
