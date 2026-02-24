<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  import RouteCard from "$lib/components/routes/RouteCard.svelte";
  import RideModal from "$lib/components/routes/RideModal.svelte";
  import RouteMetricsModal from "$lib/components/routes/RouteMetricsModal.svelte";
  import RouteFilters from "$lib/components/routes/RouteFilters.svelte";

  export let data: PageData;
  export let form: ActionData;

  let search = "";
  let selectedWorld = "all";
  let selectedDifficulty = "all";
  let selectedStatus = "all";
  let selectedSort = "name-asc";

  let modalOpen = false;
  let modalMode: "create" | "edit" = "create";
  let selectedRoute: PageData["routes"][number] | null = null;
  let metricsModalOpen = false;
  let selectedMetricsRoute: PageData["routes"][number] | null = null;

  $: worlds = Array.from(new Set(data.routes.map((route) => route.world))).sort((a, b) =>
    a.localeCompare(b),
  );

  $: filteredRoutes = data.routes
    .filter((route) => route.name.toLowerCase().includes(search.toLowerCase()))
    .filter((route) => selectedWorld === "all" || route.world === selectedWorld)
    .filter(
      (route) =>
        selectedDifficulty === "all" || route.difficultyScore === Number.parseInt(selectedDifficulty, 10),
    )
    .filter((route) => {
      if (selectedStatus === "completed") return route.completed;
      if (selectedStatus === "remaining") return !route.completed;
      return true;
    })
    .slice()
    .sort((a, b) => {
      if (selectedSort === "ladder") {
        return (
          a.distanceKm - b.distanceKm ||
          a.elevationM - b.elevationM ||
          a.difficultyScore - b.difficultyScore ||
          a.name.localeCompare(b.name)
        );
      }
      if (selectedSort === "name-asc") return a.name.localeCompare(b.name);
      if (selectedSort === "name-desc") return b.name.localeCompare(a.name);
      if (selectedSort === "world-asc") return a.world.localeCompare(b.world) || a.name.localeCompare(b.name);
      if (selectedSort === "distance-asc") return a.distanceKm - b.distanceKm;
      if (selectedSort === "distance-desc") return b.distanceKm - a.distanceKm;
      if (selectedSort === "elevation-asc") return a.elevationM - b.elevationM;
      if (selectedSort === "elevation-desc") return b.elevationM - a.elevationM;
      if (selectedSort === "difficulty-asc") return a.difficultyScore - b.difficultyScore;
      if (selectedSort === "difficulty-desc") return b.difficultyScore - a.difficultyScore;
      return 0;
    });

  function openCreateModal(routeId: string) {
    const route = data.routes.find((item) => item.id === routeId);
    if (!route) return;
    selectedRoute = route;
    modalMode = "create";
    modalOpen = true;
  }

  function openEditModal(routeId: string) {
    const route = data.routes.find((item) => item.id === routeId);
    if (!route || !route.latestRide) return;
    selectedRoute = route;
    modalMode = "edit";
    modalOpen = true;
  }

  function closeModal() {
    modalOpen = false;
  }

  function openMetricsModal(routeId: string) {
    const route = data.routes.find((item) => item.id === routeId);
    if (!route) return;
    selectedMetricsRoute = route;
    metricsModalOpen = true;
  }

  function closeMetricsModal() {
    metricsModalOpen = false;
  }
</script>

<svelte:head>
  <title>Routes - Zwift Tracker</title>
</svelte:head>

<div class="space-y-5">
  <div class="flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 class="text-3xl font-bold">Routes</h1>
      <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
        Completed: {data.routes.filter((route) => route.completed).length} / {data.routes.length}
      </p>
    </div>
  </div>

  {#if data.routes.length > 0 && data.routes.filter((route) => route.completed).length === 0}
    <div class="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3 text-sm text-[var(--color-text-secondary)]">
      No rides logged yet. Click <span class="text-[var(--color-primary)]">Log Completion</span> on any route to start tracking.
    </div>
  {/if}

  {#if form?.message}
    <div
      class={`rounded-md border p-3 text-sm ${
        form.success
          ? "border-[var(--color-success)]/25 bg-[var(--color-success)]/10 text-[var(--color-success)]"
          : "border-[var(--color-danger)]/20 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
      }`}
    >
      {form.message}
    </div>
  {/if}

  <RouteFilters
    bind:search
    bind:selectedWorld
    bind:selectedDifficulty
    bind:selectedStatus
    bind:selectedSort
    {worlds}
  />

  {#if data.routes.length === 0}
    <p class="text-[var(--color-text-secondary)]">No routes imported yet. Go to Import to load `routes.csv`.</p>
  {:else if filteredRoutes.length === 0}
    <p class="text-[var(--color-text-secondary)]">No routes match your current filters.</p>
  {:else}
    <div class="space-y-3">
      {#each filteredRoutes as route}
        <RouteCard
          {route}
          on:openLog={(event) => openCreateModal(event.detail.routeId)}
          on:openEdit={(event) => openEditModal(event.detail.routeId)}
          on:openMetrics={(event) => openMetricsModal(event.detail.routeId)}
        />
      {/each}
    </div>
  {/if}
</div>

<RideModal open={modalOpen} route={selectedRoute} mode={modalMode} onClose={closeModal} />
<RouteMetricsModal open={metricsModalOpen} route={selectedMetricsRoute} onClose={closeMetricsModal} />
