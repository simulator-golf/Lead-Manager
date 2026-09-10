import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function BatchDetailPage({
  params,
}: PageProps<"/batches/[batchId]">) {
  const { batchId } = await params;

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      promo: true,
      groups: {
        orderBy: { groupNumber: "asc" },
        include: { members: { include: { lead: true }, orderBy: { revenue: "desc" } } },
      },
    },
  });

  if (!batch) notFound();

  const totalLeads = batch.groups.reduce((sum, g) => sum + g.members.length, 0);
  const totalRevenue = batch.groups.reduce((sum, g) => sum + g.totalRevenue, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/batches" className="text-sm text-gray-500 hover:text-gray-900">
          &larr; All lists
        </Link>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">{batch.label}</h1>
          <a
            href={`/api/batches/${batch.id}/export`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Download all groups (CSV)
          </a>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {batch.groups.length} groups · {totalLeads} leads · $
          {totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} total revenue
          {batch.promo ? (
            <>
              {" · "}Promo:{" "}
              <Link href={`/promos/${batch.promo.id}`} className="underline">
                {batch.promo.name}
              </Link>
            </>
          ) : null}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {batch.groups.map((group) => (
          <div key={group.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Group {group.groupNumber}</h2>
              <a
                href={`/api/groups/${group.id}/export`}
                className="text-xs font-medium text-gray-600 underline hover:text-gray-900"
              >
                Download CSV
              </a>
            </div>
            <p className="mb-3 text-xs text-gray-500">
              {group.members.length} leads · $
              {group.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} revenue
            </p>
            <ul className="max-h-48 space-y-1 overflow-y-auto text-xs text-gray-700">
              {group.members.slice(0, 8).map((m) => (
                <li key={m.id} className="flex justify-between gap-2">
                  <span className="truncate">{m.lead.name}</span>
                  <span className="shrink-0 text-gray-400">
                    ${m.lead.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </li>
              ))}
              {group.members.length > 8 && (
                <li className="text-gray-400">+{group.members.length - 8} more</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
