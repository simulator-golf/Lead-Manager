import { prisma } from "@/lib/prisma";
import RequestForm from "./RequestForm";

export const dynamic = "force-dynamic";

export default async function RequestPage() {
  const promos = await prisma.promo.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-1 text-xl font-semibold text-gray-900">Request a lead list</h1>
        <p className="mb-6 text-sm text-gray-500">
          Fill this out and we&apos;ll get a fresh call list put together for you.
        </p>
        <RequestForm promos={promos} />
      </div>
    </div>
  );
}
