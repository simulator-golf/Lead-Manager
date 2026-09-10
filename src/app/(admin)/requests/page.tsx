import { prisma } from "@/lib/prisma";
import FulfillButton from "./FulfillButton";

export default async function RequestsPage() {
  const requests = await prisma.listRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { promo: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">List Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Requests submitted from the public request form at{" "}
          <code className="rounded bg-gray-100 px-1 py-0.5">/request</code>. You get an email each
          time one comes in.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        {requests.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">No requests yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {requests.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {r.requesterName}
                    {r.requesterEmail ? ` · ${r.requesterEmail}` : ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    {r.promo ? `Promo: ${r.promo.name}` : "No specific promo"} ·{" "}
                    {r.createdAt.toLocaleString()}
                  </p>
                  {r.notes && <p className="mt-1 text-sm text-gray-700">{r.notes}</p>}
                </div>
                <div className="shrink-0 text-right">
                  {r.status === "fulfilled" ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                      Fulfilled
                    </span>
                  ) : (
                    <FulfillButton id={r.id} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
