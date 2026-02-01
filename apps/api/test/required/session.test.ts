/**
 * Unit tests for session JWT (createSessionJWT, verifySessionJWT).
 * Security-sensitive: ensures signing/verification and expiry behavior.
 * Group: required — runs first; optional tests run only if all required pass.
 */
import { describe, it, expect } from "vitest";
import {
  createSessionJWT,
  verifySessionJWT,
  type SessionPayload,
} from "../../src/lib/session";

const SECRET = "test-secret-at-least-32-characters-long";

describe("session JWT", () => {
  it("createSessionJWT returns a three-part JWT string", async () => {
    const token = await createSessionJWT("discord-123", SECRET, 3600);
    expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it("verifySessionJWT accepts a token created with same secret", async () => {
    const token = await createSessionJWT("discord-456", SECRET, 3600);
    const payload = await verifySessionJWT(token, SECRET);
    expect(payload).not.toBeNull();
    expect((payload as SessionPayload).sub).toBe("discord-456");
    expect((payload as SessionPayload).exp).toBeGreaterThan(
      Math.floor(Date.now() / 1000)
    );
  });

  it("verifySessionJWT returns null for wrong secret", async () => {
    const token = await createSessionJWT("discord-789", SECRET, 3600);
    const payload = await verifySessionJWT(token, "wrong-secret");
    expect(payload).toBeNull();
  });

  it("verifySessionJWT returns null for malformed token (not 3 parts)", async () => {
    expect(await verifySessionJWT("a.b", SECRET)).toBeNull();
    expect(await verifySessionJWT("a", SECRET)).toBeNull();
    expect(await verifySessionJWT("a.b.c.d", SECRET)).toBeNull();
  });

  it("verifySessionJWT returns null for tampered payload", async () => {
    const token = await createSessionJWT("discord-xyz", SECRET, 3600);
    const [h, p, s] = token.split(".");
    const tampered = `${h}.${p}eyJzdWIiOiJ0YW1wZXJlZCIsImV4cCI6OTk5OTk5OTk5OX0.${s}`;
    expect(await verifySessionJWT(tampered, SECRET)).toBeNull();
  });

  it("verifySessionJWT returns null for expired token", async () => {
    const token = await createSessionJWT("discord-exp", SECRET, 1);
    await new Promise((r) => setTimeout(r, 2100));
    const payload = await verifySessionJWT(token, SECRET);
    expect(payload).toBeNull();
  });
});
