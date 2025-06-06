package internal

import (
    "time"

    healthpb "github.com/Prof-Rosario-UCLA/team15/gen/go/proto/health/v1"
    "gorm.io/gorm"
)

type HealthServerImpl struct {
    healthpb.UnimplementedHealthServiceServer
    db *gorm.DB
}

func NewHealthServer(db *gorm.DB) *HealthServerImpl {
    return &HealthServerImpl{db: db}
}

// WatchHealth streams dummy or real health metrics, inserting them into the database
func (h *HealthServerImpl) WatchHealth(req *healthpb.WatchHealthRequest, stream healthpb.HealthService_WatchHealthServer) error {
    // For illustration, send 5 updates spaced 1 second apart
    for i := 0; i < 5; i++ {
        metric := HealthMetricModel{
            ServiceID: req.ServiceId,
            Status:    int32(healthpb.Status_STATUS_UP),
            LatencyMs: int32(50 + i*10),
            ErrorRate: float32(i) * 0.1,
            Timestamp: time.Now().UnixMilli(),
        }
        if err := h.db.Create(&metric).Error; err != nil {
            return err
        }

        resp := &healthpb.WatchHealthResponse{
            ServiceId:   metric.ServiceID,
            Status:      healthpb.Status(metric.Status),
            LatencyMs:   metric.LatencyMs,
            ErrorRate:   metric.ErrorRate,
            TimestampMs: metric.Timestamp,
        }
        if err := stream.Send(resp); err != nil {
            return err
        }
        time.Sleep(time.Second)
    }
    return nil
}