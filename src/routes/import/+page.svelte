<script lang="ts">
  import { enhance } from "$app/forms";

  export let data: {
    sourceFile: string;
    history: {
      id: string;
      fileName: string;
      routeCount: number;
      newRoutes: number;
      updatedRoutes: number;
      status: string;
      errors: string | null;
      importedAt: Date;
    }[];
  };

  export let form:
    | {
        message?: string;
        success?: boolean;
        totalRoutes?: number;
        sourceFile?: string;
        preview?: {
          name: string;
          world: string;
          distanceKm: number;
          elevationM: number;
          difficulty: string;
          badgeXp: number;
        }[];
      }
    | undefined;

  let previewLoading = false;
  let importLoading = false;
</script>

<svelte:head>
  <title>Import - Zwift Tracker</title>
</svelte:head>

<h1 class="mb-6 text-3xl font-bold">Import Routes</h1>

<div class="mb-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
  <h2 class="text-lg font-semibold">Source File</h2>
  <p class="mt-2 text-[var(--color-text-secondary)]">
    This milestone imports from `{data.sourceFile}` at repository root to simulate PDF extraction.
  </p>

  {#if form?.message}
    <div
      class={`mt-4 rounded-md border p-3 text-sm ${
        form.success
          ? "border-[var(--color-success)]/25 bg-[var(--color-success)]/10 text-[var(--color-success)]"
          : "border-[var(--color-danger)]/20 bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
      }`}
    >
      {form.message}
    </div>
  {/if}

  <div class="mt-4 flex flex-wrap gap-3">
    <form
      method="POST"
      action="?/preview"
      use:enhance={() => {
        previewLoading = true;
        return async ({ update }) => {
          await update();
          previewLoading = false;
        };
      }}
    >
      <button
        type="submit"
        disabled={previewLoading || importLoading}
        class="rounded-md border border-[var(--color-border)] px-4 py-2 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-60"
      >
        {previewLoading ? "Previewing..." : "Preview `routes.csv`"}
      </button>
    </form>

    <form
      method="POST"
      action="?/import"
      use:enhance={() => {
        importLoading = true;
        return async ({ update }) => {
          await update();
          importLoading = false;
        };
      }}
    >
      <button
        type="submit"
        disabled={previewLoading || importLoading}
        class="rounded-md bg-[var(--color-primary)] px-4 py-2 font-medium text-[#0e100f] hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
      >
        {importLoading ? "Importing..." : "Import Into Prisma"}
      </button>
    </form>
  </div>

  {#if form?.totalRoutes}
    <p class="mt-4 text-sm text-[var(--color-text-secondary)]">Parsed {form.totalRoutes} routes from {form.sourceFile}.</p>
  {/if}

  {#if form?.preview?.length}
    <div class="mt-5 overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="text-[var(--color-text-secondary)]">
          <tr>
            <th class="px-2 py-2">Name</th>
            <th class="px-2 py-2">World</th>
            <th class="px-2 py-2">Distance (km)</th>
            <th class="px-2 py-2">Elevation (m)</th>
            <th class="px-2 py-2">Difficulty</th>
            <th class="px-2 py-2">XP</th>
          </tr>
        </thead>
        <tbody>
          {#each form.preview as row}
            <tr class="border-t border-[var(--color-border)]">
              <td class="px-2 py-2">{row.name}</td>
              <td class="px-2 py-2">{row.world}</td>
              <td class="px-2 py-2">{row.distanceKm.toFixed(1)}</td>
              <td class="px-2 py-2">{row.elevationM.toFixed(0)}</td>
              <td class="px-2 py-2">{row.difficulty}</td>
              <td class="px-2 py-2">{row.badgeXp}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
  <h2 class="text-lg font-semibold">Import History</h2>

  {#if data.history.length === 0}
    <p class="mt-3 text-[var(--color-text-secondary)]">No imports yet.</p>
  {:else}
    <div class="mt-4 overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="text-[var(--color-text-secondary)]">
          <tr>
            <th class="px-2 py-2">When</th>
            <th class="px-2 py-2">File</th>
            <th class="px-2 py-2">Routes</th>
            <th class="px-2 py-2">New</th>
            <th class="px-2 py-2">Updated</th>
            <th class="px-2 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each data.history as item}
            <tr class="border-t border-[var(--color-border)]">
              <td class="px-2 py-2">{new Date(item.importedAt).toLocaleString()}</td>
              <td class="px-2 py-2">{item.fileName}</td>
              <td class="px-2 py-2">{item.routeCount}</td>
              <td class="px-2 py-2">{item.newRoutes}</td>
              <td class="px-2 py-2">{item.updatedRoutes}</td>
              <td class="px-2 py-2">{item.status}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
