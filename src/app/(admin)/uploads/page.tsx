import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteUploadButton from "./DeleteUploadButton";

export default async function UploadsPage() {
  const uploads = await prisma.upload.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { leads: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Uploads</h1>
        <p className="mt-1 text-sm text-gray-500">
          Every CSV you&apos;ve uploaded. Deleting one removes its leads entirely (and any call
          history or group placements tied to them) — do this before re-uploading a corrected
          version of the same file, otherwise you&apos;ll end up with duplicates.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        {uploads.length === 0 ? (
          <p className="px-4 py-6 text-sm text-gray-500">
            No uploads yet. <Link href="/upload" className="underline">Upload a CSV</Link> to get
            started.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {uploads.map((upload) => (
              <li key={upload.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{upload.filename}</p>
                  <p className="text-xs text-gray-500">
                    {upload._count.leads} lead{upload._count.leads === 1 ? "" : "s"}{" "}
                    (uploaded with {upload.rowCount}) · {upload.createdAt.toLocaleString()}
                  </p>
                </div>
                <DeleteUploadButton
                  uploadId={upload.id}
                  filename={upload.filename}
                  leadCount={upload._count.leads}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
