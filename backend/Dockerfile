# Stage 1: build your Go binary
FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/main ./cmd/server

# Stage 2: runtime image with Envoy + your binary
FROM envoyproxy/envoy:v1.29.1

WORKDIR /

# Copy in the Go server binary
COPY --from=builder /app/main /main

RUN chmod +x /main

# Copy Envoy config
COPY envoy.yaml /etc/envoy/envoy.yaml

# Expose the listening port
EXPOSE 8080

# Override Envoy’s default entrypoint:
# 1) start your Go server in the background
# 2) exec Envoy in the foreground (so it gets PID 1)
ENTRYPOINT ["sh", "-c", "/main & exec envoy -c /etc/envoy/envoy.yaml"]
