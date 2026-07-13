import { NextRequest, NextResponse } from "next/server";

import { isStaffAlertAuthenticated } from "@/lib/staff-alert/auth";
import { getLastStaffAlert } from "@/lib/staff-alert/last-alert";

export const runtime = "nodejs";

/**
 * Poll для десктопного приложения в трее.
 * Auth: cookie сессии Staff Alert ИЛИ
 *   Authorization: Bearer <STAFF_ALERT_PASSWORD>
 *   X-Staff-Alert-Password: <STAFF_ALERT_PASSWORD>
 */
export async function GET(request: NextRequest) {
  if (!(await isStaffAlertAuthenticated(request))) {
    return NextResponse.json(
      { ok: false, error: "Требуется авторизация" },
      { status: 401 }
    );
  }

  const last = await getLastStaffAlert();
  return NextResponse.json({
    ok: true,
    alert: last,
  });
}
