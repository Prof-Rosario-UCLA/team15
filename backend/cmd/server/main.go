package main

import (
	"log"
	"net"
	"time"

	"google.golang.org/grpc/reflection"
	"google.golang.org/grpc"

	catalogpb "github.com/Prof-Rosario-UCLA/team15/gen/go/proto/catalog/v1"
	healthpb  "github.com/Prof-Rosario-UCLA/team15/gen/go/proto/health/v1"
)

// catalogServer implements catalog.v1.CatalogServiceServer
type catalogServer struct {
	catalogpb.UnimplementedCatalogServiceServer
}

// ListServices returns a hard-coded stream of ListServicesResponse messages
func (s *catalogServer) ListServices(req *catalogpb.ListServicesRequest, stream catalogpb.CatalogService_ListServicesServer) error {
	services := []*catalogpb.Service{
		{Id: "webmvc", Name: "WebMVC", Owner: "TeamA", Version: "v1.0.0", ProtoUrl: "http://example.com/protos/webmvc.proto"},
		{Id: "ordering", Name: "Ordering", Owner: "TeamB", Version: "v1.0.0", ProtoUrl: "http://example.com/protos/ordering.proto"},
		{Id: "catalog", Name: "Catalog", Owner: "TeamC", Version: "v1.0.0", ProtoUrl: "http://example.com/protos/catalog.proto"},
	}

	for _, svc := range services {
		resp := &catalogpb.ListServicesResponse{
			Services: []*catalogpb.Service{svc},
		}
		if err := stream.Send(resp); err != nil {
			return err
		}
	}
	return nil
}

// healthServer implements health.v1.HealthServiceServer
type healthServer struct {
	healthpb.UnimplementedHealthServiceServer
}

// WatchHealth sends a few dummy health updates, then closes
func (h *healthServer) WatchHealth(req *healthpb.WatchHealthRequest, stream healthpb.HealthService_WatchHealthServer) error {
	updates := []*healthpb.WatchHealthResponse{
		{ServiceId: req.ServiceId, Status: healthpb.Status_STATUS_UP, LatencyMs: 50, ErrorRate: 0, TimestampMs: 0},
		{ServiceId: req.ServiceId, Status: healthpb.Status_STATUS_UP, LatencyMs: 70, ErrorRate: 0.1, TimestampMs: 0},
		{ServiceId: req.ServiceId, Status: healthpb.Status_STATUS_DOWN, LatencyMs: 0, ErrorRate: 1.0, TimestampMs: 0},
	}

	for _, u := range updates {
		if err := stream.Send(u); err != nil {
			return err
		}
		// Sleep 1 second between updates
		time.Sleep(time.Second)
	}

	return nil
}

func main() {
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	catalogpb.RegisterCatalogServiceServer(s, &catalogServer{})
	healthpb.RegisterHealthServiceServer(s, &healthServer{})

	reflection.Register(s)

	log.Println("gRPC server listening on :50051")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("server error: %v", err)
	}
}