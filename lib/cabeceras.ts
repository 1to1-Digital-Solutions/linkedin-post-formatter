/**
 * Las cabeceras de seguridad de todas las respuestas, que `next.config.ts` aplica a cada ruta.
 *
 * La herramienta no carga nada de fuera —ni fuentes, ni analítica, ni marcos— y no envía el
 * texto a ningún sitio, así que todo se queda en `'self'`, y `frame-ancestors 'none'` impide que
 * otra web la embeba. `script-src` lleva `'unsafe-inline'` porque Next inyecta el payload de RSC
 * en scripts inline; un nonce obligaría a generar uno por petición. El riesgo es bajo: React
 * escapa todo lo que pinta y aquí no se usa `dangerouslySetInnerHTML`. En desarrollo React
 * necesita además `eval()` para reconstruir pilas de llamada; en producción no entra.
 *
 * `X-Robots-Tag` repite en cada respuesta lo que dice `robots.txt`: es una herramienta de uso
 * propio y no tiene que aparecer en ningún buscador.
 */

const DIRECTIVAS = [
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

export function politicaDeContenido({ produccion }: { produccion: boolean }): string {
  const scripts = ["'self'", "'unsafe-inline'", ...(produccion ? [] : ["'unsafe-eval'"])];
  return [...DIRECTIVAS, `script-src ${scripts.join(" ")}`].join("; ");
}

export function cabecerasDeSeguridad({ produccion }: { produccion: boolean }) {
  return [
    { key: "Content-Security-Policy", value: politicaDeContenido({ produccion }) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "same-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
  ];
}
