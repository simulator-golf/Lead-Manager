"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GenerateListButton({ promoId, disabled }: { promoId: string; disabled: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setBatchId(null);
    try {
      const res = await fetch(`/api/promos/${promoId}/generate`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Could not generate list");
        return;
      }
      setBatchId(body.batchId);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleGenerate}
        disabled={disabled || loading}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate list"}
      </button>
      {disabled && !loading && (
        <p className="mt-2 text-xs text-gray-500">Everyone has already been called for this promo.</p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {batchId && (
        <p className="mt-2 text-sm text-green-700">
          List generated.{" "}
          <Link href={`/batches/${batchId}`} className="font-medium underline">
            View it
          </Link>
        </p>
      )}
    </div>
  );
}
