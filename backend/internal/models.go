package internal

import "gorm.io/gorm"

// ServiceModel mirrors the catalog.v1.Service fields.
type ServiceModel struct {
    // GORM will use “id” as the primary key column by default when tagged `gorm:"primaryKey"`.
    ID       string `gorm:"primaryKey;column:id"`
    Name     string `gorm:"column:name"`
    Owner    string `gorm:"column:owner"`
    Version  string `gorm:"column:version"`
    ProtoURL string `gorm:"column:proto_url"`
}

// HealthMetricModel mirrors health.v1.WatchHealthResponse fields.
type HealthMetricModel struct {
    ID         uint    `gorm:"primaryKey;autoIncrement"`
    ServiceID  string  `gorm:"column:service_id;index"`
    Status     int32   `gorm:"column:status"`
    LatencyMs  int32   `gorm:"column:latency_ms"`
    ErrorRate  float32 `gorm:"column:error_rate"`
    Timestamp  int64   `gorm:"column:timestamp"`
}

// Migrate runs the auto‐migration for our two tables.
func Migrate(db *gorm.DB) error {
    return db.AutoMigrate(&ServiceModel{}, &HealthMetricModel{})
}