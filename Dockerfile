# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Go Backend
FROM golang:1.24-alpine AS backend-builder

WORKDIR /app

# Copy go mod files from backend directory
COPY backend/go.mod backend/go.sum ./

RUN go mod download

# Copy backend source code
COPY backend/ .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/main ./cmd/server

# Stage 3: Runtime image with Envoy + Go + Frontend
FROM envoyproxy/envoy:v1.29.1

WORKDIR /

# Copy in the Go server binary
COPY --from=backend-builder /app/main /main

RUN chmod +x /main

# Copy built frontend static files
COPY --from=frontend-builder /app/frontend/dist /var/www/html

# Copy Envoy config from backend directory
COPY backend/envoy.yaml /etc/envoy/envoy.yaml

# Expose the listening port
EXPOSE 8080

# Override Envoy’s default entrypoint:
# 1) start your Go server in the background
# 2) exec Envoy in the foreground (so it gets PID 1)
ENTRYPOINT ["sh", "-c", "/main & exec envoy -c /etc/envoy/envoy.yaml"]
