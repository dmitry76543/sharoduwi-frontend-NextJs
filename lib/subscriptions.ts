import { promises as fs } from "fs";
import path from "path";
import type { PushSubscription } from "web-push";

export type AlarmSoundId = 0 | 1 | 2;

export type StoredPushSubscription = PushSubscription & {
  soundId?: AlarmSoundId;
};

function isAlarmSoundId(value: number): value is AlarmSoundId {
  return value === 0 || value === 1 || value === 2;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "subscriptions.json");

async function readAll(): Promise<StoredPushSubscription[]> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    return JSON.parse(raw) as StoredPushSubscription[];
  } catch {
    return [];
  }
}

async function writeAll(subs: StoredPushSubscription[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(subs, null, 2), "utf-8");
}

function normalizeSoundId(value: unknown): AlarmSoundId | undefined {
  if (typeof value !== "number" || !isAlarmSoundId(value)) return undefined;
  return value;
}

export async function upsertSubscription(
  sub: PushSubscription,
  soundId?: AlarmSoundId
): Promise<number> {
  const subs = await readAll();
  const index = subs.findIndex((item) => item.endpoint === sub.endpoint);
  const normalizedSound = normalizeSoundId(soundId);

  if (index >= 0) {
    subs[index] = {
      ...subs[index],
      ...sub,
      ...(normalizedSound !== undefined ? { soundId: normalizedSound } : {}),
    };
  } else {
    subs.push({
      ...sub,
      ...(normalizedSound !== undefined ? { soundId: normalizedSound } : {}),
    });
  }

  await writeAll(subs);
  return subs.length;
}

export async function updateSubscriptionSound(
  endpoint: string,
  soundId: AlarmSoundId
): Promise<boolean> {
  const subs = await readAll();
  const index = subs.findIndex((item) => item.endpoint === endpoint);
  if (index < 0) return false;

  subs[index] = { ...subs[index], soundId };
  await writeAll(subs);
  return true;
}

export async function getSubscriptionSound(
  endpoint: string
): Promise<AlarmSoundId | null> {
  const subs = await readAll();
  const found = subs.find((item) => item.endpoint === endpoint);
  if (!found || found.soundId === undefined) return null;
  return isAlarmSoundId(found.soundId) ? found.soundId : null;
}

export async function getSubscriptions(): Promise<StoredPushSubscription[]> {
  return readAll();
}

export async function removeSubscription(endpoint: string): Promise<void> {
  const subs = await readAll();
  await writeAll(subs.filter((item) => item.endpoint !== endpoint));
}

export async function addSubscription(
  sub: PushSubscription,
  soundId?: AlarmSoundId
): Promise<number> {
  return upsertSubscription(sub, soundId);
}
