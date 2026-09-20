"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteUploadButton({
  uploadId,
  filename,
  leadCount,
}: {
  uploadId: string;
  filename: string;
  leadCount: number;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${filename}" and all ${leadCount} lead${leadCount === 1 ? "" : "s"} from it?\n\n` +
        `This also removes them from any promo lists or groups they're currently in, and can't be undone.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/uploads/${uploadId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Could not delete");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="text-right">
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
