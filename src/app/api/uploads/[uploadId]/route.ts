import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, ctx: RouteContext<"/api/uploads/[uploadId]">) {
  const { uploadId } = await ctx.params;

  const upload = await prisma.upload.findUnique({ where: { id: uploadId } });
  if (!upload) {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 });
  }

  const leads = await prisma.lead.findMany({ where: { uploadId }, select: { id: true } });
  const leadIds = leads.map((l) => l.id);

  await prisma.$transaction(async (tx) => {
    if (leadIds.length > 0) {
      // These leads may also sit in groups from promo-generated lists that
      // pulled in leads from multiple uploads, so clear those references
      // (and any call history) before the leads themselves can be deleted.
      await tx.groupMember.deleteMany({ where: { leadId: { in: leadIds } } });
      await tx.callLog.deleteMany({ where: { leadId: { in: leadIds } } });
      await tx.lead.deleteMany({ where: { uploadId } });
    }

    // A group or batch left with nothing in it after that is just clutter.
    const emptyGroups = await tx.group.findMany({
      where: { members: { none: {} } },
      select: { id: true },
    });
    if (emptyGroups.length > 0) {
      await tx.group.deleteMany({ where: { id: { in: emptyGroups.map((g) => g.id) } } });
    }

    const emptyBatches = await tx.batch.findMany({
      where: { groups: { none: {} } },
      select: { id: true },
    });
    if (emptyBatches.length > 0) {
      await tx.batch.deleteMany({ where: { id: { in: emptyBatches.map((b) => b.id) } } });
    }

    await tx.upload.delete({ where: { id: uploadId } });
  });

  return NextResponse.json({ ok: true, deletedLeads: leadIds.length });
}
