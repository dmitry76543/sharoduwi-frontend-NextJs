import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("\nVAPID keys generated. Add them to .env.local:\n");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@sharoduwi.ru`);
console.log("\nOptional for local dev (same value as VAPID_PUBLIC_KEY):");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}\n`);
