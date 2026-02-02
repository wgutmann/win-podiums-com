/**
 * Unit tests for refresh endpoint and related lib functions.
 * Mocks Discord token API, D1, and KV. Group: required.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { refreshAccessToken } from "../../src/lib/discord";
import {
  getTokenRowByAccessTokenAllowExpired,
  updateAuthTokens,
} from "../../src/lib/user";
import { checkRefreshRateLimit } from "../../src/lib/ratelimit";

// --- Mock D1 for user lib tests ---
function createMockD1(initialRows: Record<string, unknown>[] = []) {
  const rows = [...initialRows];
  return {
    prepare: (sql: string) => ({
      bind: (...args: unknown[]) => ({
        first: async <T>(): Promise<T | null> => {
          if (
            sql.includes(
              "SELECT user_id, token_id, refresh_token FROM auth_tokens WHERE access_token = ?"
            )
          ) {
            const accessToken = args[0];
            const row = rows.find(
              (r) =>
                (r as { access_token?: string }).access_token === accessToken
            );
            return (row as T) ?? null;
          }
          return null;
        },
        run: async () => {
          if (sql.includes("UPDATE auth_tokens SET")) {
            const [accessToken, refreshToken, expiresAt, tokenId] = args;
            const idx = rows.findIndex(
              (r) => (r as { token_id?: string }).token_id === tokenId
            );
            if (idx >= 0) {
              (rows[idx] as Record<string, unknown>).access_token = accessToken;
              (rows[idx] as Record<string, unknown>).refresh_token =
                refreshToken;
              (rows[idx] as Record<string, unknown>).expires_at = expiresAt;
            }
          }
          return {};
        },
      }),
    }),
  };
}

describe("refresh lib", () => {
  describe("refreshAccessToken", () => {
    const originalFetch = globalThis.fetch;

    beforeEach(() => {
      vi.stubGlobal(
        "fetch",
        vi.fn((url: string, init?: RequestInit) => {
          if (url.includes("discord.com") && url.includes("oauth2/token")) {
            const body = init?.body?.toString() ?? "";
            if (body.includes("refresh_token")) {
              return Promise.resolve(
                new Response(
                  JSON.stringify({
                    access_token: "new_access_123",
                    token_type: "Bearer",
                    expires_in: 604800,
                    refresh_token: "new_refresh_456",
                    scope: "identify",
                  }),
                  { status: 200, headers: { "Content-Type": "application/json" } }
                )
              );
            }
          }
          return originalFetch(url as never, init as never);
        })
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("calls Discord with grant_type=refresh_token and returns new tokens", async () => {
      const result = await refreshAccessToken(
        "old_refresh",
        "client_id",
        "client_secret"
      );
      expect(result.access_token).toBe("new_access_123");
      expect(result.refresh_token).toBe("new_refresh_456");
      expect(result.expires_in).toBe(604800);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining("discord.com"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
      );
      const callBody = (globalThis.fetch as ReturnType<typeof vi.fn>).mock
        .calls[0][1]?.body as string;
      expect(callBody).toContain("grant_type=refresh_token");
      expect(callBody).toContain("refresh_token=old_refresh");
    });

    it("throws on Discord 400/401", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn(() =>
          Promise.resolve(
            new Response(JSON.stringify({ error: "invalid_grant" }), {
              status: 401,
            })
          )
        )
      );
      await expect(
        refreshAccessToken("bad_refresh", "cid", "secret")
      ).rejects.toThrow(/refresh failed/);
    });
  });

  describe("getTokenRowByAccessTokenAllowExpired", () => {
    it("returns user_id, token_id, refresh_token when row exists", async () => {
      const db = createMockD1([
        {
          user_id: "discord-123",
          token_id: "tok-uuid",
          access_token: "acc_xyz",
          refresh_token: "ref_abc",
        },
      ]) as never;
      const row = await getTokenRowByAccessTokenAllowExpired(db, "acc_xyz");
      expect(row).not.toBeNull();
      expect(row?.user_id).toBe("discord-123");
      expect(row?.token_id).toBe("tok-uuid");
      expect(row?.refresh_token).toBe("ref_abc");
    });

    it("returns null when access_token not found", async () => {
      const db = createMockD1() as never;
      const row = await getTokenRowByAccessTokenAllowExpired(db, "unknown");
      expect(row).toBeNull();
    });
  });

  describe("checkRefreshRateLimit", () => {
    it("returns allowed when KV is undefined", async () => {
      const result = await checkRefreshRateLimit(undefined, "user-1");
      expect(result.allowed).toBe(true);
    });

    it("returns allowed on first request when KV provided", async () => {
      const kvStore: Record<string, string> = {};
      const kv = {
        get: (key: string) => Promise.resolve(kvStore[key] ?? null),
        put: (key: string, value: string) => {
          kvStore[key] = value;
          return Promise.resolve();
        },
      } as never;
      const result = await checkRefreshRateLimit(kv, "user-1");
      expect(result.allowed).toBe(true);
    });
  });
});
