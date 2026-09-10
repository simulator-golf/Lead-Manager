import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

export interface ParsedLeadRow {
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  revenue: number;
}

const NAME_KEYS = ["name", "full name", "fullname", "contact", "contact name", "lead name"];
const PHONE_KEYS = ["phone", "phone number", "cell", "mobile", "telephone"];
const EMAIL_KEYS = ["email", "e-mail", "email address"];
const COMPANY_KEYS = ["company", "business", "organization", "org"];
const REVENUE_KEYS = [
  "revenue",
  "spent",
  "total spent",
  "amount",
  "amount spent",
  "total revenue",
  "money spent",
  "value",
  "ltv",
];

function normalizeHeader(h: string) {
  return h.trim().toLowerCase();
}

function findKey(row: Record<string, string>, candidates: string[]): string | undefined {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const found = keys.find((k) => normalizeHeader(k) === candidate);
    if (found) return found;
  }
  return undefined;
}

function parseRevenue(raw: string | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

export class CsvValidationError extends Error {}

export function parseLeadsCsv(fileContents: string): ParsedLeadRow[] {
  let records: Record<string, string>[];
  try {
    records = parse(fileContents, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });
  } catch (err) {
    throw new CsvValidationError(
      `Could not parse CSV file: ${err instanceof Error ? err.message : "unknown error"}`,
    );
  }

  if (records.length === 0) {
    throw new CsvValidationError("The CSV file has no data rows.");
  }

  const firstRow = records[0];
  const nameKey = findKey(firstRow, NAME_KEYS);
  if (!nameKey) {
    throw new CsvValidationError(
      `Could not find a "name" column. Found columns: ${Object.keys(firstRow).join(", ")}`,
    );
  }
  const revenueKey = findKey(firstRow, REVENUE_KEYS);
  if (!revenueKey) {
    throw new CsvValidationError(
      `Could not find a revenue/spend column (e.g. "revenue" or "spent"). Found columns: ${Object.keys(
        firstRow,
      ).join(", ")}`,
    );
  }
  const phoneKey = findKey(firstRow, PHONE_KEYS);
  const emailKey = findKey(firstRow, EMAIL_KEYS);
  const companyKey = findKey(firstRow, COMPANY_KEYS);

  return records
    .map((row) => ({
      name: (row[nameKey] ?? "").trim(),
      phone: phoneKey ? (row[phoneKey] ?? "").trim() || null : null,
      email: emailKey ? (row[emailKey] ?? "").trim().toLowerCase() || null : null,
      company: companyKey ? (row[companyKey] ?? "").trim() || null : null,
      revenue: parseRevenue(row[revenueKey]),
    }))
    .filter((row) => row.name.length > 0);
}

export interface ParsedCallLogRow {
  phone: string | null;
  email: string | null;
  outcome: string | null;
}

export function parseCallLogCsv(fileContents: string): ParsedCallLogRow[] {
  let records: Record<string, string>[];
  try {
    records = parse(fileContents, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });
  } catch (err) {
    throw new CsvValidationError(
      `Could not parse CSV file: ${err instanceof Error ? err.message : "unknown error"}`,
    );
  }

  if (records.length === 0) {
    throw new CsvValidationError("The CSV file has no data rows.");
  }

  const firstRow = records[0];
  const phoneKey = findKey(firstRow, PHONE_KEYS);
  const emailKey = findKey(firstRow, EMAIL_KEYS);
  const outcomeKey = findKey(firstRow, ["outcome", "result", "status", "disposition", "notes"]);

  if (!phoneKey && !emailKey) {
    throw new CsvValidationError(
      `Could not find a "phone" or "email" column to match leads. Found columns: ${Object.keys(
        firstRow,
      ).join(", ")}`,
    );
  }

  return records
    .map((row) => ({
      phone: phoneKey ? (row[phoneKey] ?? "").trim() || null : null,
      email: emailKey ? (row[emailKey] ?? "").trim().toLowerCase() || null : null,
      outcome: outcomeKey ? (row[outcomeKey] ?? "").trim() || null : null,
    }))
    .filter((row) => row.phone || row.email);
}

export function leadsToCsv(
  rows: { name: string; phone: string | null; email: string | null; company: string | null; revenue: number }[],
): string {
  return stringify(rows, {
    header: true,
    columns: [
      { key: "name", header: "Name" },
      { key: "phone", header: "Phone" },
      { key: "email", header: "Email" },
      { key: "company", header: "Company" },
      { key: "revenue", header: "Revenue" },
    ],
  });
}
