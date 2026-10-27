FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html tsconfig.json vite.config.ts ./
COPY src ./src
COPY public ./public
RUN npm run build

# Same-origin static hosting and streaming TTS proxy. Secrets enter only at runtime.
FROM node:22-alpine AS runtime
ARG VERSION=1.05
ARG VCS_REF=unknown
LABEL org.opencontainers.image.title="重走长征路" \
      org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$VCS_REF \
      org.opencontainers.image.source="https://github.com/2guan/changzheng"
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server ./server
ENV API_HOST=0.0.0.0 API_PORT=4061 NODE_ENV=production
USER node
EXPOSE 4061
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:4061/healthz || exit 1
CMD ["node", "server/index.mjs"]
