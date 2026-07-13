import { timingSafeEqual } from "crypto";

import { STAFF_ALERT_COOKIE } from "@/lib/staff-alert/constants";
import {
  createStaffAlertSessionToken,
  isValidStaffAlertSession,
} from "@/lib/staff-alert/session-token";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function verifyStaffAlertPassword(password: string): boolean {
  const expected = (process.env.STAFF_ALERT_PASSWORD || "").trim();
  if (!expected) return false;
  return safeEqual(password.trim(), expected);
}

export { createStaffAlertSessionToken, isValidStaffAlertSession };

export async function isStaffAlertAuthenticated(
  request: Request
): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const token = cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${STAFF_ALERT_COOKIE}=`))
      ?.slice(STAFF_ALERT_COOKIE.length + 1);

    if (token && (await isValidStaffAlertSession(decodeURIComponent(token)))) {
      return true;
    }
  }

  // Desktop / API: Bearer или X-Staff-Alert-Password = STAFF_ALERT_PASSWORD
  const auth = request.headers.get("authorization") || "";
  const bearer = auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const headerPassword = (
    request.headers.get("x-staff-alert-password") || ""
  ).trim();
  const password = bearer || headerPassword;
  if (password && verifyStaffAlertPassword(password)) {
    return true;
  }

  return false;
}

export function getStaffAlertSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}

export { STAFF_ALERT_COOKIE };
