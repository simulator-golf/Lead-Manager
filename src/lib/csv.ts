import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

export interface ParsedLeadRow {
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  revenue: number;
  /** The original row exactly as it appeared in the uploaded file, keyed by
   * its original column headers — used so exports can match the import. */
  raw: Record<string, string>;
}

const NAME_KEYS = ["name", "full name", "fullname", "contact", "contact name", "lead name"];
const FIRST_NAME_KEYS = ["first name", "firstname", "first"];
const LAST_NAME_KEYS = ["last name", "lastname", "last", "surname"];
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
  "lifetime spend",
  "lifetime value",
  "total lifetime spend",
  "customer lifetime value",
  "clv",
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

function isRowBlank(raw: Record<string, string>): boolean {
  return Object.values(raw).every((v) => !v || v.trim() === "");
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
  const firstNameKey = findKey(firstRow, FIRST_NAME_KEYS);
  const lastNameKey = findKey(firstRow, LAST_NAME_KEYS);
  const revenueKey = findKey(firstRow, REVENUE_KEYS);
  if (!revenueKey) {
    throw new CsvValidationError(
      `Could not find a revenue/spend column (e.g. "revenue", "spent", or "lifetime spend"). Found columns: ${Object.keys(
        firstRow,
      ).join(", ")}`,
    );
  }
  const phoneKey = findKey(firstRow, PHONE_KEYS);
  const emailKey = findKey(firstRow, EMAIL_KEYS);
  const companyKey = findKey(firstRow, COMPANY_KEYS);

  return records
    .filter((row) => !isRowBlank(row))
    .map((row) => {
      const phone = phoneKey ? (row[phoneKey] ?? "").trim() || null : null;
      const email = emailKey ? (row[emailKey] ?? "").trim().toLowerCase() || null : null;

      let name = nameKey ? (row[nameKey] ?? "").trim() : "";
      if (!name) {
        const first = firstNameKey ? (row[firstNameKey] ?? "").trim() : "";
        const last = lastNameKey ? (row[lastNameKey] ?? "").trim() : "";
        name = `${first} ${last}`.trim();
      }
      // Keep every row that has real data, even with nothing to call it by.
      if (!name) name = email ?? phone ?? "(no name)";

      return {
        name,
        phone,
        email,
        company: companyKey ? (row[companyKey] ?? "").trim() || null : null,
        revenue: parseRevenue(row[revenueKey]),
        raw: row,
      };
    });
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

export interface ExportableLead {
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  revenue: number;
  rawData: unknown;
  /** Original CSV header order for this lead's upload, if known. Postgres's
   * Json storage doesn't preserve key order, so this is how column order in
   * exports is kept faithful to the source file. */
  columnOrder?: string[] | null;
}

function leadRawRow(lead: ExportableLead): { raw: Record<string, string>; order: string[] } {
  if (lead.rawData && typeof lead.rawData === "object" && !Array.isArray(lead.rawData)) {
    const raw = lead.rawData as Record<string, string>;
    const order = lead.columnOrder && lead.columnOrder.length > 0 ? lead.columnOrder : Object.keys(raw);
    return { raw, order };
  }
  // Leads from before rawData existed: fall back to the normalized fields.
  const raw = {
    Name: lead.name,
    Phone: lead.phone ?? "",
    Email: lead.email ?? "",
    Company: lead.company ?? "",
    Revenue: String(lead.revenue),
  };
  return { raw, order: Object.keys(raw) };
}

/**
 * Builds a CSV that mirrors the original uploaded file's columns and values
 * as closely as possible, rather than the app's normalized fields. Leads
 * from different uploads (or different original column sets) are merged by
 * taking the union of every column seen, in first-seen order; a lead
 * missing a given column just gets a blank cell for it.
 *
 * Pass `extraColumn` to prepend an extra column (e.g. which group a lead
 * ended up in) with one value per lead, in the same order as `leads`.
 */
export function rawLeadsToCsv(
  leads: ExportableLead[],
  extraColumn?: { header: string; values: string[] },
): string {
  const rows = leads.map(leadRawRow);

  const headers: string[] = [];
  const seen = new Set<string>();
  for (const { order } of rows) {
    for (const key of order) {
      if (!seen.has(key)) {
        seen.add(key);
        headers.push(key);
      }
    }
  }

  const allHeaders = extraColumn ? [extraColumn.header, ...headers] : headers;

  const filledRows = rows.map(({ raw }, i) => {
    const row: Record<string, string> = {};
    if (extraColumn) row[extraColumn.header] = extraColumn.values[i];
    for (const h of headers) row[h] = raw[h] ?? "";
    return row;
  });

  return stringify(filledRows, {
    header: true,
    columns: allHeaders.map((h) => ({ key: h, header: h })),
  });
}
