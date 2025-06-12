import * as healthPb from '../gen/ts/proto/health/v1/health_pb';
import * as catalogPb from '../gen/ts/proto/catalog/v1/catalog_pb';

// Type definitions for the application
export type ServiceStatus = healthPb.Status;

export interface Service extends catalogPb.Service.AsObject {}

export interface HealthData extends healthPb.WatchHealthResponse.AsObject {}

export interface ServiceWithHealth extends Service {
  health?: HealthData;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

// Utility functions for status
export const getStatusColor = (status?: ServiceStatus): string => {
  switch (status) {
    case healthPb.Status.STATUS_UP:
      return "bg-green-600";
    case healthPb.Status.STATUS_DOWN:
      return "bg-red-600";
    case healthPb.Status.STATUS_UNKNOWN_UNSPECIFIED:
    default:
      return "bg-yellow-600";
  }
};

export const getStatusText = (status?: ServiceStatus): string => {
  switch (status) {
    case healthPb.Status.STATUS_UP:
      return "Operational";
    case healthPb.Status.STATUS_DOWN:
      return "Down";
    case healthPb.Status.STATUS_UNKNOWN_UNSPECIFIED:
    default:
      return "Unknown";
  }
};

export const mapStatusToLegacy = (status?: ServiceStatus): "working" | "partial" | "down" => {
  switch (status) {
    case healthPb.Status.STATUS_UP:
      return "working";
    case healthPb.Status.STATUS_DOWN:
      return "down";
    case healthPb.Status.STATUS_UNKNOWN_UNSPECIFIED:
    default:
      return "partial";
  }
};
