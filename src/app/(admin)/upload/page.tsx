"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UploadResult {
  batchId: string;
  leadCount: number;
  groupCount: number;
}

export default function UploadPage() {
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
      const res = await fetch("/api/leads/upload", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Upload failed");
        return;
      }
      setResult(body);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Upload Leads</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload a CSV of leads to cold call. It needs a <code>name</code> column and a revenue
          column (<code>revenue</code>, <code>spent</code>, or similar). <code>phone</code>,{" "}
          <code>email</code>, and <code>company</code> columns are optional but recommended.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          The list is automatically split into groups of 50, with total revenue balanced as evenly
          as possible across groups.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">CSV file</label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800"
        />

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={!file || loading}
          className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload & generate groups"}
        </button>
      </form>

      {result && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          Uploaded {result.leadCount} leads and generated {result.groupCount} group
          {result.groupCount === 1 ? "" : "s"} of 50.{" "}
          <Link href={`/batches/${result.batchId}`} className="font-medium underline">
            View the list
          </Link>
        </div>
      )}
    </div>
  );
}
