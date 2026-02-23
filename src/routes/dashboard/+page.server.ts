import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { statsCalculator } from "$lib/server/services/analytics";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, "/login");
  const stats = await statsCalculator.calculateDashboardStats(locals.user.id);
  return { stats };
};
