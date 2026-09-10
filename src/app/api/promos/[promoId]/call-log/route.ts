import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCallLogCsv, CsvValidationError } from "@/lib/csv";
import { normalizePhone, normalizeEmail } from "@/lib/match";

export async function POST(req: Request, ctx: RouteContext<"/api/promos/[promoId]/call-log">) {
  const { promoId } = await ctx.params;

  const promo = await prisma.promo.findUnique({ where: { id: promoId } });
  if (!promo) {
    return NextResponse.json({ error: "Promo not found" }, { status: 404 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const contents = await file.text();
  let rows;
  try {
    rows = parseCallLogCsv(contents);
  } catch (err) {
    if (err instanceof CsvValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  const allLeads = await prisma.lead.findMany({ select: { id: true, phone: true, email: true } });
  const byPhone = new Map<string, string>();
  const byEmail = new Map<string, string>();
  for (const lead of allLeads) {
    const phone = normalizePhone(lead.phone);
    const email = normalizeEmail(lead.email);
    if (phone) byPhone.set(phone, lead.id);
    if (email) byEmail.set(email, lead.id);
  }

  const matchedLeadIds = new Set<string>();
  let unmatched = 0;

  for (const row of rows) {
    const phone = normalizePhone(row.phone);
    const email = normalizeEmail(row.email);
    const leadId = (phone && byPhone.get(phone)) || (email && byEmail.get(email));
    if (leadId) {
      matchedLeadIds.add(leadId);
    } else {
      unmatched++;
    }
  }

  // Avoid duplicate call-log rows for leads already marked called for this promo.
  const alreadyLogged = await prisma.callLog.findMany({
    where: { promoId, leadId: { in: Array.from(matchedLeadIds) } },
    select: { leadId: true },
  });
  const alreadyLoggedSet = new Set(alreadyLogged.map((c) => c.leadId));
  const toCreate = Array.from(matchedLeadIds).filter((id) => !alreadyLoggedSet.has(id));

  if (toCreate.length > 0) {
    await prisma.callLog.createMany({
      data: toCreate.map((leadId) => ({ promoId, leadId })),
    });
  }

  return NextResponse.json({
    rowsInFile: rows.length,
    matched: matchedLeadIds.size,
    newlyMarkedCalled: toCreate.length,
    alreadyMarkedCalled: alreadyLoggedSet.size,
    unmatched,
  });
}
