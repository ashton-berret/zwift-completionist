import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import Papa from "papaparse";
import type { ParsedRoute } from "$lib/types";

interface CsvRow {
  [key: string]: string | undefined;
}

const MI_TO_KM = 1.60934;
const FT_TO_M = 0.3048;

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, "").trim();
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getValue(row: CsvRow, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function extractMetricPair(input: string): { first: number; second: number } {
  const matches = input.match(/([0-9]+(?:\.[0-9]+)?)\s*[a-zA-Z]*\s*\/\s*([0-9]+(?:\.[0-9]+)?)/);
  if (!matches) return { first: 0, second: 0 };
  return {
    first: parseNumber(matches[1]),
    second: parseNumber(matches[2]),
  };
}

function parseDifficulty(input: string): { difficulty: string; difficultyScore: number } {
  const match = input.match(/([1-5])/);
  const score = match ? Number.parseInt(match[1], 10) : 1;
  const difficulty = input.includes("/") ? input : `${score}/5`;
  return { difficulty, difficultyScore: score };
}

function mapCsvRowToRoute(row: CsvRow): ParsedRoute {
  const name = getValue(row, ["Route", "Route Name", "Name", "route_name", "route"]);
  const world = getValue(row, ["World/Map", "World", "Map", "world"]);

  const distanceKmRaw = parseNumber(getValue(row, ["Distance (km)", "Length (km)", "distance_km"]));
  const distanceMiRaw = parseNumber(getValue(row, ["Distance (mi)", "Length (mi)", "distance_mi"]));
  const elevationMRaw = parseNumber(getValue(row, ["Elevation (m)", "elevation_m"]));
  const elevationFtRaw = parseNumber(getValue(row, ["Elevation (ft)", "elevation_ft"]));
  const leadInKmRaw = parseNumber(getValue(row, ["Lead-In (km)", "Lead In (km)", "lead_in_km"]));
  const leadInMiRaw = parseNumber(getValue(row, ["Lead-In (mi)", "Lead In (mi)", "lead_in_mi"]));

  const combinedDistance = getValue(row, ["Distance", "Length", "distance"]);
  const combinedElevation = getValue(row, ["Elevation", "elevation"]);
  const combinedLeadIn = getValue(row, ["Lead-In", "Lead In", "lead_in"]);

  const parsedDistance = extractMetricPair(combinedDistance);
  const parsedElevation = extractMetricPair(combinedElevation);
  const parsedLeadIn = extractMetricPair(combinedLeadIn);

  let distanceKm = distanceKmRaw || parsedDistance.first;
  let distanceMi = distanceMiRaw || parsedDistance.second;
  if (!distanceKm && distanceMi) distanceKm = distanceMi * MI_TO_KM;
  if (!distanceMi && distanceKm) distanceMi = distanceKm / MI_TO_KM;

  let elevationM = elevationMRaw || parsedElevation.first;
  let elevationFt = elevationFtRaw || parsedElevation.second;
  if (!elevationM && elevationFt) elevationM = elevationFt * FT_TO_M;
  if (!elevationFt && elevationM) elevationFt = elevationM / FT_TO_M;

  let leadInKm = leadInKmRaw || parsedLeadIn.first;
  let leadInMi = leadInMiRaw || parsedLeadIn.second;
  if (!leadInKm && leadInMi) leadInKm = leadInMi * MI_TO_KM;
  if (!leadInMi && leadInKm) leadInMi = leadInKm / MI_TO_KM;

  const difficultyRaw = getValue(row, ["Difficulty", "difficulty"]) || "1/5";
  const { difficulty, difficultyScore } = parseDifficulty(difficultyRaw);

  const eventOnlyValue = getValue(row, ["eventOnly", "Event Only", "event_only"]);
  const eventOnly = /true|yes|1/i.test(eventOnlyValue) || /\*/.test(name);

  return {
    name,
    world,
    distanceKm,
    distanceMi,
    elevationM,
    elevationFt,
    leadInKm,
    leadInMi,
    badgeXp: Math.round(parseNumber(getValue(row, ["Badge XP", "badge_xp", "XP", "xp"]))),
    difficulty,
    difficultyScore,
    eventOnly,
  };
}

function validateParsedRoutes(routes: ParsedRoute[]): ParsedRoute[] {
  return routes.filter((route) => route.name && route.world);
}

export async function parseRoutesFromRootCsv(fileName = "routes.csv"): Promise<ParsedRoute[]> {
  const filePath = resolve(process.cwd(), fileName);
  const content = await readFile(filePath, "utf8");

  const result = Papa.parse<CsvRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
  });

  if (result.errors.length > 0) {
    throw new Error(`CSV parse failed: ${result.errors[0]?.message ?? "unknown parse error"}`);
  }

  const mapped = result.data.map(mapCsvRowToRoute);
  return validateParsedRoutes(mapped);
}
