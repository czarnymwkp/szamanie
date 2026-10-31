import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone server in .next/standalone — for the Docker deployment
  output: "standalone",
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  // preview from a phone on the home Wi-Fi (next dev blocks scripts for hosts other than localhost)
  allowedDevOrigins: ["192.168.0.*"],
  // URLs of the old szamanie.pl (until 10.2026) — in case Google or someone still has them bookmarked
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
