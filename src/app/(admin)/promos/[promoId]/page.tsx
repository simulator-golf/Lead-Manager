import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GenerateListButton from "./GenerateListButton";
import CallLogUploadForm from "./CallLogUploadForm";

export default async function PromoDetailPage({
  params,
}: PageProps<"/promos/[promoId]">) {
  const { promoId } = await params;

  const promo = await prisma.promo.findUnique({
    where: { id: promoId },
    include: {
      batches: {
        orderBy: { createdAt: "desc" },
        include: { groups: { select: { id: true } } },
      },
    },
  });

  if (!promo) notFound();

  const [totalLeads, calledCount] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { callLogs: { some: { promoId } } } }),
  ]);
  const remaining = totalLeads - calledCount;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/promos" className="text-sm text-gray-500 hover:text-gray-900">
          &larr; All promos
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-gray-900">{promo.name}</h1>
        {promo.notes && <p className="mt-1 text-sm text-gray-500">{promo.notes}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatBox label="Total leads" value={totalLeads} />
        <StatBox label="Already called" value={calledCount} />
        <StatBox label="Not yet called" value={remaining} highlight={remaining > 0} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold text-gray-900">Generate a call list</h2>
          <p className="mb-4 text-sm text-gray-500">
            Builds groups of 50 from every lead not yet marked called for this promo, balanced by
            revenue.
          </p>
          <GenerateListButton promoId={promo.id} disabled={remaining === 0} />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold text-gray-900">Upload call outcomes</h2>
          <p className="mb-4 text-sm text-gray-500">
            Upload a CSV export from your dialer (matched by phone or email) to mark those leads
            called for this promo.
          </p>
          <CallLogUploadForm promoId={promo.id} />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Lists generated for this promo</h2>
        </div>
        {promo.batches.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">No lists generated yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {promo.batches.map((batch) => (
              <li key={batch.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <Link href={`/batches/${batch.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                    {batch.label}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {batch.groups.length} group{batch.groups.length === 1 ? "" : "s"} ·{" "}
                    {batch.createdAt.toLocaleString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-amber-200 bg-amber-50" : "border-gray-200 bg-white"}`}>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${highlight ? "text-amber-700" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}
