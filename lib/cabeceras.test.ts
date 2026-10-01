import { describe, expect, it } from "vitest";

import { cabecerasDeSeguridad, politicaDeContenido } from "./cabeceras";

describe("politicaDeContenido", () => {
  it("en producción no permite eval ni que otra web la embeba", () => {
    const csp = politicaDeContenido({ produccion: true });
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("default-src 'self'");
  });

  it("en desarrollo añade unsafe-eval para las pilas de React", () => {
    expect(politicaDeContenido({ produccion: false })).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
  });
});

describe("cabecerasDeSeguridad", () => {
  it("lleva noindex en todas las respuestas y prohíbe los marcos", () => {
    const cabeceras = Object.fromEntries(cabecerasDeSeguridad({ produccion: true }).map((c) => [c.key, c.value]));
    expect(cabeceras["X-Robots-Tag"]).toContain("noindex");
    expect(cabeceras["X-Frame-Options"]).toBe("DENY");
    expect(cabeceras["X-Content-Type-Options"]).toBe("nosniff");
  });
});
