# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server
ENV NUXT_TELEMETRY_DISABLED=1
# Cap V8 heap so GC runs earlier on small VPS (exit 137 = OOM kill).
ENV NODE_OPTIONS=--max-old-space-size=768
ENV UV_THREADPOOL_SIZE=2
RUN pnpm build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV DATA_DIR=/app/data
ENV NODE_OPTIONS=--experimental-sqlite

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    poppler-utils \
    libreoffice-writer-nogui \
    fonts-dejavu-core \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10.13.1 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/.output ./.output
COPY deploy/docker-entrypoint.sh /docker-entrypoint.sh
RUN mkdir -p /app/data \
  && chown -R node:node /app/data /app/node_modules /app/.output \
  && chmod +x /docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", ".output/server/index.mjs"]
