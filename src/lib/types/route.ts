export interface RouteRecord {
  id: string;
  name: string;
  world: string;
  distanceKm: number;
  distanceMi: number;
  elevationM: number;
  elevationFt: number;
  leadInKm: number;
  leadInMi: number;
  badgeXp: number;
  difficulty: string;
  difficultyScore: number;
  eventOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedRoute {
  name: string;
  world: string;
  distanceKm: number;
  distanceMi: number;
  elevationM: number;
  elevationFt: number;
  leadInKm: number;
  leadInMi: number;
  badgeXp: number;
  difficulty: string;
  difficultyScore: number;
  eventOnly: boolean;
}

export interface CompletedRideRecord {
  id: string;
  userId: string;
  routeId: string;
  rideDate: Date;
  rideTimeMinutes: number | null;
  avgPowerWatts: number | null;
  avgHeartRate: number | null;
  perceivedDifficulty: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteWithCompletion extends RouteRecord {
  completed: boolean;
  latestRide: CompletedRideRecord | null;
}
