import Link from "next/link";
import { prisma } from "@/lib/prisma";
import NewPromoForm from "./NewPromoForm";

export default async function PromosPage() {
  const promos = await prisma.promo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { callLogs: true } },
      batches: { select: { id: true } },
    },
  });

  const totalLeads = await prisma.lead.count();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Promos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a promo, then generate a call list of everyone who hasn&apos;t been called for it
          yet.
        </p>
      </div>

      <NewPromoForm />

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">All promos</h2>
        </div>
        {promos.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">No promos yet. Create one above.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {promos.map((promo) => (
              <li key={promo.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <Link href={`/promos/${promo.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                    {promo.name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {promo._count.callLogs} of {totalLeads} leads called · {promo.batches.length} list
                    {promo.batches.length === 1 ? "" : "s"} generated
                  </p>
                </div>
                <Link
                  href={`/promos/${promo.id}`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Manage
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
