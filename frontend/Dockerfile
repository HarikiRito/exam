FROM node:24-alpine AS builder
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI="true"
RUN npm install -g corepack@latest
RUN corepack enable pnpm
COPY pnpm-lock.yaml package.json /app/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# COPY . /app
COPY node_modules /app/node_modules
COPY ./app /app/app
COPY ./public /app/public
COPY vite.config.ts /app/vite.config.ts
COPY remix.config.js /app/remix.config.js
COPY postcss.config.mjs /app/postcss.config.mjs
COPY tsconfig.json /app/tsconfig.json
COPY .npmrc /app/.npmrc
RUN pnpm build


FROM nginx:alpine AS runner
COPY --from=builder /app/build/client /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
