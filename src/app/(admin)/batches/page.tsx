import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function BatchesPage() {
  const batches = await prisma.batch.findMany({
    orderBy: { createdAt: "desc" },
    include: { promo: true, groups: { select: { id: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Lists</h1>
        <p className="mt-1 text-sm text-gray-500">
          Every batch of groups-of-50 generated from an upload or a promo.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        {batches.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">
            No lists yet. <Link href="/upload" className="underline">Upload leads</Link> to generate
            your first one.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {batches.map((batch) => (
              <li key={batch.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <Link href={`/batches/${batch.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                    {batch.label}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {batch.groups.length} group{batch.groups.length === 1 ? "" : "s"} of 50
                    {batch.promo ? ` · Promo: ${batch.promo.name}` : ""} ·{" "}
                    {batch.createdAt.toLocaleString()}
                  </p>
                </div>
                <Link
                  href={`/batches/${batch.id}`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
