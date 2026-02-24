<script lang="ts">
  import { enhance } from "$app/forms";
  import Modal from "$lib/components/ui/Modal.svelte";
  import { unitPreference } from "$lib/stores";

  interface RouteItem {
    id: string;
    name: string;
    distanceKm: number;
    distanceMi: number;
    elevationM: number;
    elevationFt: number;
  }

  export let open = false;
  export let route: RouteItem | null = null;
  export let onClose: () => void = () => {};

  let distance = "";
  let elevation = "";
  let submitting = false;

  $: if (open && route) {
    distance = ($unitPreference === "mi" ? route.distanceMi : route.distanceKm).toFixed(2);
    elevation = ($unitPreference === "mi" ? route.elevationFt : route.elevationM).toFixed(0);
  }
</script>

<Modal {open} title="Adjust Route Metrics" onClose={onClose}>
  {#if route}
    <form
      method="POST"
      action="?/updateRouteMetrics"
      class="space-y-4"
      use:enhance={() => {
        submitting = true;
        return async ({ update, result }) => {
          await update();
          submitting = false;
          if (result.type === "success") onClose();
        };
      }}
    >
      <input type="hidden" name="routeId" value={route.id} />
      <input type="hidden" name="units" value={$unitPreference} />

      <div class="rounded-md bg-[var(--color-bg-surface-overlay)] p-3 text-sm text-[var(--color-text-secondary)]">
        Route: <span class="font-medium text-[var(--color-text-primary)]">{route.name}</span>
      </div>

      <label class="block">
        <span class="mb-1 block text-sm text-[var(--color-text-secondary)]">
          Distance ({$unitPreference === "mi" ? "miles" : "km"})
        </span>
        <input
          type="number"
          step="0.01"
          min="0"
          name="distance"
          bind:value={distance}
          required
          class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-3 py-2"
        />
      </label>

      <label class="block">
        <span class="mb-1 block text-sm text-[var(--color-text-secondary)]">
          Elevation ({$unitPreference === "mi" ? "feet" : "meters"})
        </span>
        <input
          type="number"
          step="1"
          min="0"
          name="elevation"
          bind:value={elevation}
          required
          class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-3 py-2"
        />
      </label>

      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="rounded-md border border-[var(--color-border)] px-4 py-2 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          on:click={onClose}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          class="rounded-md bg-[var(--color-primary)] px-4 py-2 font-medium text-[#0e100f] hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save Metrics"}
        </button>
      </div>
    </form>
  {/if}
</Modal>
