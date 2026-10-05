import { describe, expect, it } from "vitest";

import { contentSecurityPolicy, securityHeaders } from "./headers";

describe("contentSecurityPolicy", () => {
  it("in production allows neither eval nor embedding by another site", () => {
    const csp = contentSecurityPolicy({ production: true });
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("default-src 'self'");
  });

  it("in development adds unsafe-eval for React's stack traces", () => {
    expect(contentSecurityPolicy({ production: false })).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
  });
});

describe("securityHeaders", () => {
  it("forbids frames and content sniffing on every response", () => {
    const headers = Object.fromEntries(securityHeaders({ production: true }).map((h) => [h.key, h.value]));
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
  });
});
