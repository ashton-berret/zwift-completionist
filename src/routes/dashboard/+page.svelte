<script lang="ts">
  import type { PageData } from "./$types";
  import { unitPreference } from "$lib/stores";
  import Card from "$lib/components/ui/Card.svelte";
  import CompletionByWorld from "$lib/components/charts/CompletionByWorld.svelte";
  import WeeklyActivity from "$lib/components/charts/WeeklyActivity.svelte";
  import DifficultyDistribution from "$lib/components/charts/DifficultyDistribution.svelte";
  import MonthlyProgress from "$lib/components/charts/MonthlyProgress.svelte";
  import { formatMinutes, formatDistance, formatElevation, formatRelativeDate } from "$lib/utils/format";

  export let data: PageData;

  $: stats = data.stats;
  $: hasRoutes = stats.totalRoutes > 0;
</script>

<svelte:head>
  <title>Dashboard - Zwift Tracker</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold">Dashboard</h1>
    <p class="mt-1 text-sm text-[var(--color-text-secondary)]">Completion stats and ride trends</p>
  </div>

  <section class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
    <div class="mb-3 flex items-center justify-between gap-4">
      <h2 class="text-lg font-semibold">Overall Completion</h2>
      <span class="text-sm font-medium text-[var(--color-primary)]">{stats.completionPercentage.toFixed(1)}%</span>
    </div>
    <div class="h-4 overflow-hidden rounded-full bg-[var(--color-bg-surface-overlay)]">
      <div
        class="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
        style={`width: ${Math.max(0, Math.min(100, stats.completionPercentage))}%`}
      ></div>
    </div>
    <p class="mt-2 text-xs text-[var(--color-text-secondary)]">
      {stats.completedRoutes} of {stats.totalRoutes} routes completed
    </p>
  </section>

  {#if !hasRoutes}
    <Card>
      <h2 class="text-lg font-semibold">No Route Data Yet</h2>
      <p class="mt-2 text-sm text-[var(--color-text-secondary)]">
        Import `routes.csv` on the Import page to populate the dashboard.
      </p>
      <a
        href="/import"
        class="mt-4 inline-block rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[#0e100f] hover:bg-[var(--color-primary-hover)]"
      >
        Go To Import
      </a>
    </Card>
  {/if}

  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <Card>
      <h2 class="text-sm text-[var(--color-text-secondary)]">Routes Completed</h2>
      <p class="mt-2 text-3xl font-bold">{stats.completedRoutes} / {stats.totalRoutes}</p>
      <p class="mt-1 text-sm text-[var(--color-text-secondary)]">{stats.completionPercentage.toFixed(1)}% complete</p>
    </Card>

    <Card>
      <h2 class="text-sm text-[var(--color-text-secondary)]">Total Distance</h2>
      <p class="mt-2 text-3xl font-bold">{formatDistance(stats.totalDistanceRidden, $unitPreference)}</p>
      <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
        of {formatDistance(stats.totalDistanceAvailable, $unitPreference)} ({stats.distancePercentage.toFixed(1)}%)
      </p>
    </Card>

    <Card>
      <h2 class="text-sm text-[var(--color-text-secondary)]">Total Elevation</h2>
      <p class="mt-2 text-3xl font-bold">{formatElevation(stats.totalElevationRidden, $unitPreference)}</p>
      <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
        of {formatElevation(stats.totalElevationAvailable, $unitPreference)} ({stats.elevationPercentage.toFixed(1)}%)
      </p>
    </Card>

    <Card>
      <h2 class="text-sm text-[var(--color-text-secondary)]">Total Ride Time</h2>
      <p class="mt-2 text-3xl font-bold">{formatMinutes(stats.totalRideTimeMinutes)}</p>
      <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
        avg {formatMinutes(stats.averageRideTimeMinutes)} per logged ride
      </p>
    </Card>
  </section>

  <section class="grid gap-4 xl:grid-cols-2">
    <Card>
      <h2 class="mb-4 text-lg font-semibold">Completion by World</h2>
      <CompletionByWorld data={stats.completionByWorld} />
    </Card>

    <Card>
      <h2 class="mb-4 text-lg font-semibold">Weekly Activity</h2>
      <WeeklyActivity data={stats.weeklyActivity} />
    </Card>

    <Card>
      <h2 class="mb-4 text-lg font-semibold">Difficulty Distribution</h2>
      <DifficultyDistribution data={stats.difficultyDistribution} />
    </Card>

    <Card>
      <h2 class="mb-4 text-lg font-semibold">Monthly Progress</h2>
      <MonthlyProgress data={stats.monthlyProgress} />
    </Card>
  </section>

  <section class="grid gap-4 xl:grid-cols-3">
    <Card className="xl:col-span-2">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Recent Rides</h2>
      </div>
      {#if stats.recentRides.length === 0}
        <p class="mt-4 text-sm text-[var(--color-text-secondary)]">No rides logged yet.</p>
      {:else}
        <div class="mt-3 overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="text-[var(--color-text-secondary)]">
              <tr>
                <th class="px-2 py-2">Date</th>
                <th class="px-2 py-2">Route</th>
                <th class="px-2 py-2">World</th>
                <th class="px-2 py-2">Time</th>
                <th class="px-2 py-2">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {#each stats.recentRides as ride}
                <tr class="border-t border-[var(--color-border)]">
                  <td class="px-2 py-2">{formatRelativeDate(ride.date)}</td>
                  <td class="px-2 py-2">{ride.routeName}</td>
                  <td class="px-2 py-2">{ride.world}</td>
                  <td class="px-2 py-2">{formatMinutes(ride.time)}</td>
                  <td class="px-2 py-2">{ride.difficulty}/5</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </Card>

    <Card>
      <h2 class="text-lg font-semibold">This Week</h2>
      <div class="mt-4 space-y-2 text-sm">
        <p><span class="text-[var(--color-text-secondary)]">Distance:</span> {formatDistance(stats.weeklyDistance, $unitPreference)}</p>
        <p><span class="text-[var(--color-text-secondary)]">Time:</span> {formatMinutes(stats.weeklyTime)}</p>
        <p><span class="text-[var(--color-text-secondary)]">Rides:</span> {stats.weeklyRides}</p>
      </div>

      <h2 class="mt-6 text-lg font-semibold">Last 30 Days</h2>
      <div class="mt-4 space-y-2 text-sm">
        <p><span class="text-[var(--color-text-secondary)]">Distance:</span> {formatDistance(stats.monthlyDistance, $unitPreference)}</p>
        <p><span class="text-[var(--color-text-secondary)]">Time:</span> {formatMinutes(stats.monthlyTime)}</p>
        <p><span class="text-[var(--color-text-secondary)]">Rides:</span> {stats.monthlyRides}</p>
      </div>

      <h2 class="mt-6 text-lg font-semibold">XP Progress</h2>
      <div class="mt-4 space-y-2 text-sm">
        <p>
          <span class="text-[var(--color-text-secondary)]">Earned:</span> {stats.totalXpEarned.toLocaleString()} / {stats.totalXpAvailable.toLocaleString()}
        </p>
        <p><span class="text-[var(--color-text-secondary)]">Percent:</span> {stats.xpPercentage.toFixed(1)}%</p>
      </div>
    </Card>
  </section>
</div>
