# TODO: switch comments in this file to English.
# Obraz aplikacji: build Next.js (output: standalone) + skrypty danych (npm run menu / dodaj / popraw / pakiet).
# Na serwerze baza leży poza obrazem, w wolumenie /app/data (patrz deploy/docker-compose.yml).

FROM node:24-slim AS budowa
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Settings read at build time (static pages). GitHub Actions passes them as build args;
# deploy/wdroz.sh provides them via .env.production in the build context.
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
    NEXT_TELEMETRY_DISABLED=1
# .next owned by node: the server writes refreshed pages (route-cache) and resized images (cache) there at runtime
COPY --from=budowa --chown=node:node /app/.next/standalone ./
COPY --from=budowa --chown=node:node /app/.next/static ./.next/static
COPY --from=budowa /app/public ./public
# sharp (skalowanie zdjęć w next/image): śledzenie plików przy buildzie gubi biblioteki libvips (osobny pakiet
# @img/sharp-libvips-*), a bez nich zdjęcia idą w pełnym rozmiarze jako JPEG
COPY --from=budowa /app/node_modules/@img ./node_modules/@img
# skrypty danych uruchamiane w kontenerze: docker compose exec app node scripts/menu.mjs
COPY --from=budowa /app/scripts ./scripts
COPY --from=budowa /app/dane ./dane
COPY --from=budowa /app/src/lib/db ./src/lib/db
COPY --from=budowa /app/src/lib/slug.mjs ./src/lib/slug.mjs
RUN mkdir -p /app/data && chown node:node /app/data
USER node
EXPOSE 3000
CMD ["node", "server.js"]
