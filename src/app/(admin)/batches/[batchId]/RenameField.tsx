"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RenameField({
  value,
  endpoint,
  field,
  textClassName,
  inputClassName,
}: {
  value: string;
  endpoint: string;
  field: string;
  textClassName: string;
  inputClassName: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      setEditing(false);
      setDraft(value);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: trimmed }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Could not rename");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    setEditing(false);
    setDraft(value);
    setError(null);
  }

  if (editing) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            className={inputClassName}
          />
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={cancel} className="text-xs text-gray-500 hover:text-gray-700">
            Cancel
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`group inline-flex items-center gap-2 text-left ${textClassName}`}
      title="Click to rename"
    >
      {value}
      <span className="text-xs font-normal text-gray-400 opacity-0 group-hover:opacity-100">
        rename
      </span>
    </button>
  );
}
