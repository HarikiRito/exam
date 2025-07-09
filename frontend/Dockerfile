FROM node:24-alpine AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI="true"
RUN npm install -g corepack@latest
RUN corepack enable pnpm
COPY pnpm-lock.yaml package.json /app/

FROM base AS build
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
COPY . /app
RUN pnpm build

FROM base AS runner
WORKDIR /app
COPY --from=build /app/build/client ./build/client
RUN pnpm add -g sirv-cli
EXPOSE 3000
CMD ["sirv", "build/client", "--single", "--host", "0.0.0.0", "--port", "3000"]
