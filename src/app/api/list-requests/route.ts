import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const requesterName = typeof body?.requesterName === "string" ? body.requesterName.trim() : "";
  const requesterEmail = typeof body?.requesterEmail === "string" ? body.requesterEmail.trim() : null;
  const notes = typeof body?.notes === "string" ? body.notes.trim() : null;
  const promoId = typeof body?.promoId === "string" && body.promoId ? body.promoId : null;

  if (!requesterName) {
    return NextResponse.json({ error: "Your name is required" }, { status: 400 });
  }

  let promo = null;
  if (promoId) {
    promo = await prisma.promo.findUnique({ where: { id: promoId } });
  }

  const listRequest = await prisma.listRequest.create({
    data: {
      requesterName,
      requesterEmail: requesterEmail || null,
      notes: notes || null,
      promoId: promo?.id ?? null,
    },
  });

  await sendNotificationEmail({
    subject: `New lead list request from ${requesterName}`,
    text: [
      `${requesterName} requested a new lead list.`,
      requesterEmail ? `Their email: ${requesterEmail}` : null,
      promo ? `Promo: ${promo.name}` : "No specific promo selected.",
      notes ? `Notes: ${notes}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return NextResponse.json({ ok: true, id: listRequest.id });
}
