package internal

import (
	"encoding/json"
	"time"

	catalogpb "github.com/Prof-Rosario-UCLA/team15/gen/go/proto/catalog/v1"
	"github.com/redis/go-redis/v9"
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
					return err
				}
			}
			return nil
		}
	}

	// Cache miss - query database
	var services []ServiceModel
	if err := s.db.Find(&services).Error; err != nil {
		return err
	}

	// Cache the result for 5 minutes
	servicesJSON, _ := json.Marshal(services)
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
			return err
		}
	}
	return nil
}
