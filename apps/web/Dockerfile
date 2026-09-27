# Stage 1: build the static site with Node.
# Build context is the repository root (see docker-compose.yml).
FROM node:22-slim AS build

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
RUN npm ci --workspace apps/web --include-workspace-root --ignore-scripts

COPY apps/web apps/web
RUN npm run build --workspace apps/web

# Stage 2: serve the built files with nginx. Node isn't needed at runtime.
FROM nginx:1.30-alpine

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80
