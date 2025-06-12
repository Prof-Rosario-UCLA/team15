# Stage 1: Copy pre-built frontend static files
FROM alpine:latest AS frontend-files

# Copy the pre-built frontend files from the local dist directory
COPY frontend/dist /var/www/html

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
COPY --from=frontend-files /var/www/html /var/www/html

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
