import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildBalancedGroups } from "@/lib/grouping";

export async function POST(_req: Request, ctx: RouteContext<"/api/promos/[promoId]/generate">) {
  const { promoId } = await ctx.params;

  const promo = await prisma.promo.findUnique({ where: { id: promoId } });
  if (!promo) {
    return NextResponse.json({ error: "Promo not found" }, { status: 404 });
  }

  const leads = await prisma.lead.findMany({
    where: {
      callLogs: { none: { promoId } },
    },
  });

  if (leads.length === 0) {
    return NextResponse.json(
      { error: "Every lead has already been called for this promo. Nothing to generate." },
      { status: 400 },
    );
  }

  const groups = buildBalancedGroups(
    leads.map((l) => ({ id: l.id, revenue: l.revenue })),
    50,
  );

  const batch = await prisma.batch.create({
    data: {
      label: `Promo: ${promo.name} - ${new Date().toLocaleDateString()}`,
      promoId: promo.id,
      groups: {
        create: groups.map((g) => ({
          groupNumber: g.groupNumber,
          totalRevenue: g.totalRevenue,
          members: {
            create: g.members.map((m) => ({
              leadId: m.id,
              revenue: m.revenue,
            })),
          },
        })),
      },
    },
  });

  return NextResponse.json({
    batchId: batch.id,
    leadCount: leads.length,
    groupCount: groups.length,
  });
}
