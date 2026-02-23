import type { ParsedRoute } from "./route";

export interface ImportPreview {
  fileName: string;
  totalRoutes: number;
  preview: ParsedRoute[];
}

export interface ImportSummary {
  fileName: string;
  routeCount: number;
  newRoutes: number;
  updatedRoutes: number;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  errors?: string;
}
