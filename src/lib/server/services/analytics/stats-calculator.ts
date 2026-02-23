import { prisma } from "$lib/server/db/client";
import type { DashboardStats } from "$lib/types";

const WORLD_COLORS: Record<string, string> = {
  Watopia: "#FF6B00",
  London: "#3B82F6",
  "New York": "#FFB800",
  Innsbruck: "#0AE448",
  Richmond: "#8B5CF6",
  Yorkshire: "#EC4899",
  France: "#00D4FF",
  Paris: "#14B8A6",
  "Makuri Islands": "#FF4757",
  Scotland: "#84CC16",
};

function round(value: number, digits = 1): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function percentage(part: number, total: number): number {
  if (!total) return 0;
  return round((part / total) * 100, 1);
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const offset = day === 0 ? 6 : day - 1;
  result.setDate(result.getDate() - offset);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function weekLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export async function calculateDashboardStats(userId: string): Promise<DashboardStats> {
  const [routes, rides] = await Promise.all([
    prisma.route.findMany({
      orderBy: [{ world: "asc" }, { name: "asc" }],
    }),
    prisma.completedRide.findMany({
      where: { userId },
      include: {
        route: {
          select: {
            id: true,
            name: true,
            world: true,
            distanceKm: true,
            elevationM: true,
            badgeXp: true,
            difficultyScore: true,
          },
        },
      },
      orderBy: [{ rideDate: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const totalRoutes = routes.length;
  const totalDistanceAvailable = routes.reduce((sum, route) => sum + route.distanceKm, 0);
  const totalElevationAvailable = routes.reduce((sum, route) => sum + route.elevationM, 0);
  const totalXpAvailable = routes.reduce((sum, route) => sum + route.badgeXp, 0);

  const completedRouteIds = new Set(rides.map((ride) => ride.routeId));
  const completedRoutes = completedRouteIds.size;
  const completedRouteMap = new Map(routes.map((route) => [route.id, route]));

  let totalDistanceRidden = 0;
  let totalElevationRidden = 0;
  let totalXpEarned = 0;
  for (const routeId of completedRouteIds) {
    const route = completedRouteMap.get(routeId);
    if (!route) continue;
    totalDistanceRidden += route.distanceKm;
    totalElevationRidden += route.elevationM;
    totalXpEarned += route.badgeXp;
  }

  const rideTimes = rides.map((ride) => ride.rideTimeMinutes).filter((time): time is number => time !== null);
  const totalRideTimeMinutes = rideTimes.reduce((sum, time) => sum + time, 0);
  const averageRideTimeMinutes = rideTimes.length ? Math.round(totalRideTimeMinutes / rideTimes.length) : 0;

  const now = new Date();
  const weekCutoff = new Date(now);
  weekCutoff.setDate(weekCutoff.getDate() - 7);
  const monthCutoff = new Date(now);
  monthCutoff.setDate(monthCutoff.getDate() - 30);

  const ridesThisWeek = rides.filter((ride) => ride.rideDate >= weekCutoff);
  const ridesThisMonth = rides.filter((ride) => ride.rideDate >= monthCutoff);

  const weeklyDistance = round(ridesThisWeek.reduce((sum, ride) => sum + ride.route.distanceKm, 0), 1);
  const weeklyTime = ridesThisWeek.reduce((sum, ride) => sum + (ride.rideTimeMinutes ?? 0), 0);
  const weeklyRides = ridesThisWeek.length;

  const monthlyDistance = round(ridesThisMonth.reduce((sum, ride) => sum + ride.route.distanceKm, 0), 1);
  const monthlyTime = ridesThisMonth.reduce((sum, ride) => sum + (ride.rideTimeMinutes ?? 0), 0);
  const monthlyRides = ridesThisMonth.length;

  const completionByWorld = Array.from(
    routes.reduce(
      (map, route) => {
        const existing = map.get(route.world) ?? {
          world: route.world,
          completed: 0,
          total: 0,
          color: WORLD_COLORS[route.world] ?? "#FF6B00",
        };
        existing.total += 1;
        if (completedRouteIds.has(route.id)) existing.completed += 1;
        map.set(route.world, existing);
        return map;
      },
      new Map<string, { world: string; completed: number; total: number; color: string }>(),
    ).values(),
  ).sort((a, b) => a.world.localeCompare(b.world));

  const difficultyDistribution = [1, 2, 3, 4, 5].map((difficulty) => {
    const routesAtDifficulty = routes.filter((route) => route.difficultyScore === difficulty);
    const total = routesAtDifficulty.length;
    const completed = routesAtDifficulty.filter((route) => completedRouteIds.has(route.id)).length;
    return { difficulty, completed, total };
  });

  const weekBuckets: { key: number; week: string; distance: number; timeMinutes: number; rides: number }[] = [];
  const currentWeekStart = startOfWeek(now);
  for (let i = 11; i >= 0; i -= 1) {
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(currentWeekStart.getDate() - i * 7);
    weekBuckets.push({
      key: weekStart.getTime(),
      week: weekLabel(weekStart),
      distance: 0,
      timeMinutes: 0,
      rides: 0,
    });
  }

  const weekMap = new Map(weekBuckets.map((bucket) => [bucket.key, bucket]));
  for (const ride of rides) {
    const key = startOfWeek(ride.rideDate).getTime();
    const bucket = weekMap.get(key);
    if (!bucket) continue;
    bucket.distance += ride.route.distanceKm;
    bucket.timeMinutes += ride.rideTimeMinutes ?? 0;
    bucket.rides += 1;
  }

  const weeklyActivity = weekBuckets.map((bucket) => ({
    week: bucket.week,
    distance: round(bucket.distance, 1),
    timeMinutes: Math.round(bucket.timeMinutes),
    rides: bucket.rides,
  }));

  const firstCompletionByRoute = new Map<
    string,
    { rideDate: Date; routeDistanceKm: number }
  >();
  for (const ride of rides.slice().sort((a, b) => a.rideDate.getTime() - b.rideDate.getTime())) {
    if (!firstCompletionByRoute.has(ride.routeId)) {
      firstCompletionByRoute.set(ride.routeId, {
        rideDate: ride.rideDate,
        routeDistanceKm: ride.route.distanceKm,
      });
    }
  }

  const monthBuckets: { start: Date; label: string; cumulativeRoutes: number; cumulativeDistance: number }[] = [];
  const currentMonthStart = startOfMonth(now);
  for (let i = 11; i >= 0; i -= 1) {
    const monthStart = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() - i, 1);
    monthBuckets.push({
      start: monthStart,
      label: monthLabel(monthStart),
      cumulativeRoutes: 0,
      cumulativeDistance: 0,
    });
  }

  const completions = Array.from(firstCompletionByRoute.values());
  let runningRoutes = 0;
  let runningDistance = 0;
  for (const bucket of monthBuckets) {
    const monthEnd = new Date(bucket.start.getFullYear(), bucket.start.getMonth() + 1, 0, 23, 59, 59, 999);
    for (const completion of completions) {
      if (completion.rideDate >= bucket.start && completion.rideDate <= monthEnd) {
        runningRoutes += 1;
        runningDistance += completion.routeDistanceKm;
      }
    }
    bucket.cumulativeRoutes = runningRoutes;
    bucket.cumulativeDistance = round(runningDistance, 1);
  }

  const monthlyProgress = monthBuckets.map((bucket) => ({
    month: bucket.label,
    cumulativeRoutes: bucket.cumulativeRoutes,
    cumulativeDistance: bucket.cumulativeDistance,
  }));

  const recentRides = rides.slice(0, 10).map((ride) => ({
    routeName: ride.route.name,
    world: ride.route.world,
    date: ride.rideDate.toISOString(),
    time: ride.rideTimeMinutes ?? 0,
    difficulty: ride.perceivedDifficulty ?? ride.route.difficultyScore ?? 1,
  }));

  return {
    totalRoutes,
    completedRoutes,
    completionPercentage: percentage(completedRoutes, totalRoutes),
    totalDistanceRidden: round(totalDistanceRidden, 1),
    totalDistanceAvailable: round(totalDistanceAvailable, 1),
    distancePercentage: percentage(totalDistanceRidden, totalDistanceAvailable),
    totalElevationRidden: round(totalElevationRidden, 0),
    totalElevationAvailable: round(totalElevationAvailable, 0),
    elevationPercentage: percentage(totalElevationRidden, totalElevationAvailable),
    totalRideTimeMinutes,
    averageRideTimeMinutes,
    totalXpEarned,
    totalXpAvailable,
    xpPercentage: percentage(totalXpEarned, totalXpAvailable),
    weeklyDistance,
    weeklyTime,
    weeklyRides,
    monthlyDistance,
    monthlyTime,
    monthlyRides,
    completionByWorld,
    difficultyDistribution,
    weeklyActivity,
    monthlyProgress,
    recentRides,
  };
}

export const statsCalculator = {
  calculateDashboardStats,
};
