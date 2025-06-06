package internal

import (

    catalogpb "github.com/Prof-Rosario-UCLA/team15/gen/go/proto/catalog/v1"
    "gorm.io/gorm"
)

type CatalogServerImpl struct {
    catalogpb.UnimplementedCatalogServiceServer
    db *gorm.DB
}

func NewCatalogServer(db *gorm.DB) *CatalogServerImpl {
    return &CatalogServerImpl{db: db}
}

// ListServices queries the services table and streams each one
func (s *CatalogServerImpl) ListServices(req *catalogpb.ListServicesRequest, stream catalogpb.CatalogService_ListServicesServer) error {
    var services []ServiceModel
    if err := s.db.Find(&services).Error; err != nil {
        return err
    }
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