import { NextRequest, NextResponse } from "next/server";
import type { PushSubscription } from "web-push";

import { isStaffAlertAuthenticated } from "@/lib/staff-alert/auth";
import {
  getSubscriptionSound,
  removeSubscription,
  updateSubscriptionSound,
  upsertSubscription,
  type AlarmSoundId,
} from "@/lib/subscriptions";

export const runtime = "nodejs";

function isAlarmSoundId(value: number): value is AlarmSoundId {
  return value === 0 || value === 1 || value === 2;
}

type SubscribeBody = {
  subscription?: PushSubscription;
  soundId?: number;
};

type SoundBody = {
  endpoint?: string;
  soundId?: number;
};

type UnsubscribeBody = {
  endpoint?: string;
};

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "Требуется авторизация" },
    { status: 401 }
  );
}

function parseSubscription(value: unknown): PushSubscription | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as PushSubscription;
  if (
    !candidate.endpoint ||
    !candidate.keys?.p256dh ||
    !candidate.keys?.auth
  ) {
    return null;
  }

  return candidate;
}

export async function GET(request: NextRequest) {
  if (!(await isStaffAlertAuthenticated(request))) return unauthorized();

  const endpoint = request.nextUrl.searchParams.get("sound");
  if (!endpoint) {
    return NextResponse.json(
      { ok: false, error: "Не указан endpoint подписки" },
      { status: 400 }
    );
  }

  const soundId = await getSubscriptionSound(endpoint);
  return NextResponse.json({ ok: true, soundId });
}

export async function POST(request: NextRequest) {
  if (!(await isStaffAlertAuthenticated(request))) return unauthorized();

  try {
    const body = (await request.json()) as SubscribeBody;
    const subscription = parseSubscription(body.subscription);

    if (!subscription) {
      return NextResponse.json(
        { ok: false, error: "Некорректная push-подписка" },
        { status: 400 }
      );
    }

    const soundId =
      typeof body.soundId === "number" && isAlarmSoundId(body.soundId)
        ? (body.soundId as AlarmSoundId)
        : undefined;

    const total = await upsertSubscription(subscription, soundId);
    return NextResponse.json({ ok: true, total });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Ошибка сервера",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isStaffAlertAuthenticated(request))) return unauthorized();

  try {
    const body = (await request.json()) as SoundBody;
    const endpoint = body.endpoint?.trim();
    const soundId = body.soundId;

    if (!endpoint) {
      return NextResponse.json(
        { ok: false, error: "Не указан endpoint подписки" },
        { status: 400 }
      );
    }

    if (typeof soundId !== "number" || !isAlarmSoundId(soundId)) {
      return NextResponse.json(
        { ok: false, error: "Некорректный сигнал" },
        { status: 400 }
      );
    }

    const updated = await updateSubscriptionSound(endpoint, soundId);
    if (!updated) {
      return NextResponse.json(
        { ok: false, error: "Подписка не найдена. Сначала подпишитесь на сигналы." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, soundId });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Ошибка сервера",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isStaffAlertAuthenticated(request))) return unauthorized();

  try {
    const body = (await request.json()) as UnsubscribeBody;
    const endpoint = body.endpoint?.trim();

    if (!endpoint) {
      return NextResponse.json(
        { ok: false, error: "Не указан endpoint подписки" },
        { status: 400 }
      );
    }

    await removeSubscription(endpoint);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Ошибка сервера",
      },
      { status: 500 }
    );
  }
}
