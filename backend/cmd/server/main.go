package main

import (
	"log"
	"net"
	"fmt"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"

    "google.golang.org/grpc"
    "google.golang.org/grpc/reflection"

	catalogpb "github.com/Prof-Rosario-UCLA/team15/gen/go/proto/catalog/v1"
	healthpb  "github.com/Prof-Rosario-UCLA/team15/gen/go/proto/health/v1"
	"github.com/Prof-Rosario-UCLA/team15/internal"
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

func main() {
    // 1) Connect to Postgres via GORM
    dsn := "host=localhost user=team15 password=team15 dbname=team15 port=5432 sslmode=disable"
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatalf("failed to connect to Postgres: %v", err)
    }

    // 2) AutoMigrate our models (creates tables if they don’t exist)
    if err := internal.Migrate(db); err != nil {
        log.Fatalf("auto‐migrate failed: %v", err)
    }

    // 3) Seed initial services if none exist
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

    // 4) Start the gRPC server
    lis, err := net.Listen("tcp", ":50051")
    if err != nil {
        log.Fatalf("failed to listen: %v", err)
    }
    grpcServer := grpc.NewServer()

    // 5) Register CatalogService and HealthService with DB-backed implementations
	catalogpb.RegisterCatalogServiceServer(grpcServer, internal.NewCatalogServer(db))
	healthpb.RegisterHealthServiceServer(grpcServer, internal.NewHealthServer(db))

    // 6) Enable server reflection so grpcurl (and other tools) can probe
    reflection.Register(grpcServer)

    log.Println("gRPC server listening on :50051")
    if err := grpcServer.Serve(lis); err != nil {
        log.Fatalf("server error: %v", err)
    }
}