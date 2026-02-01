/**
 * Unit tests for response helpers (jsonResponse, errorResponse).
 */
import { describe, it, expect } from "vitest";
import { jsonResponse, errorResponse } from "../src/lib/response";

describe("response", () => {
  it("jsonResponse returns 200 and JSON body", () => {
    const res = jsonResponse({ ok: true, env: "dev" });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");
  });

  it("jsonResponse accepts custom status", () => {
    const res = jsonResponse({ created: true }, 201);
    expect(res.status).toBe(201);
  });

  it("errorResponse returns given status and error shape", () => {
    const res = errorResponse(
      "unauthorized",
      "Missing or invalid authorization",
      401
    );
    expect(res.status).toBe(401);
    expect(res.headers.get("Content-Type")).toBe("application/json");
  });

  it("errorResponse includes details when provided", async () => {
    const res = errorResponse(
      "validation_error",
      "Invalid input",
      400,
      { field: "token" }
    );
    const body = await res.json() as { success: boolean; error: string; message: string; details?: object };
    expect(body.success).toBe(false);
    expect(body.error).toBe("validation_error");
    expect(body.message).toBe("Invalid input");
    expect(body.details).toEqual({ field: "token" });
  });
});
