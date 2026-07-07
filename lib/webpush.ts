import webpush from "web-push";

import {
  getVapidPrivateKey,
  getVapidPublicKey,
  getVapidSubject,
  isVapidConfigured,
} from "@/lib/staff-alert/vapid";

const PUBLIC_KEY = getVapidPublicKey();
const PRIVATE_KEY = getVapidPrivateKey();
const SUBJECT = getVapidSubject();

if (isVapidConfigured()) {
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
}

export { webpush, PUBLIC_KEY as VAPID_PUBLIC_KEY };
