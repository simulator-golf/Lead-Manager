import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseLeadsCsv, CsvValidationError } from "@/lib/csv";
import { buildBalancedGroups } from "@/lib/grouping";

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const contents = await file.text();

  let rows;
  try {
    rows = parseLeadsCsv(contents);
  } catch (err) {
    if (err instanceof CsvValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "No valid rows found in the CSV." }, { status: 400 });
  }

  const upload = await prisma.upload.create({
    data: {
      filename: file.name || "upload.csv",
      rowCount: rows.length,
      leads: {
        create: rows.map((r) => ({
          name: r.name,
          phone: r.phone,
          email: r.email,
          company: r.company,
          revenue: r.revenue,
        })),
      },
    },
    include: { leads: true },
  });

  const groups = buildBalancedGroups(
    upload.leads.map((l) => ({ id: l.id, revenue: l.revenue })),
    50,
  );

  const batch = await prisma.batch.create({
    data: {
      label: `Upload: ${upload.filename}`,
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
    uploadId: upload.id,
    batchId: batch.id,
    leadCount: rows.length,
    groupCount: groups.length,
  });
}
