import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { routeRepository, completedRideRepository } from "$lib/server/db/repositories";

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRideDate(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/login");

  const routes = await routeRepository.findAllRoutes();
  const latestRides = await completedRideRepository.findLatestByRouteIds(
    locals.user.id,
    routes.map((route) => route.id),
  );

  const latestRideMap = new Map(latestRides.map((ride) => [ride.routeId, ride]));
  const routesWithCompletion = routes.map((route) => {
    const latestRide = latestRideMap.get(route.id) ?? null;
    return {
      ...route,
      completed: !!latestRide,
      latestRide,
    };
  });

  return { routes: routesWithCompletion };
};

export const actions: Actions = {
  completeRide: async ({ request, locals }) => {
    if (!locals.user) redirect(302, "/login");

    const formData = await request.formData();
    const routeId = formData.get("routeId");
    const rideDate = parseRideDate(formData.get("rideDate"));
    const perceivedDifficulty = parseOptionalInt(formData.get("perceivedDifficulty"));
    const notesValue = formData.get("notes");

    if (typeof routeId !== "string" || !routeId || !rideDate) {
      return fail(400, { message: "Route and ride date are required." });
    }

    if (perceivedDifficulty !== null && (perceivedDifficulty < 1 || perceivedDifficulty > 5)) {
      return fail(400, { message: "Perceived difficulty must be between 1 and 5." });
    }

    await completedRideRepository.createRide({
      userId: locals.user.id,
      routeId,
      rideDate,
      rideTimeMinutes: parseOptionalInt(formData.get("rideTimeMinutes")),
      avgPowerWatts: parseOptionalInt(formData.get("avgPowerWatts")),
      avgHeartRate: parseOptionalInt(formData.get("avgHeartRate")),
      perceivedDifficulty,
      notes: typeof notesValue === "string" ? notesValue : null,
    });

    return { success: true, message: "Ride logged." };
  },

  uncompleteRide: async ({ request, locals }) => {
    if (!locals.user) redirect(302, "/login");

    const formData = await request.formData();
    const routeId = formData.get("routeId");
    const rideId = formData.get("rideId");

    if (typeof rideId === "string" && rideId) {
      const deleted = await completedRideRepository.deleteRideById(locals.user.id, rideId);
      if (!deleted) return fail(404, { message: "Ride not found." });
      return { success: true, message: "Ride removed." };
    }

    if (typeof routeId !== "string" || !routeId) {
      return fail(400, { message: "Route id is required." });
    }

    const deleted = await completedRideRepository.deleteLatestRideForRoute(locals.user.id, routeId);
    if (!deleted) return fail(404, { message: "No completed ride found for this route." });

    return { success: true, message: "Route marked incomplete." };
  },

  updateRide: async ({ request, locals }) => {
    if (!locals.user) redirect(302, "/login");

    const formData = await request.formData();
    const rideId = formData.get("rideId");
    const rideDate = parseRideDate(formData.get("rideDate"));
    const perceivedDifficulty = parseOptionalInt(formData.get("perceivedDifficulty"));
    const notesValue = formData.get("notes");

    if (typeof rideId !== "string" || !rideId || !rideDate) {
      return fail(400, { message: "Ride id and ride date are required." });
    }

    if (perceivedDifficulty !== null && (perceivedDifficulty < 1 || perceivedDifficulty > 5)) {
      return fail(400, { message: "Perceived difficulty must be between 1 and 5." });
    }

    try {
      await completedRideRepository.updateRide({
        id: rideId,
        userId: locals.user.id,
        rideDate,
        rideTimeMinutes: parseOptionalInt(formData.get("rideTimeMinutes")),
        avgPowerWatts: parseOptionalInt(formData.get("avgPowerWatts")),
        avgHeartRate: parseOptionalInt(formData.get("avgHeartRate")),
        perceivedDifficulty,
        notes: typeof notesValue === "string" ? notesValue : null,
      });
      return { success: true, message: "Ride updated." };
    } catch {
      return fail(404, { message: "Ride not found." });
    }
  },
};
