// import { CatalogServiceClient } from "../gen/proto/catalog/v1/CatalogServiceClientPb";
// import { ListServicesRequest } from "../gen/proto/catalog/v1/catalog_pb";

// export function fetchServices(
//   onService: (service: any) => void,
//   onEnd?: () => void
// ) {
//   const client = new CatalogServiceClient("http://localhost:8080");
//   const request = new ListServicesRequest();

//   const stream = client.listServices(request, {});

//   stream.on("data", (response: any) => {
//     response.getServicesList().forEach((service: any) => {
//       onService(service.toObject());
//     });
//   });

//   stream.on("end", () => {
//     if (onEnd) onEnd();
//   });

//   stream.on("error", (err: any) => {
//     console.error("gRPC stream error:", err);
//   });
// }
