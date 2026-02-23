<script lang="ts">
  export let search = "";
  export let selectedWorld = "all";
  export let selectedDifficulty = "all";
  export let selectedStatus = "all";
  export let selectedSort = "name-asc";
  export let worlds: string[] = [];

  function applyLadder() {
    selectedSort = "ladder";
  }
</script>

<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
  <div class="grid gap-3 md:grid-cols-5">
    <label class="block">
      <span class="mb-1 block text-sm text-[var(--color-text-secondary)]">Search</span>
      <input
        type="text"
        bind:value={search}
        placeholder="Route name..."
        class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-3 py-2"
      />
    </label>

    <label class="block">
      <span class="mb-1 block text-sm text-[var(--color-text-secondary)]">World</span>
      <select bind:value={selectedWorld} class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-3 py-2">
        <option value="all">All Worlds</option>
        {#each worlds as world}
          <option value={world}>{world}</option>
        {/each}
      </select>
    </label>

    <label class="block">
      <span class="mb-1 block text-sm text-[var(--color-text-secondary)]">Difficulty</span>
      <select bind:value={selectedDifficulty} class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-3 py-2">
        <option value="all">All</option>
        <option value="1">1/5</option>
        <option value="2">2/5</option>
        <option value="3">3/5</option>
        <option value="4">4/5</option>
        <option value="5">5/5</option>
      </select>
    </label>

    <label class="block">
      <span class="mb-1 block text-sm text-[var(--color-text-secondary)]">Status</span>
      <select bind:value={selectedStatus} class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-3 py-2">
        <option value="all">All</option>
        <option value="completed">Completed</option>
        <option value="remaining">Remaining</option>
      </select>
    </label>

    <label class="block">
      <span class="mb-1 block text-sm text-[var(--color-text-secondary)]">Sort</span>
      <select bind:value={selectedSort} class="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface-overlay)] px-3 py-2">
        <option value="ladder">Ladder (Short + Low Climb + Easy)</option>
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
        <option value="world-asc">World</option>
        <option value="distance-asc">Length (Shortest -> Longest)</option>
        <option value="distance-desc">Length (Longest -> Shortest)</option>
        <option value="elevation-asc">Elevation (Lowest -> Highest)</option>
        <option value="elevation-desc">Elevation (Highest -> Lowest)</option>
        <option value="difficulty-asc">Difficulty (Easiest -> Hardest)</option>
        <option value="difficulty-desc">Difficulty (Hardest -> Easiest)</option>
      </select>
      <button
        type="button"
        class="mt-2 w-full rounded-md border border-[var(--color-primary)]/40 px-3 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
        on:click={applyLadder}
      >
        Apply Ladder
      </button>
    </label>
  </div>
</div>
