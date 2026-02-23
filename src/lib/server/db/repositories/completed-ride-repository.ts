import { prisma } from "$lib/server/db/client";

interface CreateRideInput {
  userId: string;
  routeId: string;
  rideDate: Date;
  rideTimeMinutes?: number | null;
  avgPowerWatts?: number | null;
  avgHeartRate?: number | null;
  perceivedDifficulty?: number | null;
  notes?: string | null;
}

interface UpdateRideInput {
  id: string;
  userId: string;
  rideDate: Date;
  rideTimeMinutes?: number | null;
  avgPowerWatts?: number | null;
  avgHeartRate?: number | null;
  perceivedDifficulty?: number | null;
  notes?: string | null;
}

async function findLatestByRouteIds(userId: string, routeIds: string[]) {
  if (routeIds.length === 0) return [];

  const rides = await prisma.completedRide.findMany({
    where: {
      userId,
      routeId: { in: routeIds },
    },
    orderBy: [{ rideDate: "desc" }, { createdAt: "desc" }],
  });

  const latestByRoute = new Map<string, (typeof rides)[number]>();
  for (const ride of rides) {
    if (!latestByRoute.has(ride.routeId)) {
      latestByRoute.set(ride.routeId, ride);
    }
  }

  return Array.from(latestByRoute.values());
}

function createRide(input: CreateRideInput) {
  return prisma.completedRide.create({
    data: {
      userId: input.userId,
      routeId: input.routeId,
      rideDate: input.rideDate,
      rideTimeMinutes: input.rideTimeMinutes ?? null,
      avgPowerWatts: input.avgPowerWatts ?? null,
      avgHeartRate: input.avgHeartRate ?? null,
      perceivedDifficulty: input.perceivedDifficulty ?? null,
      notes: input.notes ?? null,
    },
  });
}

function updateRide(input: UpdateRideInput) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.completedRide.findFirst({
      where: { id: input.id, userId: input.userId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("Ride not found");
    }

    return tx.completedRide.update({
      where: { id: existing.id },
      data: {
        rideDate: input.rideDate,
        rideTimeMinutes: input.rideTimeMinutes ?? null,
        avgPowerWatts: input.avgPowerWatts ?? null,
        avgHeartRate: input.avgHeartRate ?? null,
        perceivedDifficulty: input.perceivedDifficulty ?? null,
        notes: input.notes ?? null,
      },
    });
  });
}

async function deleteRideById(userId: string, id: string) {
  const ride = await prisma.completedRide.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!ride) return null;
  return prisma.completedRide.delete({ where: { id: ride.id } });
}

async function deleteLatestRideForRoute(userId: string, routeId: string) {
  const latestRide = await prisma.completedRide.findFirst({
    where: { userId, routeId },
    orderBy: [{ rideDate: "desc" }, { createdAt: "desc" }],
    select: { id: true },
  });

  if (!latestRide) return null;
  return prisma.completedRide.delete({ where: { id: latestRide.id } });
}

export const completedRideRepository = {
  findLatestByRouteIds,
  createRide,
  updateRide,
  deleteRideById,
  deleteLatestRideForRoute,
};
