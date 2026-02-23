<script lang="ts">
  import { theme, unitPreference } from "$lib/stores";
</script>

<svelte:head>
  <title>Settings - Zwift Tracker</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold">Settings</h1>
    <p class="mt-1 text-sm text-[var(--color-text-secondary)]">Display preferences for your tracker.</p>
  </div>

  <section class="grid gap-4 md:grid-cols-2">
    <div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <h2 class="text-lg font-semibold">Theme</h2>
      <p class="mt-2 text-sm text-[var(--color-text-secondary)]">Choose your preferred color mode.</p>
      <div class="mt-4 flex gap-2">
        <button
          type="button"
          class={`rounded-md px-4 py-2 text-sm font-medium ${
            $theme === "dark"
              ? "bg-[var(--color-primary)] text-[#0e100f]"
              : "border border-[var(--color-border)] text-[var(--color-text-secondary)]"
          }`}
          on:click={() => theme.setTheme("dark")}
        >
          Dark
        </button>
        <button
          type="button"
          class={`rounded-md px-4 py-2 text-sm font-medium ${
            $theme === "light"
              ? "bg-[var(--color-primary)] text-[#0e100f]"
              : "border border-[var(--color-border)] text-[var(--color-text-secondary)]"
          }`}
          on:click={() => theme.setTheme("light")}
        >
          Light
        </button>
      </div>
    </div>

    <div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
      <h2 class="text-lg font-semibold">Units</h2>
      <p class="mt-2 text-sm text-[var(--color-text-secondary)]">Distance and elevation display units.</p>
      <div class="mt-4 flex gap-2">
        <button
          type="button"
          class={`rounded-md px-4 py-2 text-sm font-medium ${
            $unitPreference === "km"
              ? "bg-[var(--color-primary)] text-[#0e100f]"
              : "border border-[var(--color-border)] text-[var(--color-text-secondary)]"
          }`}
          on:click={() => unitPreference.setUnits("km")}
        >
          Kilometers
        </button>
        <button
          type="button"
          class={`rounded-md px-4 py-2 text-sm font-medium ${
            $unitPreference === "mi"
              ? "bg-[var(--color-primary)] text-[#0e100f]"
              : "border border-[var(--color-border)] text-[var(--color-text-secondary)]"
          }`}
          on:click={() => unitPreference.setUnits("mi")}
        >
          Miles
        </button>
      </div>
    </div>
  </section>
</div>
