# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Stage 2: Build Go binary
FROM golang:1.24-alpine AS backend-builder

WORKDIR /app

# Copy go mod files from backend directory
COPY backend/go.mod backend/go.sum ./

RUN go mod download

# Copy backend source code
COPY backend/ .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/main ./cmd/server

# Stage 3: Runtime image with Envoy + Go binary + frontend static files
FROM envoyproxy/envoy:v1.29.1

# Install nginx for serving static files
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

WORKDIR /

# Copy in the Go server binary
COPY --from=backend-builder /app/main /main

RUN chmod +x /main

# Copy frontend static files to nginx html directory
COPY --from=frontend-builder /app/dist /var/www/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/sites-available/default

# Copy Envoy config from backend directory
COPY backend/envoy.yaml /etc/envoy/envoy.yaml

# Expose the listening port
EXPOSE 8080

# Override Envoy's default entrypoint:
# 1) start nginx for static files
# 2) start your Go server in the background  
# 3) exec Envoy in the foreground (so it gets PID 1)
ENTRYPOINT ["sh", "-c", "nginx -g 'daemon on;' && /main & exec envoy -c /etc/envoy/envoy.yaml"]
