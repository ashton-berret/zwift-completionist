import { prisma } from "$lib/server/db/client";
import type { ParsedRoute } from "$lib/types";

type ImportStatus = "SUCCESS" | "PARTIAL" | "FAILED";

async function upsertMany(routes: ParsedRoute[]) {
  if (routes.length === 0) {
    return { routeCount: 0, newRoutes: 0, updatedRoutes: 0 };
  }

  const names = routes.map((route) => route.name);
  const existing = await prisma.route.findMany({
    where: { name: { in: names } },
    select: { name: true },
  });

  const existingNames = new Set(existing.map((item: { name: string }) => item.name));
  const newRoutes = routes.filter((route) => !existingNames.has(route.name)).length;
  const updatedRoutes = routes.length - newRoutes;

  await prisma.$transaction(
    routes.map((route) =>
      prisma.route.upsert({
        where: { name: route.name },
        create: route,
        update: {
          world: route.world,
          distanceKm: route.distanceKm,
          distanceMi: route.distanceMi,
          elevationM: route.elevationM,
          elevationFt: route.elevationFt,
          leadInKm: route.leadInKm,
          leadInMi: route.leadInMi,
          badgeXp: route.badgeXp,
          difficulty: route.difficulty,
          difficultyScore: route.difficultyScore,
          eventOnly: route.eventOnly,
        },
      }),
    ),
  );

  return { routeCount: routes.length, newRoutes, updatedRoutes };
}

function createImportHistory(input: {
  fileName: string;
  routeCount: number;
  newRoutes: number;
  updatedRoutes: number;
  status: ImportStatus;
  errors?: string;
}) {
  return prisma.importHistory.create({
    data: {
      fileName: input.fileName,
      routeCount: input.routeCount,
      newRoutes: input.newRoutes,
      updatedRoutes: input.updatedRoutes,
      status: input.status,
      errors: input.errors,
    },
  });
}

function getImportHistory(limit = 20) {
  return prisma.importHistory.findMany({
    orderBy: { importedAt: "desc" },
    take: limit,
  });
}

function findAllRoutes() {
  return prisma.route.findMany({
    orderBy: [{ world: "asc" }, { name: "asc" }],
  });
}

function updateMetrics(input: {
  routeId: string;
  distanceKm: number;
  distanceMi: number;
  elevationM: number;
  elevationFt: number;
}) {
  return prisma.route.update({
    where: { id: input.routeId },
    data: {
      distanceKm: input.distanceKm,
      distanceMi: input.distanceMi,
      elevationM: input.elevationM,
      elevationFt: input.elevationFt,
    },
  });
}

export const routeRepository = {
  upsertMany,
  createImportHistory,
  getImportHistory,
  findAllRoutes,
  updateMetrics,
};
