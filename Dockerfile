# App image: the Next.js build (output: standalone) + data scripts (npm run menu / add-venues / override / package).
# On the server the database lives outside the image, in the /app/data volume (see deploy/docker-compose.yml).

FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Settings read at build time (static pages). GitHub Actions passes them as build args;
# deploy/deploy.sh provides them via .env.production in the build context.
ARG ADMINISTRATOR
ARG CONTACT_EMAIL
ARG NEXT_PUBLIC_SITE_URL
# data/szamanie.db in the context is a copy of the database taken at deploy time, used only to generate pages.
# Without it (GitHub Actions) the build starts from an empty database (see scripts/init-db.mjs) and pages
# refill from the server database within a minute.
RUN npm run build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    SZAMANIE_DB=/app/data/szamanie.db \
    SZAMANIE_SERWER=1 \
    NEXT_TELEMETRY_DISABLED=1
# SZAMANIE_SERWER=1: the database in the volume is the server — menus transcribed from cards (dane/lokale) come here from
# the repository (src/lib/db/seed.mjs); not locally and not during the build, because there the database is the file's source.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# sharp (image resizing in next/image): file tracing during the build loses the libvips libraries (a separate
# @img/sharp-libvips-* package), and without them photos are served full-size as JPEG
COPY --from=build /app/node_modules/@img ./node_modules/@img
# data scripts run inside the container: docker compose exec app node scripts/menu.mjs
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/dane ./dane
COPY --from=build /app/src/lib/db ./src/lib/db
COPY --from=build /app/src/lib/slug.mjs ./src/lib/slug.mjs
RUN mkdir -p /app/data && chown node:node /app/data
USER node
EXPOSE 3000
CMD ["node", "server.js"]
