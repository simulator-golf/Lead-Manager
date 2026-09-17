import { timingSafeEqual } from "crypto";

/** Checks a `?token=` query param against EXPORT_TOKEN for unauthenticated
 * feed endpoints (e.g. Google Sheets' IMPORTDATA, which can't send cookies
 * or custom headers). */
export function isValidExportToken(candidate: string | null): boolean {
  const expected = process.env.EXPORT_TOKEN;
  if (!expected || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
