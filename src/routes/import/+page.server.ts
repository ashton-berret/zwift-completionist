import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { routeRepository } from "$lib/server/db/repositories";
import { parseRoutesFromRootCsv } from "$lib/server/services/import";
import { logError } from "$lib/server/utils/logger";

const SOURCE_FILE = "routes.csv";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/login");

  const history = await routeRepository.getImportHistory(25);
  return { history, sourceFile: SOURCE_FILE };
};

export const actions: Actions = {
  preview: async ({ locals }) => {
    if (!locals.user) redirect(302, "/login");

    try {
      const routes = await parseRoutesFromRootCsv(SOURCE_FILE);

      return {
        preview: routes.slice(0, 15),
        totalRoutes: routes.length,
        sourceFile: SOURCE_FILE,
      };
    } catch (error) {
      logError("Preview import failed", error, { sourceFile: SOURCE_FILE });
      return fail(400, {
        message: `Could not parse ${SOURCE_FILE}. Ensure the file exists in repo root and has route data.`,
      });
    }
  },

  import: async ({ locals }) => {
    if (!locals.user) redirect(302, "/login");

    try {
      const routes = await parseRoutesFromRootCsv(SOURCE_FILE);
      const summary = await routeRepository.upsertMany(routes);

      await routeRepository.createImportHistory({
        fileName: SOURCE_FILE,
        routeCount: summary.routeCount,
        newRoutes: summary.newRoutes,
        updatedRoutes: summary.updatedRoutes,
        status: "SUCCESS",
      });

      return {
        success: true,
        message: `Imported ${summary.routeCount} routes (${summary.newRoutes} new, ${summary.updatedRoutes} updated).`,
      };
    } catch (error) {
      logError("Route import failed", error, { sourceFile: SOURCE_FILE });

      await routeRepository.createImportHistory({
        fileName: SOURCE_FILE,
        routeCount: 0,
        newRoutes: 0,
        updatedRoutes: 0,
        status: "FAILED",
        errors: error instanceof Error ? error.message : "Unknown import error",
      });

      return fail(500, {
        message: `Import failed for ${SOURCE_FILE}. Check file format and try again.`,
      });
    }
  },
};
