import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // samodzielny serwer w .next/standalone — pod wdrożenie w Dockerze
  output: "standalone",
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  // podgląd z telefonu w domowym Wi-Fi (next dev blokuje skrypty dla adresów innych niż localhost)
  allowedDevOrigins: ["192.168.0.*"],
  // adresy starej wersji szamanie.pl (do 10.2026) — gdyby Google albo ktoś miał je w zakładkach
  async redirects() {
    return [
      { source: "/discover", destination: "/", permanent: true },
      { source: "/about/howitworks", destination: "/dla-lokali", permanent: true },
      { source: "/about/:strona*", destination: "/", permanent: true },
      {
        source: "/lawinfo/:strona(privacypolicy|rodo|cookiepolicy)",
        destination: "/polityka-prywatnosci",
        permanent: true,
      },
      { source: "/lawinfo/contact", destination: "/dla-lokali", permanent: true },
      { source: "/lawinfo/:strona*", destination: "/", permanent: true },
      { source: "/login", destination: "/panel/logowanie", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
