import * as jspb from 'google-protobuf'



export class WatchHealthRequest extends jspb.Message {
  getServiceId(): string;
  setServiceId(value: string): WatchHealthRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WatchHealthRequest.AsObject;
  static toObject(includeInstance: boolean, msg: WatchHealthRequest): WatchHealthRequest.AsObject;
  static serializeBinaryToWriter(message: WatchHealthRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WatchHealthRequest;
  static deserializeBinaryFromReader(message: WatchHealthRequest, reader: jspb.BinaryReader): WatchHealthRequest;
}

export namespace WatchHealthRequest {
  export type AsObject = {
    serviceId: string,
  }
}

export class WatchHealthResponse extends jspb.Message {
  getServiceId(): string;
  setServiceId(value: string): WatchHealthResponse;

  getStatus(): Status;
  setStatus(value: Status): WatchHealthResponse;

  getLatencyMs(): number;
  setLatencyMs(value: number): WatchHealthResponse;

  getErrorRate(): number;
  setErrorRate(value: number): WatchHealthResponse;

  getTimestampMs(): number;
  setTimestampMs(value: number): WatchHealthResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WatchHealthResponse.AsObject;
  static toObject(includeInstance: boolean, msg: WatchHealthResponse): WatchHealthResponse.AsObject;
  static serializeBinaryToWriter(message: WatchHealthResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WatchHealthResponse;
  static deserializeBinaryFromReader(message: WatchHealthResponse, reader: jspb.BinaryReader): WatchHealthResponse;
}

export namespace WatchHealthResponse {
  export type AsObject = {
    serviceId: string,
    status: Status,
    latencyMs: number,
    errorRate: number,
    timestampMs: number,
  }
}

export enum Status { 
  STATUS_UNKNOWN_UNSPECIFIED = 0,
  STATUS_UP = 1,
  STATUS_DOWN = 2,
}
