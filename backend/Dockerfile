FROM golang:1.24.4-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . ./
ENV PORT=8080
RUN go build -o main ./cmd/app/
RUN go build -o seeder ./cmd/seeder/
# CMD ["tail", "-f", "/dev/null"]

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main /app/main
COPY --from=builder /app/seeder /app/seeder
EXPOSE 8080
# CMD ["tail", "-f", "/dev/null"]
CMD ["/app/main"]
