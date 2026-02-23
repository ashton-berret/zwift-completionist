import type { UnitPreference } from "$lib/stores";

const KM_TO_MI = 0.621371;
const M_TO_FT = 3.28084;

export function formatMinutes(totalMinutes: number | null | undefined): string {
  if (!totalMinutes || totalMinutes <= 0) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function formatDistance(
  km: number | null | undefined,
  units: UnitPreference = "km",
  digits = 1,
): string {
  if (km === null || km === undefined) return `0.0 ${units}`;
  if (units === "mi") return `${(km * KM_TO_MI).toFixed(digits)} mi`;
  return `${km.toFixed(digits)} km`;
}

export function formatElevation(
  meters: number | null | undefined,
  units: UnitPreference = "km",
): string {
  if (meters === null || meters === undefined) return units === "mi" ? "0 ft" : "0 m";
  if (units === "mi") return `${Math.round(meters * M_TO_FT).toLocaleString()} ft`;
  return `${Math.round(meters).toLocaleString()} m`;
}

export function formatRelativeDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "never";
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "unknown";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
