/**
 * Discord OAuth2: token exchange and user fetch.
 * See docs/design/integrations/discord-integration.md.
 */

const DISCORD_API = "https://discord.com/api";
const DISCORD_TOKEN_URL = `${DISCORD_API}/oauth2/token`;
const DISCORD_ME_URL = `${DISCORD_API}/users/@me`;

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

/** Base64URL encode (no padding). */
function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Exchange authorization code (web flow, with client_secret). */
export async function exchangeCodeWeb(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string
): Promise<DiscordTokenResponse> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/1d72bcc7-cc87-407b-8d82-421bf27576d3", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "discord.ts:exchangeCodeWeb",
      message: "about to fetch token URL",
      data: { url: DISCORD_TOKEN_URL },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "A",
    }),
  }).catch(() => {});
  // #endregion
  const res = await fetch(DISCORD_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord token exchange failed: ${res.status} ${err}`);
  }
  return (await res.json()) as DiscordTokenResponse;
}

/** Exchange authorization code (plugin PKCE flow, no client_secret). */
export async function exchangeCodePKCE(
  code: string,
  redirectUri: string,
  codeVerifier: string,
  clientId: string
): Promise<DiscordTokenResponse> {
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });
  const res = await fetch(DISCORD_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord token exchange failed: ${res.status} ${err}`);
  }
  return (await res.json()) as DiscordTokenResponse;
}

/** Fetch Discord user with access token. */
export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/1d72bcc7-cc87-407b-8d82-421bf27576d3", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "discord.ts:getDiscordUser",
      message: "about to fetch user URL",
      data: { url: DISCORD_ME_URL },
      timestamp: Date.now(),
      sessionId: "debug-session",
      hypothesisId: "A",
    }),
  }).catch(() => {});
  // #endregion
  const res = await fetch(DISCORD_ME_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord user fetch failed: ${res.status} ${err}`);
  }
  return (await res.json()) as DiscordUser;
}

/** Build Discord authorize URL (web or plugin). */
export function getAuthorizeUrl(params: {
  clientId: string;
  redirectUri: string;
  scope?: string;
  state: string;
  codeChallenge?: string;
}): string {
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", params.scope ?? "identify");
  url.searchParams.set("state", params.state);
  if (params.codeChallenge) {
    url.searchParams.set("code_challenge", params.codeChallenge);
    url.searchParams.set("code_challenge_method", "S256");
  }
  return url.toString();
}

/** Generate cryptographically random state (base64url). */
export function generateState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}
