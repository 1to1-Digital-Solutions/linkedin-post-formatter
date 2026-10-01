import type { MetadataRoute } from "next";

/** Herramienta de uso propio: fuera de todos los buscadores. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
