<script lang="ts">
  import { page } from "$app/stores";

  export let user: { id: string; username: string };
  export let mobileOpen = false;
  export let onClose: () => void = () => {};

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/routes", label: "Routes" },
    { href: "/import", label: "Import" },
    { href: "/settings", label: "Settings" },
  ];

  function closeIfMobile() {
    onClose();
  }
</script>

{#if mobileOpen}
  <button
    type="button"
    class="fixed inset-0 z-30 bg-black/50 md:hidden"
    on:click={onClose}
    aria-label="Close navigation"
  ></button>
{/if}

<aside
  class={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 transition-transform md:translate-x-0 ${
    mobileOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>
  <div class="mb-8">
    <h1 class="text-xl font-bold text-[var(--color-primary)]">Zwift Tracker</h1>
    <p class="mt-1 text-sm text-[var(--color-text-secondary)]">{user.username}</p>
  </div>

  <nav class="space-y-2">
    {#each navItems as item}
      {@const active = $page.url.pathname === item.href}
      <a
        href={item.href}
        class={`block rounded-md px-4 py-2 transition ${
          active
            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary-glow)]"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface-overlay)] hover:text-[var(--color-text-primary)]"
        }`}
        on:click={closeIfMobile}
      >
        {item.label}
      </a>
    {/each}
  </nav>

  <form method="POST" action="/logout" class="mt-8">
    <button
      type="submit"
      class="w-full rounded-md border border-[var(--color-border)] px-4 py-2 text-left text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
    >
      Logout
    </button>
  </form>
</aside>
