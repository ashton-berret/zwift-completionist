<script lang="ts">
  import { enhance } from "$app/forms";
  import Modal from "$lib/components/ui/Modal.svelte";

  interface RideSummary {
    id: string;
    rideDate: Date;
    rideTimeMinutes: number | null;
    avgPowerWatts: number | null;
    avgHeartRate: number | null;
    perceivedDifficulty: number | null;
    notes: string | null;
  }

  interface RouteItem {
    id: string;
    name: string;
    latestRide: RideSummary | null;
  }

  export let open = false;
  export let route: RouteItem | null = null;
  export let mode: "create" | "edit" = "create";
  export let onClose: () => void = () => {};

  let rideDate = "";
  let rideTimeMinutes = "";
  let avgPowerWatts = "";
  let avgHeartRate = "";
  let perceivedDifficulty = "";
  let notes = "";
  let submitting = false;

  function toLocalDateInputValue(dateInput: Date): string {
    const date = new Date(dateInput);
    const yyyy = date.getFullYear();
    const mm = `${date.getMonth() + 1}`.padStart(2, "0");
    const dd = `${date.getDate()}`.padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  $: if (open && route) {
    const existingRide = mode === "edit" ? route.latestRide : null;
    rideDate = existingRide
      ? toLocalDateInputValue(new Date(existingRide.rideDate))
      : toLocalDateInputValue(new Date());
    rideTimeMinutes = existingRide?.rideTimeMinutes?.toString() ?? "";
    avgPowerWatts = existingRide?.avgPowerWatts?.toString() ?? "";
    avgHeartRate = existingRide?.avgHeartRate?.toString() ?? "";
    perceivedDifficulty = existingRide?.perceivedDifficulty?.toString() ?? "";
    notes = existingRide?.notes ?? "";
  }

  $: title = mode === "edit" ? "Update Ride Log" : "Log Ride Completion";
  $: action = mode === "edit" ? "?/updateRide" : "?/completeRide";
</script>

<Modal {open} {title} onClose={onClose}>
  {#if route}
    <form
      method="POST"
      action={action}
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
      {#if mode === "edit" && route.latestRide}
        <input type="hidden" name="rideId" value={route.latestRide.id} />
      {/if}

      <div class="rounded-md bg-[var(--color-bg-surface-overlay)] p-3 text-sm text-[var(--color-text-secondary)]">
        Route: <span class="font-medium text-[var(--color-text-primary)]">{route.name}</span>
      </div>

      <label class="block">
        <span class="mb-1 block text-sm text-[var(--color-text-secondary)]">Ride Date</span>
        <input type="date" name="rideDate" bind:value={rideDate} required class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-3 py-2" />
      </label>

      <div class="grid gap-3 md:grid-cols-2">
        <label class="block">
          <span class="mb-1 block text-sm text-[var(--color-text-secondary)]">Ride Time (min)</span>
          <input type="number" min="0" name="rideTimeMinutes" bind:value={rideTimeMinutes} class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-3 py-2" />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm text-[var(--color-text-secondary)]">Perceived Difficulty (1-5)</span>
          <input type="number" min="1" max="5" name="perceivedDifficulty" bind:value={perceivedDifficulty} class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-3 py-2" />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm text-[var(--color-text-secondary)]">Average Power (W)</span>
          <input type="number" min="0" name="avgPowerWatts" bind:value={avgPowerWatts} class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-3 py-2" />
        </label>

        <label class="block">
          <span class="mb-1 block text-sm text-[var(--color-text-secondary)]">Average Heart Rate</span>
          <input type="number" min="0" name="avgHeartRate" bind:value={avgHeartRate} class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-3 py-2" />
        </label>
      </div>

      <label class="block">
        <span class="mb-1 block text-sm text-[var(--color-text-secondary)]">Notes</span>
        <textarea name="notes" rows="3" bind:value={notes} class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-3 py-2"></textarea>
      </label>

      <div class="flex justify-end gap-2">
        <button type="button" class="rounded-md border border-[var(--color-border)] px-4 py-2 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]" on:click={onClose}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          class="rounded-md bg-[var(--color-primary)] px-4 py-2 font-medium text-[#0e100f] hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving..." : mode === "edit" ? "Save Changes" : "Save Ride"}
        </button>
      </div>
    </form>
  {/if}
</Modal>
