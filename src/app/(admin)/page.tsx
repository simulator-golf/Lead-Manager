import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [leadCount, promoCount, batchCount, pendingRequests, recentBatches] = await Promise.all([
    prisma.lead.count(),
    prisma.promo.count(),
    prisma.batch.count(),
    prisma.listRequest.count({ where: { status: "pending" } }),
    prisma.batch.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { promo: true, groups: { select: { id: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">An overview of your leads, promos, and lists.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total leads" value={leadCount} href="/upload" />
        <StatCard label="Promos" value={promoCount} href="/promos" />
        <StatCard label="Lists generated" value={batchCount} href="/batches" />
        <StatCard label="Pending requests" value={pendingRequests} href="/requests" highlight={pendingRequests > 0} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Recent lists</h2>
          <Link href="/batches" className="text-sm text-gray-500 hover:text-gray-900">
            View all
          </Link>
        </div>
        {recentBatches.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">
            No lists yet. <Link href="/upload" className="underline">Upload a CSV of leads</Link> to get started.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentBatches.map((batch) => (
              <li key={batch.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <Link href={`/batches/${batch.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                    {batch.label}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {batch.groups.length} group{batch.groups.length === 1 ? "" : "s"} of 50
                    {batch.promo ? ` · Promo: ${batch.promo.name}` : ""} ·{" "}
                    {batch.createdAt.toLocaleDateString()}
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

function StatCard({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg border p-4 hover:shadow-sm ${
        highlight ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
      }`}
    >
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${highlight ? "text-red-600" : "text-gray-900"}`}>{value}</p>
    </Link>
  );
}
