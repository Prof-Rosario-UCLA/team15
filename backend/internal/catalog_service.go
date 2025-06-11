package internal

import (
	"encoding/json"
	"time"

	catalogpb "github.com/Prof-Rosario-UCLA/team15/gen/go/proto/catalog/v1"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/gorm"
)

type CatalogServerImpl struct {
	catalogpb.UnimplementedCatalogServiceServer
	db    *gorm.DB
	redis *redis.Client
}

func NewCatalogServer(db *gorm.DB, redisClient *redis.Client) *CatalogServerImpl {
	return &CatalogServerImpl{db: db, redis: redisClient}
}

// ListServices queries the services table and streams each one with caching
func (s *CatalogServerImpl) ListServices(req *catalogpb.ListServicesRequest, stream catalogpb.CatalogService_ListServicesServer) error {
	ctx := stream.Context()
	cacheKey := "services:all"

	// Input validation
	if req == nil {
		return status.Error(codes.InvalidArgument, "request cannot be nil")
	}

	// Try to get from cache first
	cached, err := s.redis.Get(ctx, cacheKey).Result()
	if err == nil {
		// Cache hit - unmarshal and stream
		var services []ServiceModel
		if err := json.Unmarshal([]byte(cached), &services); err == nil {
			for _, m := range services {
				resp := &catalogpb.ListServicesResponse{
					Services: []*catalogpb.Service{{
						Id:       m.ID,
						Name:     m.Name,
						Owner:    m.Owner,
						Version:  m.Version,
						ProtoUrl: m.ProtoURL,
					}},
				}
				if err := stream.Send(resp); err != nil {
					return status.Error(codes.Internal, "failed to send response: "+err.Error())
				}
			}
			return nil
		}
	}

	// Cache miss - query database
	var services []ServiceModel
	if err := s.db.Find(&services).Error; err != nil {
		return status.Error(codes.Internal, "database query failed: "+err.Error())
	}

	// Cache the result for 5 minutes
	servicesJSON, err := json.Marshal(services)
	if err != nil {
		return status.Error(codes.Internal, "failed to marshal services: "+err.Error())
	}
	s.redis.Set(ctx, cacheKey, servicesJSON, 5*time.Minute)

	// Stream the results
	for _, m := range services {
		resp := &catalogpb.ListServicesResponse{
			Services: []*catalogpb.Service{{
				Id:       m.ID,
				Name:     m.Name,
				Owner:    m.Owner,
				Version:  m.Version,
				ProtoUrl: m.ProtoURL,
			}},
		}
		if err := stream.Send(resp); err != nil {
			return status.Error(codes.Internal, "failed to send response: "+err.Error())
		}
	}
	return nil
}
