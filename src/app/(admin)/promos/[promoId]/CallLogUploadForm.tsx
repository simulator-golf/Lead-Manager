"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UploadResult {
  rowsInFile: number;
  matched: number;
  newlyMarkedCalled: number;
  alreadyMarkedCalled: number;
  unmatched: number;
}

export default function CallLogUploadForm({ promoId }: { promoId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/promos/${promoId}/call-log`, { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Upload failed");
        return;
      }
      setResult(body);
      setFile(null);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
      />
      <button
        type="submit"
        disabled={!file || loading}
        className="mt-3 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload call log"}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {result && (
        <p className="mt-2 text-sm text-green-700">
          Marked {result.newlyMarkedCalled} lead{result.newlyMarkedCalled === 1 ? "" : "s"} as called
          {result.alreadyMarkedCalled > 0 ? ` (${result.alreadyMarkedCalled} already were)` : ""}.
          {result.unmatched > 0 ? ` ${result.unmatched} row(s) didn't match any lead.` : ""}
        </p>
      )}
    </form>
  );
}
