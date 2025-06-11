package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http" // Added for HTTP server
	"os"
	"strings"

	catalogpb "github.com/Prof-Rosario-UCLA/team15/gen/go/proto/catalog/v1"
	healthpb "github.com/Prof-Rosario-UCLA/team15/gen/go/proto/health/v1"
	"github.com/Prof-Rosario-UCLA/team15/internal"
	"github.com/go-chi/chi/v5" // Added for Chi router
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// CatalogServer wraps gRPC and holds a DB reference
type CatalogServer struct {
	catalogpb.UnimplementedCatalogServiceServer
	db *gorm.DB
}

// HealthServer wraps gRPC and holds a DB reference
type HealthServer struct {
	healthpb.UnimplementedHealthServiceServer
	db *gorm.DB
}

var secretKey = []byte("my-super-secret-key") // Added for JWT

func main() {
	// 1) Connect to Postgres via GORM
	dbHost := getEnv("DB_HOST", "localhost")
	dbUser := getEnv("DB_USER", "team15")
	dbPassword := getEnv("DB_PASSWORD", "team15")
	dbName := getEnv("DB_NAME", "team15")
	dbPort := getEnv("DB_PORT", "5432")

	var dsn string
	if strings.Contains(dbHost, ":") {
		// Cloud SQL connection name format: project:region:instance
		dsn = fmt.Sprintf("host=/cloudsql/%s user=%s password=%s dbname=%s sslmode=disable",
			dbHost, dbUser, dbPassword, dbName)
	} else {
		// Local/Docker connection
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
			dbHost, dbUser, dbPassword, dbName, dbPort)
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to Postgres: %v", err)
	}

	// 2) Connect to Redis
	redisHost := getEnv("REDIS_HOST", "localhost")
	redisPort := getEnv("REDIS_PORT", "6379")
	redisAddr := fmt.Sprintf("%s:%s", redisHost, redisPort)

	redisClient := redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: "", // no password
		DB:       0,  // default DB
	})

	// Test Redis connection
	ctx := context.Background()
	_, err = redisClient.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("failed to connect to Redis: %v", err)
	}
	log.Printf("Connected to Redis at %s", redisAddr)

	// 3) AutoMigrate our models (creates tables if they don’t exist)
	if err := internal.Migrate(db); err != nil {
		log.Fatalf("auto‐migrate failed: %v", err)
	}

	// 4) Seed initial services if none exist
	var count int64
	db.Model(&internal.ServiceModel{}).Count(&count)
	if count == 0 {
		initial := []internal.ServiceModel{
			{ID: "webmvc", Name: "WebMVC", Owner: "TeamA", Version: "v1.0.0", ProtoURL: "http://example.com/protos/webmvc.proto"},
			{ID: "ordering", Name: "Ordering", Owner: "TeamB", Version: "v1.0.0", ProtoURL: "http://example.com/protos/ordering.proto"},
			{ID: "catalog", Name: "Catalog", Owner: "TeamC", Version: "v1.0.0", ProtoURL: "http://example.com/protos/catalog.proto"},
		}
		if err := db.Create(&initial).Error; err != nil {
			log.Fatalf("failed to seed services: %v", err)
		}
		fmt.Println("Seeded initial services into the database.")
	}

	// 5) Start HTTP login server on 8081
	router := chi.NewRouter()
	router.Post("/login", loginHandler) // loginHandler is from backend/cmd/server/auth.go
	httpLis, err := net.Listen("tcp4", "0.0.0.0:8081")
	if err != nil {
		log.Fatalf("failed to listen for HTTP on 0.0.0.0:8081: %v", err)
	}
	log.Println("HTTP server listening on", httpLis.Addr().String())
	go func() {
		if err := http.Serve(httpLis, router); err != nil {
			log.Fatalf("failed to serve HTTP: %v", err)
		}
	}()

	// 6) Start the gRPC server on 50051 (with JWT interceptors)
	lis, err := net.Listen("tcp4", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	serverOpts := []grpc.ServerOption{
		grpc.UnaryInterceptor(internal.JWTInterceptor(secretKey)),
		grpc.StreamInterceptor(internal.JWTStreamInterceptor(secretKey)),
	}
	grpcServer := grpc.NewServer(serverOpts...)

	// Register CatalogService and HealthService with DB-backed implementations
	catalogpb.RegisterCatalogServiceServer(grpcServer, internal.NewCatalogServer(db, redisClient))
	healthpb.RegisterHealthServiceServer(grpcServer, internal.NewHealthServer(db, redisClient))

	// Enable server reflection so grpcurl (and other tools) can probe
	reflection.Register(grpcServer)

	log.Println("gRPC server listening on 0.0.0.0:50051") // Modified log message for clarity
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("server error: %v", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
