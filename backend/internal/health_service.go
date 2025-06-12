package internal

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"time"

	healthpb "github.com/Prof-Rosario-UCLA/team15/gen/go/proto/health/v1"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

// Global variable that generates a random value each time WatchHealth is invoked
var i int

type HealthServerImpl struct {
	healthpb.UnimplementedHealthServiceServer
	db    *gorm.DB
	redis *redis.Client
}

func NewHealthServer(db *gorm.DB, redisClient *redis.Client) *HealthServerImpl {
	return &HealthServerImpl{db: db, redis: redisClient}
}

// WatchHealth streams health metrics, caching recent metrics for performance
func (h *HealthServerImpl) WatchHealth(req *healthpb.WatchHealthRequest, stream healthpb.HealthService_WatchHealthServer) error {
	ctx := stream.Context()

	// Set i to a random value each time the function is invoked
	i = rand.Intn(10)

	// For illustration, send 5 updates spaced 1 second apart
	metric := HealthMetricModel{
		ServiceID: req.ServiceId,
		Status:    int32(healthpb.Status_STATUS_UP),
		LatencyMs: int32(1 + i*10),
		ErrorRate: float32(i) * 0.01,
		Timestamp: time.Now().UnixMilli(),
	}

	// Save to database
	if err := h.db.Create(&metric).Error; err != nil {
		return err
	}

	// Cache the latest metric for this service
	cacheKey := fmt.Sprintf("health:latest:%s", req.ServiceId)
	metricJSON, _ := json.Marshal(metric)
	h.redis.Set(ctx, cacheKey, metricJSON, 1*time.Minute)

	// Also add to a time-series cache (last 10 metrics)
	timeSeriesKey := fmt.Sprintf("health:timeseries:%s", req.ServiceId)
	h.redis.LPush(ctx, timeSeriesKey, metricJSON)
	h.redis.LTrim(ctx, timeSeriesKey, 0, 9) // Keep only last 10
	h.redis.Expire(ctx, timeSeriesKey, 10*time.Minute)

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
	return nil
}
