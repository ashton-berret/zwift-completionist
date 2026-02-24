<script lang="ts">
  import { enhance } from "$app/forms";
  import { createEventDispatcher } from "svelte";
  import { unitPreference } from "$lib/stores";
  import { formatDistance, formatElevation, formatMinutes, formatRelativeDate } from "$lib/utils/format";

  interface RideSummary {
    id: string;
    rideDate: Date;
    rideTimeMinutes: number | null;
    perceivedDifficulty: number | null;
  }

  interface RouteItem {
    id: string;
    name: string;
    world: string;
    distanceKm: number;
    elevationM: number;
    badgeXp: number;
    difficulty: string;
    difficultyScore: number;
    completed: boolean;
    latestRide: RideSummary | null;
  }

  export let route: RouteItem;
  let uncompleting = false;

  const dispatch = createEventDispatcher<{
    openLog: { routeId: string };
    openEdit: { routeId: string };
    openMetrics: { routeId: string };
  }>();
</script>

<article
  class={`rounded-lg border bg-[var(--color-bg-surface)] p-4 ${
    route.completed
      ? "border-[var(--color-primary)] border-l-4"
      : "border-[var(--color-border)]"
  }`}
>
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div class="min-w-[240px] flex-1">
      <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">{route.name}</h2>
      <p class="text-sm text-[var(--color-text-secondary)]">{route.world}</p>
      <p class="mt-2 text-sm text-[var(--color-text-secondary)]">
        {formatDistance(route.distanceKm, $unitPreference)} | {formatElevation(route.elevationM, $unitPreference)} | Difficulty {route.difficulty} | XP {route.badgeXp}
      </p>

      {#if route.latestRide}
        <p class="mt-2 text-xs text-[var(--color-text-secondary)]">
          Last ride: {formatRelativeDate(route.latestRide.rideDate)}
          {#if route.latestRide.rideTimeMinutes}
            ({formatMinutes(route.latestRide.rideTimeMinutes)})
          {/if}
        </p>
      {/if}
    </div>

    <div class="flex min-w-[220px] flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        class="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        on:click={() => dispatch("openMetrics", { routeId: route.id })}
      >
        Adjust Route
      </button>

      {#if route.completed}
        <button
          type="button"
          class="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          on:click={() => dispatch("openEdit", { routeId: route.id })}
        >
          Edit Ride
        </button>

        <form
          method="POST"
          action="?/uncompleteRide"
          use:enhance={() => {
            uncompleting = true;
            return async ({ update }) => {
              await update();
              uncompleting = false;
            };
          }}
        >
          <input type="hidden" name="routeId" value={route.id} />
          {#if route.latestRide}
            <input type="hidden" name="rideId" value={route.latestRide.id} />
          {/if}
          <button
            type="submit"
            disabled={uncompleting}
            class="rounded-md border border-[var(--color-danger)]/60 px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
          >
            {uncompleting ? "Removing..." : "Uncomplete"}
          </button>
        </form>
      {:else}
        <button
          type="button"
          class="rounded-md bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-[#0e100f] hover:bg-[var(--color-primary-hover)]"
          on:click={() => dispatch("openLog", { routeId: route.id })}
        >
          Log Completion
        </button>
      {/if}
    </div>
  </div>
</article>
