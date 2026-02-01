/**
 * WinPodiums API — Cloudflare Worker (Phase 1: real Discord OAuth, D1, profile, heartbeat)
 */
import type { D1Database, R2Bucket, KVNamespace } from "@cloudflare/workers-types";
import { jsonResponse, errorResponse } from "./lib/response";
import {
  exchangeCodeWeb,
  exchangeCodePKCE,
  getDiscordUser,
  getAuthorizeUrl,
  generateState,
} from "./lib/discord";
import { createSessionJWT, verifySessionJWT } from "./lib/session";
import {
  upsertUser,
  storeAuthToken,
  getAuthTokenForUser,
  getUserIdByAccessToken,
  createManualToken,
  consumeManualToken,
  getProfile,
  recordHeartbeat,
} from "./lib/user";
import { openApiYaml } from "./openapi-spec";

export interface Env {
  ENVIRONMENT?: string;
  DB?: D1Database;
  R2?: R2Bucket;
  CACHE?: KVNamespace;
  DISCORD_CLIENT_ID?: string;
  DISCORD_CLIENT_SECRET?: string;
  SESSION_SECRET?: string;
}

const SESSION_COOKIE = "wp_session";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/** Resolve auth: Bearer token (Discord access_token) or session cookie. */
async function getAuth(
  request: Request,
  env: Env
): Promise<{ discordId: string; accessToken?: string } | null> {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (!env.DB) return null;
    const userId = await getUserIdByAccessToken(env.DB, token);
    if (userId) return { discordId: userId, accessToken: token };
    return null;
  }
  const cookie = request.headers.get("Cookie");
  const match = cookie?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  const jwt = match?.[1];
  if (!jwt || !env.SESSION_SECRET) return null;
  const payload = await verifySessionJWT(jwt, env.SESSION_SECRET);
  if (!payload) return null;
  return { discordId: payload.sub };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const baseUrl = `${url.protocol}//${url.host}`;

    // Health
    if (path === "/health" || path === "/api/health") {
      return jsonResponse({ ok: true, env: env.ENVIRONMENT ?? "dev" });
    }

    // Swagger / OpenAPI docs (local and Docker)
    if (method === "GET" && path === "/api-docs/openapi.yaml") {
      return new Response(openApiYaml, {
        headers: {
          "Content-Type": "application/yaml; charset=utf-8",
          "Cache-Control": "public, max-age=60",
        },
      });
    }
    if (method === "GET" && (path === "/api-docs" || path === "/api-docs/")) {
      const html = getSwaggerUiHtml(baseUrl);
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Gate (static landing) — enhanced with auth and plugin links
    if (path === "/" || path === "/gate") {
      const html = getGateHtml(baseUrl);
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // Token generation page (requires login; cookie sent by browser)
    if (method === "GET" && path === "/auth/token") {
      const html = getTokenPageHtml(baseUrl);
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // ——— Auth (non-API) ———

    // Redirect to Discord OAuth (web)
    if (method === "GET" && (path === "/auth/discord" || path === "/auth/login")) {
      const clientId = env.DISCORD_CLIENT_ID;
      if (!clientId) {
        return new Response("Discord OAuth not configured (missing DISCORD_CLIENT_ID)", {
          status: 500,
          headers: { "Content-Type": "text/plain" },
        });
      }
      const state = generateState();
      const redirectUri = `${baseUrl}/auth/callback`;
      if (env.CACHE) {
        await env.CACHE.put(`auth:state:${state}`, redirectUri, { expirationTtl: 600 });
      }
      const authUrl = getAuthorizeUrl({
        clientId,
        redirectUri,
        scope: "identify",
        state,
      });
      return Response.redirect(authUrl, 302);
    }

    // Web OAuth callback (Discord redirects here with ?code=...&state=...)
    if (method === "GET" && path === "/auth/callback") {
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      if (!code || !state) {
        return Response.redirect(`${baseUrl}/gate?error=missing_params`, 302);
      }
      const redirectUri = `${baseUrl}/auth/callback`;
      const storedRedirect = env.CACHE ? await env.CACHE.get(`auth:state:${state}`) : null;
      if (env.CACHE) await env.CACHE.delete(`auth:state:${state}`);
      if (!env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET || !env.DB) {
        return Response.redirect(`${baseUrl}/gate?error=config`, 302);
      }
      try {
        const tokens = await exchangeCodeWeb(
          code,
          redirectUri,
          env.DISCORD_CLIENT_ID,
          env.DISCORD_CLIENT_SECRET
        );
        const discordUser = await getDiscordUser(tokens.access_token);
        await upsertUser(env.DB, discordUser, "web");
        const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
          .toISOString()
          .replace("T", " ")
          .slice(0, 19);
        await storeAuthToken(
          env.DB,
          discordUser.id,
          tokens.access_token,
          tokens.refresh_token,
          expiresAt
        );
        let redirectTo = `${baseUrl}/gate`;
        if (storedRedirect && storedRedirect !== redirectUri) redirectTo = storedRedirect;
        if (!env.SESSION_SECRET) {
          return Response.redirect(redirectTo, 302);
        }
        const sessionJwt = await createSessionJWT(
          discordUser.id,
          env.SESSION_SECRET,
          SESSION_MAX_AGE
        );
        return new Response(null, {
          status: 302,
          headers: {
            Location: redirectTo,
            "Set-Cookie": `${SESSION_COOKIE}=${sessionJwt}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`,
          },
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Auth failed";
        return Response.redirect(`${baseUrl}/gate?error=auth&message=${encodeURIComponent(msg)}`, 302);
      }
    }

    // POST /api/plugin/verify — stub (match by path so CI/Docker always hit)
    if (method === "POST" && (path === "/api/plugin/verify" || path === "/api/plugin/verify/")) {
      const auth = await getAuth(request, env);
      if (!auth) return errorResponse("unauthorized", "Missing or invalid authorization", 401);
      return jsonResponse({ success: true, data: { message: "stub" } });
    }

    // API prefix
    if (path.startsWith("/api/")) {
      const rest = path.slice(4).replace(/\/$/, "");

      // POST /api/auth/discord/callback — server-side web callback (if frontend posts code)
      if (method === "POST" && rest === "auth/discord/callback") {
        let body: { code?: string; state?: string; redirect_uri?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return errorResponse("bad_request", "Invalid JSON body", 400);
        }
        const { code, redirect_uri } = body;
        if (!code || !redirect_uri || !env.DISCORD_CLIENT_ID || !env.DISCORD_CLIENT_SECRET || !env.DB) {
          return errorResponse("bad_request", "Missing code, redirect_uri, or server config", 400);
        }
        try {
          const tokens = await exchangeCodeWeb(
            code,
            redirect_uri,
            env.DISCORD_CLIENT_ID,
            env.DISCORD_CLIENT_SECRET
          );
          const discordUser = await getDiscordUser(tokens.access_token);
          await upsertUser(env.DB, discordUser, "web");
          const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
            .toISOString()
            .replace("T", " ")
            .slice(0, 19);
          await storeAuthToken(
            env.DB,
            discordUser.id,
            tokens.access_token,
            tokens.refresh_token,
            expiresAt
          );
          return jsonResponse({
            success: true,
            data: { discordId: discordUser.id, state: "pending" },
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Token exchange failed";
          return errorResponse("unauthorized", msg, 401);
        }
      }

      // POST /api/auth/discord/exchange — plugin PKCE
      if (method === "POST" && rest === "auth/discord/exchange") {
        let body: { code?: string; code_verifier?: string; redirect_uri?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return errorResponse("bad_request", "Invalid JSON body", 400);
        }
        const { code, code_verifier, redirect_uri } = body;
        if (!code || !code_verifier || !redirect_uri || !env.DISCORD_CLIENT_ID || !env.DB) {
          return errorResponse("bad_request", "Missing code, code_verifier, or redirect_uri", 400);
        }
        try {
          const tokens = await exchangeCodePKCE(
            code,
            redirect_uri,
            code_verifier,
            env.DISCORD_CLIENT_ID
          );
          const discordUser = await getDiscordUser(tokens.access_token);
          await upsertUser(env.DB, discordUser, "plugin_browser");
          const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)
            .toISOString()
            .replace("T", " ")
            .slice(0, 19);
          await storeAuthToken(
            env.DB,
            discordUser.id,
            tokens.access_token,
            tokens.refresh_token,
            expiresAt
          );
          return jsonResponse({
            success: true,
            data: {
              discordId: discordUser.id,
              access_token: tokens.access_token,
              expires_in: tokens.expires_in,
            },
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Token exchange failed";
          return errorResponse("unauthorized", msg, 401);
        }
      }

      // POST /api/auth/token-exchange — plugin manual token
      if (method === "POST" && rest === "auth/token-exchange") {
        let body: { token?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return errorResponse("bad_request", "Invalid JSON body", 400);
        }
        const tokenCode = body.token?.trim();
        if (!tokenCode || !env.DB) {
          return errorResponse("bad_request", "Missing token or DB", 400);
        }
        const userId = await consumeManualToken(env.DB, tokenCode);
        if (!userId) {
          return errorResponse("unauthorized", "Invalid or expired token", 401);
        }
        const stored = await getAuthTokenForUser(env.DB, userId);
        if (!stored) {
          return errorResponse(
            "unauthorized",
            "No stored session for this user; complete web login first",
            401
          );
        }
        return jsonResponse({
          success: true,
          data: {
            discordId: userId,
            access_token: stored.access_token,
            expires_in: Math.max(
              0,
              Math.floor(new Date(stored.expires_at).getTime() / 1000 - Date.now() / 1000)
            ),
          },
        });
      }

      // GET /api/auth/qr-status/:sessionId — QR polling (stub: return pending)
      if (method === "GET" && rest.startsWith("auth/qr-status/")) {
        const sessionId = rest.slice("auth/qr-status/".length);
        if (!sessionId || !env.DB) {
          return errorResponse("bad_request", "Missing sessionId or DB", 400);
        }
        const row = await env.DB.prepare(
          `SELECT status, user_id, access_token FROM qr_auth_sessions WHERE session_id = ?`
        )
          .bind(sessionId)
          .first<{ status: string; user_id: string | null; access_token: string | null }>();
        if (!row) {
          return errorResponse("not_found", "Session not found", 404);
        }
        if (row.status === "completed" && row.user_id && row.access_token) {
          return jsonResponse({
            success: true,
            data: { sessionId, status: "completed", discordId: row.user_id, access_token: row.access_token },
          });
        }
        return jsonResponse({
          success: true,
          data: { sessionId, status: row.status },
        });
      }

      // POST /api/auth/token-generate — create one-time manual token (requires session)
      if (method === "POST" && rest === "auth/token-generate") {
        const auth = await getAuth(request, env);
        if (!auth || !env.DB) {
          return errorResponse("unauthorized", "Login required", 401);
        }
        try {
          const tokenCode = await createManualToken(env.DB, auth.discordId);
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
          return jsonResponse({
            success: true,
            data: { token: tokenCode, expires_at: expiresAt.toISOString() },
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Failed to generate token";
          return errorResponse("internal_error", msg, 500);
        }
      }

      // GET /api/profile/me — current user profile (D1/KV)
      if (method === "GET" && rest === "profile/me") {
        const auth = await getAuth(request, env);
        if (!auth) {
          return errorResponse("unauthorized", "Missing or invalid authorization", 401);
        }
        if (!env.DB) {
          return jsonResponse({
            success: true,
            data: { discordId: auth.discordId, state: "pending", message: "DB not bound" },
          });
        }
        const profile = await getProfile(env.DB, env.CACHE, auth.discordId);
        if (!profile) {
          return errorResponse("not_found", "User not found", 404);
        }
        return jsonResponse({
          success: true,
          data: {
            discordId: profile.discord_id,
            discordUsername: profile.discord_username,
            discordAvatar: profile.discord_avatar,
            verificationState: profile.verification_state,
            authMethod: profile.auth_method,
            lastActiveAt: profile.last_active_at,
          },
        });
      }

      // PATCH /api/profile/me — stub
      if (method === "PATCH" && rest === "profile/me") {
        const auth = await getAuth(request, env);
        if (!auth) return errorResponse("unauthorized", "Missing or invalid authorization", 401);
        return jsonResponse({ success: true, data: { message: "stub" } });
      }

      // POST /api/plugin/heartbeat — one verification flow
      if (method === "POST" && rest === "plugin/heartbeat") {
        const auth = await getAuth(request, env);
        if (!auth) {
          return errorResponse("unauthorized", "Missing or invalid authorization", 401);
        }
        if (!env.DB) {
          return jsonResponse({ success: true, data: { accepted: true } });
        }
        let version = "1.0.0";
        try {
          const body = (await request.json()) as { version?: string } | null;
          if (body?.version) version = String(body.version);
        } catch {
          // optional body
        }
        await recordHeartbeat(env.DB, auth.discordId, version);
        return jsonResponse({ success: true, data: { accepted: true } });
      }

    }

    return errorResponse("not_found", "Not found", 404);
  },
};

function getGateHtml(baseUrl: string): string {
  const loginUrl = `${baseUrl}/auth/discord`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>WinPodiums</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; }
    h1 { font-size: 1.5rem; }
    a { color: #5865F2; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
    .btn { display: inline-block; background: #5865F2; color: white; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; margin: 0.25rem 0.25rem 0 0; }
    .btn:hover { background: #4752C4; }
    .muted { color: #666; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>WinPodiums</h1>
  <p class="muted">Phase 1 — Gate</p>
  <div class="card">
    <p><strong>Log in with Discord</strong> to link your account and get the plugin.</p>
    <p><a href="${loginUrl}" class="btn">Log in with Discord</a></p>
  </div>
  <div class="card">
    <p><strong>Plugin</strong></p>
    <p>After logging in, <a href="${baseUrl}/auth/token">generate a one-time token</a> and paste it in the SimHub plugin, or use the in-plugin browser login.</p>
    <p><a href="${baseUrl}/auth/token" class="btn">Generate plugin token</a> · <a href="/api/health">API health</a> · <a href="${baseUrl}/api-docs">API docs (Swagger)</a></p>
  </div>
</body>
</html>`;
}

function getTokenPageHtml(baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Plugin token — WinPodiums</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 42rem; margin: 2rem auto; padding: 0 1rem; }
    h1 { font-size: 1.25rem; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
    .btn { display: inline-block; background: #5865F2; color: white; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; }
    .btn:hover { background: #4752C4; }
    .token { font-family: monospace; font-size: 1.25rem; letter-spacing: 0.1em; padding: 0.5rem; background: #f5f5f5; border-radius: 4px; }
    .error { color: #c00; }
    .muted { color: #666; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>Plugin token</h1>
  <p class="muted">Generate a one-time token to paste in the SimHub plugin. You must be logged in.</p>
  <div class="card">
    <button class="btn" id="gen">Generate token</button>
    <p id="out" style="margin-top: 0.75rem;"></p>
  </div>
  <p><a href="${baseUrl}/gate">Back to Gate</a></p>
  <script>
    document.getElementById('gen').onclick = async function() {
      var out = document.getElementById('out');
      out.innerHTML = '';
      out.className = '';
      try {
        var r = await fetch('${baseUrl}/api/auth/token-generate', { method: 'POST', credentials: 'include' });
        var j = await r.json();
        if (!r.ok) { out.className = 'error'; out.textContent = j.message || 'Failed'; return; }
        out.innerHTML = 'Token: <span class="token">' + j.data.token + '</span><br><span class="muted">Expires in 10 minutes. Paste this in the plugin.</span>';
      } catch (e) { out.className = 'error'; out.textContent = 'Request failed. Are you logged in?'; }
    }; 
  </script>
</body>
</html>`;
}

function getSwaggerUiHtml(baseUrl: string): string {
  const specUrl = `${baseUrl}/api-docs/openapi.yaml`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>API docs — WinPodiums</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "${specUrl}",
        dom_id: "#swagger-ui",
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>`;
}
