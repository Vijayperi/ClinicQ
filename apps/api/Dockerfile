# Build context is the repository root (see docker-compose.yml), because npm workspaces
# share one package-lock.json at the root.
FROM node:22-slim

WORKDIR /app

# Install dependencies first, so Docker can reuse this layer when only source code changes.
# The Prisma schema is needed here because `npm install` generates the Prisma client.
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/prisma.config.ts apps/api/
COPY apps/api/prisma apps/api/prisma
COPY apps/web/package.json apps/web/
RUN npm ci --workspace apps/api --include-workspace-root

COPY apps/api apps/api
RUN npm run build --workspace apps/api

ENV NODE_ENV=production
WORKDIR /app/apps/api
EXPOSE 3000

# Don't run as root inside the container.
USER node

# Apply any pending database migrations, then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
