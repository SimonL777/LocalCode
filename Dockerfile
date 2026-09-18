FROM node:24-bookworm-slim

ARG TARGETARCH
ARG JDK_VERSION=25

ENV DEBIAN_FRONTEND=noninteractive \
    JAVA_HOME=/opt/java \
    JDTLS_HOME=/opt/localcode/jdtls \
    LOCALCODE_DB_PATH=/data/localcode.db \
    LOCALCODE_STUDY_DIR=/problem-data \
    NODE_ENV=production \
    PORT=8787 \
    PATH=/opt/java/bin:$PATH

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl python3 tar gzip \
    && architecture="${TARGETARCH:-$(dpkg --print-architecture)}" \
    && case "$architecture" in amd64) adoptium_arch=x64 ;; arm64) adoptium_arch=aarch64 ;; *) echo "Unsupported architecture: $architecture" >&2; exit 1 ;; esac \
    && mkdir -p /opt/java \
    && curl -fsSL "https://api.adoptium.net/v3/binary/latest/${JDK_VERSION}/ga/linux/${adoptium_arch}/jdk/hotspot/normal/eclipse" \
       | tar -xz -C /opt/java --strip-components=1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run setup:intelligence \
    && npm test \
    && npm run build \
    && npm prune --omit=dev \
    && mkdir -p /app/.localcode /data \
    && chown -R node:node /app/.localcode /data

USER node

EXPOSE 8787

HEALTHCHECK --interval=15s --timeout=3s --start-period=45s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:8787/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server/index.mjs"]
