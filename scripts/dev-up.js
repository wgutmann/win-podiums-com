#!/usr/bin/env node
/**
 * Start the local API (Docker) for development and SimHub testing.
 * From repo root: node scripts/dev-up.js
 * Prerequisites: Docker Desktop running, apps/api/.dev.vars present.
 */
const { execSync } = require("child_process");
const path = require("path");
const root = path.resolve(__dirname, "..");

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: root, stdio: "inherit", ...opts });
}

console.log("WinPodiums — starting local API (Docker)...\n");

try {
  run("docker compose build");
  run("docker compose up -d");
} catch (e) {
  if (e.message && e.message.includes("dockerDesktopLinuxEngine")) {
    console.error("\nDocker is not running. Start Docker Desktop and run again:");
    console.error("  node scripts/dev-up.js");
    process.exit(1);
  }
  throw e;
}

console.log("\nAPI starting at http://localhost:8787");
console.log("  Health:  http://localhost:8787/api/health");
console.log("  Gate:    http://localhost:8787/gate");
console.log("  Token:   http://localhost:8787/auth/token");
console.log("\nSimHub testing:");
console.log("  1. Point the plugin at http://localhost:8787 (SetApiBaseUrl or plugin settings).");
console.log("  2. Open SimHub and use Link to Discord / Send heartbeat (or manual token from /auth/token).");
console.log("\nLogs: docker compose logs -f api");
console.log("Stop:  docker compose down\n");
