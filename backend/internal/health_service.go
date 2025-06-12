package internal

import (
	"encoding/json"
	"fmt"
	"math"
	"math/rand"
	"time"

	healthpb "github.com/Prof-Rosario-UCLA/team15/gen/go/proto/health/v1"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type HealthServerImpl struct {
	healthpb.UnimplementedHealthServiceServer
	db    *gorm.DB
	redis *redis.Client
}

func NewHealthServer(db *gorm.DB, redisClient *redis.Client) *HealthServerImpl {
	return &HealthServerImpl{db: db, redis: redisClient}
}

// WatchHealth streams health metrics with constantly changing, service-specific values
func (h *HealthServerImpl) WatchHealth(req *healthpb.WatchHealthRequest, stream healthpb.HealthService_WatchHealthServer) error {
	ctx := stream.Context()

	// Log the start of streaming
	fmt.Printf("Starting health stream for service: %s\n", req.ServiceId)

	// Define service-specific characteristics for realistic, different patterns
	serviceProfiles := map[string]struct {
		baseLatency   int32
		latencyRange  int32
		baseErrorRate float32
		errorRange    float32
		cycleSpeed    float64 // How fast the sine wave cycles
	}{
		"webmvc": {
			baseLatency:   30,   // Fast frontend service
			latencyRange:  20,   // ±20ms variation
			baseErrorRate: 0.02, // 2% base error rate
			errorRange:    0.03, // ±3% variation
			cycleSpeed:    0.8,  // Fast cycles
		},
		"ordering": {
			baseLatency:   60,   // Business logic service
			latencyRange:  40,   // ±40ms variation
			baseErrorRate: 0.05, // 5% base error rate
			errorRange:    0.07, // ±7% variation
			cycleSpeed:    0.5,  // Medium cycles
		},
		"catalog": {
			baseLatency:   45,   // Database service
			latencyRange:  35,   // ±35ms variation
			baseErrorRate: 0.01, // 1% base error rate
			errorRange:    0.02, // ±2% variation
			cycleSpeed:    0.3,  // Slow cycles
		},
	}

	// Get profile for this service or use default
	profile, exists := serviceProfiles[req.ServiceId]
	if !exists {
		// Default profile for unknown services
		profile = serviceProfiles["catalog"]
	}

	// Continuous streaming with constantly changing values
	startTime := time.Now()
	updateCounter := 0
	ticker := time.NewTicker(1500 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			fmt.Printf("Health stream for service %s cancelled: %v\n", req.ServiceId, ctx.Err())
			return ctx.Err()
		case <-ticker.C:
			// Calculate time-based variations using sine waves for smooth changes
			elapsed := time.Since(startTime).Seconds()
			sineWave := math.Sin(elapsed * profile.cycleSpeed)
			cosWave := math.Cos(elapsed * profile.cycleSpeed * 1.3) // Different frequency

			// Generate constantly changing latency
			latencyVariation := int32(float64(profile.latencyRange) * sineWave)
			currentLatency := profile.baseLatency + latencyVariation
			if currentLatency < 1 {
				currentLatency = 1
			}

			// Generate constantly changing error rate
			errorVariation := float32(float64(profile.errorRange) * cosWave)
			currentErrorRate := profile.baseErrorRate + errorVariation
			if currentErrorRate < 0 {
				currentErrorRate = 0
			}
			if currentErrorRate > 1 {
				currentErrorRate = 1
			}

			// Add some randomness on top of the patterns
			randomFactor := rand.Float32()*0.1 - 0.05 // ±5% random
			currentLatency += int32(float32(currentLatency) * randomFactor)
			currentErrorRate += currentErrorRate * randomFactor

			// Ensure bounds
			if currentLatency < 1 {
				currentLatency = 1
			}
			if currentErrorRate < 0 {
				currentErrorRate = 0
			}
			if currentErrorRate > 1 {
				currentErrorRate = 1
			}

			// Occasionally change status to show different states
			currentStatus := healthpb.Status_STATUS_UP
			if updateCounter > 5 { // Start changing status after a few updates
				statusRandom := rand.Float32()
				if statusRandom < 0.05 { // 5% chance of being down
					currentStatus = healthpb.Status_STATUS_DOWN
					currentLatency = 0     // No latency when down
					currentErrorRate = 1.0 // 100% error rate when down
				} else if statusRandom < 0.15 { // 10% chance of partial issues
					currentStatus = healthpb.Status_STATUS_UNKNOWN_UNSPECIFIED
					currentLatency *= 2   // Double latency during issues
					currentErrorRate *= 3 // Triple error rate
					if currentErrorRate > 1 {
						currentErrorRate = 1
					}
				}
			}

			metric := HealthMetricModel{
				ServiceID: req.ServiceId,
				Status:    int32(currentStatus),
				LatencyMs: currentLatency,
				ErrorRate: currentErrorRate,
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
				fmt.Printf("Error sending health data for service %s: %v\n", req.ServiceId, err)
				return err
			}

			if updateCounter%10 == 0 { // Log every 10th update
				fmt.Printf("Sent health update #%d for service %s (status: %v, latency: %dms)\n",
					updateCounter, req.ServiceId, resp.Status, resp.LatencyMs)
			}

			updateCounter++
		}
	}
}
