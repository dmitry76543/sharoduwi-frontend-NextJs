import { promises as fs } from "fs";
import path from "path";

export type LastStaffAlert = {
  orderId: string;
  title: string;
  body: string;
  at: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "last-staff-alert.json");

export async function recordLastStaffAlert(
  alert: Omit<LastStaffAlert, "at"> & { at?: string }
): Promise<LastStaffAlert> {
  const payload: LastStaffAlert = {
    orderId: alert.orderId,
    title: alert.title,
    body: alert.body,
    at: alert.at || new Date().toISOString(),
  };

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(payload, null, 2), "utf-8");
  return payload;
}

export async function getLastStaffAlert(): Promise<LastStaffAlert | null> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    const parsed = JSON.parse(raw) as LastStaffAlert;
    if (!parsed?.orderId || !parsed?.at) return null;
    return parsed;
  } catch {
    return null;
  }
}
