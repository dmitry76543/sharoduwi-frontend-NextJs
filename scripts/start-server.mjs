import { execSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const serverPath = ".next/standalone/server.js";

function runBuild() {
  console.log("Standalone bundle missing — running npm run build...");
  execSync("npm run build", {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "production" },
  });
}

if (!existsSync(serverPath)) {
  try {
    runBuild();
  } catch (error) {
    console.error("Production build failed:", error);
  }
}

if (!existsSync(serverPath)) {
  console.error("Cannot start: .next/standalone/server.js not found.");
  console.error(
    "Set Amvera build command to: npm ci --include=dev && npm run build"
  );
  console.error("Remove artifacts * -> / overrides in the Amvera UI if present.");
  process.exit(1);
}

const port = process.env.PORT ?? "80";
const env = {
  ...process.env,
  NODE_ENV: "production",
  HOSTNAME: "0.0.0.0",
  PORT: port,
};

console.log(`Starting Next.js on ${env.HOSTNAME}:${port}`);

const result = spawnSync(process.execPath, [serverPath], {
  stdio: "inherit",
  env,
});

process.exit(result.status ?? 1);
