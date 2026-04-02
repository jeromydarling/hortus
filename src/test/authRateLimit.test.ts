import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
const mockRpc = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: mockRpc,
  },
}));

// Import after mock
const { checkAuthRateLimit } = await import("@/lib/authRateLimit");

describe("checkAuthRateLimit", () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  it("returns true (allowed) when under limit", async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    const result = await checkAuthRateLimit("user@example.com", "login");
    expect(result).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith("check_rate_limit", {
      p_key: "auth:login:user@example.com",
      p_window_seconds: 60,
      p_max_requests: 5,
    });
  });

  it("returns false (blocked) when over limit", async () => {
    mockRpc.mockResolvedValue({ data: false, error: null });
    const result = await checkAuthRateLimit("user@example.com", "login");
    expect(result).toBe(false);
  });

  it("fails open on error", async () => {
    mockRpc.mockResolvedValue({ data: null, error: new Error("DB down") });
    const result = await checkAuthRateLimit("user@example.com", "login");
    expect(result).toBe(true); // fail open
  });

  it("normalizes email — lowercase and trim", async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    await checkAuthRateLimit("  User@Example.COM  ", "login");
    expect(mockRpc).toHaveBeenCalledWith(
      "check_rate_limit",
      expect.objectContaining({
        p_key: "auth:login:user@example.com",
      }),
    );
  });

  it("uses correct window for signup — 600s, max 3", async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    await checkAuthRateLimit("test@test.com", "signup");
    expect(mockRpc).toHaveBeenCalledWith("check_rate_limit", {
      p_key: "auth:signup:test@test.com",
      p_window_seconds: 600,
      p_max_requests: 3,
    });
  });

  it("uses correct window for reset — 300s, max 3", async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    await checkAuthRateLimit("test@test.com", "reset");
    expect(mockRpc).toHaveBeenCalledWith("check_rate_limit", {
      p_key: "auth:reset:test@test.com",
      p_window_seconds: 300,
      p_max_requests: 3,
    });
  });
});
