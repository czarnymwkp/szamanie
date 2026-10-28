# TODO: switch comments in this file to English.
# Obraz aplikacji: build Next.js (output: standalone) + skrypty danych (npm run menu / dodaj / popraw / pakiet).
# Na serwerze baza leży poza obrazem, w wolumenie /app/data (patrz deploy/docker-compose.yml).

FROM node:24-slim AS budowa
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Ustawienia czytane przy buildzie (strony statyczne). W GitHub Actions przychodzą jako build-args;
# deploy/wdroz.sh podaje je przez .env.production w kontekście.
ARG ADMINISTRATOR
ARG KONTAKT_EMAIL
ARG NEXT_PUBLIC_ADRES_SERWISU
# data/szamanie.db w kontekście to kopia bazy z chwili wdrożenia — tylko do wygenerowania stron przy buildzie.
# Bez niej (GitHub Actions) build startuje z pustą bazą, a strony uzupełniają się danymi z serwera po minucie.
# Bazę otwieramy raz przed buildem: zakłada schemat i przełącza plik na WAL, zanim zrobi to naraz kilka
# procesów buildu — inaczej dostają „database is locked”.
RUN node -e "import('./src/lib/db/otworz.mjs').then((m) => m.otworzBaze().close())" && npm run build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    SZAMANIE_DB=/app/data/szamanie.db \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=budowa /app/.next/standalone ./
COPY --from=budowa /app/.next/static ./.next/static
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
