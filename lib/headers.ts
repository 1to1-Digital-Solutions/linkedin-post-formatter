/**
 * The security headers of every response, which `next.config.ts` applies to each route.
 *
 * The tool loads nothing from outside — no fonts, no analytics, no frames — and sends the text
 * nowhere, so everything stays on `'self'`, and `frame-ancestors 'none'` keeps other sites from
 * embedding it. `script-src` carries `'unsafe-inline'` because Next injects the RSC payload in
 * inline scripts; a nonce would require generating one per request. The risk is low: React
 * escapes everything it renders and `dangerouslySetInnerHTML` is not used here. In development
 * React also needs `eval()` to rebuild call stacks; it is not allowed in production.
 */

const DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "img-src 'self' data:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
];

export function contentSecurityPolicy({ production }: { production: boolean }): string {
  const scripts = ["'self'", "'unsafe-inline'", ...(production ? [] : ["'unsafe-eval'"])];
  return [...DIRECTIVES, `script-src ${scripts.join(" ")}`].join("; ");
}

export function securityHeaders({ production }: { production: boolean }) {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy({ production }) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "same-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  ];
}
