import { NextRequest, NextResponse } from "next/server";

import { isStaffAlertAuthenticated } from "@/lib/staff-alert/auth";
import { getVapidPublicKey, isVapidConfigured } from "@/lib/staff-alert/vapid";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await isStaffAlertAuthenticated(request))) {
    return NextResponse.json(
      { ok: false, error: "Требуется авторизация" },
      { status: 401 }
    );
  }

  if (!isVapidConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "VAPID не настроен на сервере. Добавьте VAPID_PUBLIC_KEY и VAPID_PRIVATE_KEY в переменные окружения.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    ok: true,
    publicKey: getVapidPublicKey(),
  });
}
