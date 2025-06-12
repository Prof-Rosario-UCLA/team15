# CS 144 Final Project - Team 15
## Microservice Dashboard - Comprehensive Documentation

##  Project Overview

A real-time microservice monitoring dashboard built with React, Go, gRPC, and Docker. The application displays real-time updates of different microservices with live health metrics and status. This project demonstrates modern web development practices including real-time streaming, containerization, and secure authentication.

**Login Credentials (Development):**
- Username: `admin`
- Password: `secret`

###  Features

- **Real-time Health Monitoring**: Live streaming of service health metrics via gRPC-Web
- **Responsive Dashboard**: Modern, scalable UI built with Parcel, React, TypeScript, and Tailwind CSS
- **Secure Authentication**: JWT-based authentication with proper security measures
- **Microservice Architecture**: Containerized backend services with Docker
- **Database Integration**: PostgreSQL with Redis caching layer
- **Type Safety**: Full TypeScript implementation with Protocol Buffers

##  System Architecture

### Architecture Diagram

```
┌─────────────────┐    HTTPS/WSS      ┌─────────────────┐
│   Frontend      │◄─────────────────►│   Envoy Proxy   │
│   (React/Parcel)│                   │   (gRPC-Web)    │
│   Port: 5173    │                   │   Port: 8080    │
└─────────────────┘                   └─────────────────┘
         │                                       │
         │ gRPC-Web Streams                      │ gRPC
         │ (Health Monitoring)                   │
         │                                       ▼
         │                           ┌─────────────────┐
         │                           │   Go Backend    │
         │                           │   gRPC Server   │
         │                           │   Port: 50051   │
         │                           └─────────────────┘
         │                                       │
         │ HTTP Login                            │
         └───────────────────────────────────────┤
                                                 │
                                                 ▼
                                   ┌─────────────────┐
                                   │   HTTP Server   │
                                   │   (Auth/Login)  │
                                   │   Port: 8081    │
                                   └─────────────────┘
                                                 │
                              ┌──────────────────┼──────────────────┐
                              │                  │                  │
                              ▼                  ▼                  ▼
                   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
                   │   PostgreSQL    │ │     Redis       │ │   Mock Services │
                   │   Database      │ │   (Caching)     │ │   (webmvc,      │
                   │   Port: 5432    │ │   Port: 6379    │ │   ordering,     │
                   └─────────────────┘ └─────────────────┘ │   catalog)      │
                                                           └─────────────────┘
```

### Communication Flow
1. Frontend (React) communicates with Envoy Proxy via HTTPS
2. Envoy Proxy routes gRPC-Web requests to Go Backend (gRPC server)
3. Envoy Proxy routes HTTP login requests to Go Backend (HTTP server)
4. Backend uses PostgreSQL for persistent storage via GORM ORM
5. Backend uses Redis for caching health metrics and session data
6. Real-time health data streams via gRPC-Web to frontend

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Parcel for build tooling
- Tailwind CSS for styling
- gRPC-Web for real-time communication

**Backend:**
- Go 1.24 with gRPC
- GORM for PostgreSQL ORM
- Redis for caching
- Envoy Proxy for gRPC-Web translation

**Infrastructure:**
- Docker & Docker Compose for containerization
- PostgreSQL 15 for persistent storage
- Redis 7 for caching layer

**Development Tools:**
- Protocol Buffers for API definition
- TypeScript for type safety
- ESLint for code quality

## 🛠️ Installation & Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Go 1.24+ (for backend development)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd team15
   ```

2. **Start the backend services**
   ```bash
   docker-compose up -d
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Start the frontend development server**
   ```bash
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080


### Verification Steps

1. **Backend Health Check**
   ```bash
   # From root directory of the project
    grpcurl \
      -proto proto/catalog/v1/catalog.proto \
      -H "authorization: Bearer YOUR-TOKEN-HERE" \
      -d '{}' \
      team15-microservice-catalog.uw.r.appspot.com:443 catalog.v1.CatalogService/ListServices
   
   # Test HTTP login endpoint
   curl -X POST http://localhost:8080/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"secret"}'
   ```

2. **Frontend Application**
   - Navigate to http://localhost:5173
   - Login with credentials: admin/secret
   - Verify real-time health data updates

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with hardcoded credentials for development
- Tokens expire after 1 hour for security
- All API endpoints require valid JWT tokens

### Web Security Protection

**SQL Injection Prevention:**
```go
// backend/internal/health_service.go
// GORM automatically uses prepared statements
func (s *HealthService) GetServiceHealth(serviceName string) (*HealthMetric, error) {
    var metric HealthMetric
    // This is safe from SQL injection
    result := s.db.Where("service_name = ?", serviceName).First(&metric)
    return &metric, result.Error
}
```

**XSS Prevention:**
```typescript
// React automatically escapes variables in JSX
const ServiceDisplay = ({ service }: { service: Service }) => {
  return (
    <div>
      {/* This is automatically escaped by React */}
      <h3>{service.name}</h3>
      <p>Status: {service.status}</p>
    </div>
  );
};
```

**CSRF Protection:**
```typescript
// JWT tokens sent in headers, not cookies
const authHeaders = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

fetch('/api/services', { headers: authHeaders });
```

### Data Protection
- Sensitive data is cached with TTL in Redis (1-10 minutes)
- Database connections use environment variables for credentials
- No sensitive data logged in application logs
- HTTPS/TLS support (Envoy configuration)

##  CS 144 Requirements Compliance

###  Core Requirements Status

#### Frontend Requirements 
- **Semantic HTML5**: Proper use of semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`)
- **Responsive Design**: Mobile-first design with Tailwind CSS, tested on 320px+ screens
- **Single Page Application**: React 18 SPA with client-side routing
- **Production CSS Framework**: Tailwind CSS with PostCSS processing
- **Modern Framework**: React 18 with TypeScript, Parcel build system

#### Backend Requirements 
- **Database**: PostgreSQL 15 with GORM ORM
- **Caching**: Redis 7 for performance optimization
- **Real-time Communication**: gRPC-Web streaming for live health updates
- **API Design**: RESTful HTTP + gRPC APIs with proper error handling

#### Security Requirements 
- **Authentication**: JWT-based authentication system
- **SQL Injection Protection**: GORM ORM with prepared statements
- **XSS Prevention**: React JSX automatic escaping
- **CSRF Protection**: JWT tokens in headers, proper CORS configuration

#### Development Best Practices 
- **Version Control**: Git repository with meaningful commits
- **Code Quality**: TypeScript, ESLint, Go formatting tools
- **Testing**: Unit, integration, and E2E testing strategies
- **Documentation**: Comprehensive README, API docs, deployment guides

### Implementation Details

#### HTML5 Semantic Structure
```html
<!-- Example from Login.tsx -->
<main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
  <section className="flex items-center justify-center px-4 py-12">
    <article className="w-full max-w-md">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Microservice Dashboard
        </h1>
      </header>
      <form onSubmit={handleSubmit}>
        <!-- Semantic form elements -->
      </form>
    </article>
  </section>
</main>
```

#### Responsive Design Implementation
```css
/* Tailwind CSS responsive breakpoints */
/* Mobile first: base styles for 320px+ */
.dashboard-grid {
  @apply grid grid-cols-1 gap-4;
}

/* Tablet: 768px+ */
@screen md {
  .dashboard-grid {
    @apply grid-cols-2;
  }
}

/* Desktop: 1024px+ */
@screen lg {
  .dashboard-grid {
    @apply grid-cols-3;
  }
}

/* Wide screens: 1280px+ */
@screen xl {
  .dashboard-grid {
    @apply grid-cols-4;
  }
}
```

#### Real-time Communication
```typescript
// gRPC-Web streaming implementation
const stream = client.watchHealth(request, metadata);

stream.on('data', (response: HealthResponse) => {
  // Real-time health updates
  setHealthData(prev => ({
    ...prev,
    [response.getServiceName()]: {
      status: response.getStatus(),
      latency: response.getMetrics()?.getLatencyMs(),
      uptime: response.getMetrics()?.getUptimePercent(),
      timestamp: new Date()
    }
  }));
});
```

## Usage Guide

1. **Login**: Use the credentials `admin`/`secret` to access the dashboard
2. **Monitor Services**: View real-time health metrics for all microservices
3. **Service Details**: Click on any service to view detailed health information
4. **Real-time Updates**: Health data updates automatically via gRPC streaming

##  Deployment Guide

### Local Development Deployment

#### Step-by-Step Setup

1. **Clone and Navigate**
   ```bash
   git clone <repository-url>
   cd team15
   ```

2. **Start Backend Infrastructure**
   ```bash
   # Start PostgreSQL, Redis, and Backend services
   docker-compose up -d
   
   # Verify all services are running
   docker-compose ps
   
   # Check logs if needed
   docker-compose logs backend
   ```

4. **Frontend Development**
   ```bash
   # Install dependencies
   cd frontend
   npm install
   
   # Start development server
   npm start
   
   # Access at http://localhost:5173
   ```

### Production Deployment

#### Google Cloud Platform Deployment

##### Prerequisites
- Google Cloud SDK installed and authenticated
- Docker configured for GCP Container Registry

##### 1. Prepare Cloud Infrastructure

```bash
# Set project variables
export PROJECT_ID=your-project-id
export REGION=us-central1

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable sql-component.googleapis.com
gcloud services enable redis.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

##### 2. Database Setup

```bash
# Create Cloud SQL PostgreSQL instance
gcloud sql instances create microservices-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION

# Create database
gcloud sql databases create microservices \
  --instance=microservices-db

# Create user
gcloud sql users create admin \
  --instance=microservices-db \
  --password=secure-password

# Create Redis instance
gcloud redis instances create microservices-cache \
  --size=1 \
  --region=$REGION \
  --redis-version=redis_7_0
```

##### 3. Container Build and Deploy

```bash
# Build and push backend image
docker build -t gcr.io/$PROJECT_ID/microservice-backend .
docker push gcr.io/$PROJECT_ID/microservice-backend

# Deploy backend to Cloud Run
gcloud run deploy microservice-backend \
  --image gcr.io/$PROJECT_ID/microservice-backend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="DB_HOST=/cloudsql/$PROJECT_ID:$REGION:microservices-db" \
  --add-cloudsql-instances $PROJECT_ID:$REGION:microservices-db

# Build frontend
cd frontend
npm run build
```

### Scaling Considerations

#### Horizontal Scaling

```bash
# Scale backend containers
docker-compose up --scale backend=3

# Scale with Kubernetes
kubectl scale deployment backend --replicas=5
```

#### Performance Optimization

1. **Database Connection Pooling**
   - Configure GORM connection pool
   - Use pgbouncer for PostgreSQL

2. **Redis Caching Strategy**
   - Implement cache-aside pattern
   - Set appropriate TTL values

3. **gRPC Streaming Optimization**
   - Use connection pooling
   - Implement backpressure handling

#### Disaster Recovery

1. **Data Recovery Process**
   - Restore from latest backup through Postgres
   - Verify data integrity
   - Test application functionality

2. **Service Recovery**
   - Deploy from container registry
   - Update DNS if needed
   - Monitor service health

### Browser Compatibility
-  Chrome 90+
-  Firefox 88+
-  Safari 14+
-  Edge 90+
-  Mobile browsers (iOS Safari, Chrome Mobile)

### Accessibility Compliance
-  WCAG 2.1 AA compliance
-  Keyboard navigation support
-  Screen reader compatibility
-  Color contrast ratios >4.5:1
-  Focus indicators for all interactive elements

##  Project Structure

### Source Code Organization 
```
frontend/src/
├── services/       # API communication
├── types/          # TypeScript type definitions
└── assets/         # Static assets

backend/
├── cmd/           # Application entry points
├── internal/      # Private application code
├── gen/           # Generated protobuf code
└── proto/         # Protocol buffer definitions
```

##  API Documentation

### API Endpoints

**HTTP Endpoints:**
- `POST /login` - User authentication (returns JWT token)

**gRPC Services:**
- `catalog.v1.CatalogService/ListServices` - Fetch available services
- `health.v1.HealthService/WatchHealth` - Stream real-time health metrics

### Authentication

All API endpoints (except `/login`) require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt-token>
```
