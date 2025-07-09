FROM golang:1.24.4-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
ENV PORT=8080
RUN go build ./cmd/app/

FROM alpine:latest
WORKDIR /app
RUN apk --no-cache add ca-certificates
COPY --from=builder /app/app ./app
EXPOSE 8080
CMD ["./app"]
