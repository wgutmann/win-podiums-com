/**
 * WinPodiums API — Cloudflare Worker (Phase 1: health, auth stubs, profile stub)
 * Bindings (DB, R2, CACHE) are wired in wrangler.toml from Terraform outputs when applied.
 */
import type { D1Database, R2Bucket, KVNamespace } from "@cloudflare/workers-types";

export interface Env {
  ENVIRONMENT?: string;
  DB?: D1Database;
  R2?: R2Bucket;
  CACHE?: KVNamespace;
}

function jsonResponse(body: object, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Health
    if (path === "/health" || path === "/api/health") {
      return jsonResponse({ ok: true, env: env.ENVIRONMENT ?? "dev" });
    }

    // Gate (static landing)
    if (path === "/" || path === "/gate") {
      return new Response(
        `<!DOCTYPE html><html><head><title>WinPodiums</title></head><body><h1>WinPodiums</h1><p>Gate — Phase 1</p><p><a href="/api/health">Health</a></p></body></html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // API prefix for consistency with OpenAPI (base path /api)
    const api = "/api";
    if (path.startsWith(api + "/")) {
      const rest = path.slice(api.length);

      // Auth stubs (Phase 1: return success; real Discord OAuth in Phase 1 implementation)
      if (method === "POST" && rest === "/auth/discord/callback") {
        return jsonResponse({ success: true, data: { message: "stub" } });
      }
      if (method === "POST" && rest === "/auth/discord/exchange") {
        return jsonResponse({ success: true, data: { message: "stub" } });
      }
      if (method === "POST" && rest === "/auth/token-exchange") {
        return jsonResponse({ success: true, data: { message: "stub" } });
      }
      if (method === "GET" && rest.startsWith("/auth/qr-status/")) {
        const sessionId = rest.slice("/auth/qr-status/".length);
        return jsonResponse({ success: true, data: { sessionId, status: "pending" } });
      }

      // Profile stub: GET /api/profile/me (optional Bearer; stub returns pending)
      if (method === "GET" && rest === "/profile/me") {
        return jsonResponse({
          success: true,
          data: {
            discordId: null,
            state: "pending",
            message: "stub — implement with D1/KV when Terraform is applied",
          },
        });
      }
      if (method === "PATCH" && rest === "/profile/me") {
        return jsonResponse({ success: true, data: { message: "stub" } });
      }
    }

    return jsonResponse({ success: false, error: "not_found", message: "Not found" }, 404);
  },
};
