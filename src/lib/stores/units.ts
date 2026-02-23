import { browser } from "$app/environment";
import { writable } from "svelte/store";

export type UnitPreference = "km" | "mi";

const STORAGE_KEY = "zwift-units";

function createUnitStore() {
  const { subscribe, set, update } = writable<UnitPreference>("mi");

  function persist(units: UnitPreference) {
    if (!browser) return;
    localStorage.setItem(STORAGE_KEY, units);
  }

  return {
    subscribe,
    initialize: () => {
      if (!browser) return;
      const stored = localStorage.getItem(STORAGE_KEY);
      const units: UnitPreference = stored === "km" ? "km" : "mi";
      set(units);
      persist(units);
    },
    setUnits: (units: UnitPreference) => {
      set(units);
      persist(units);
    },
    toggle: () => {
      update((current) => {
        const next: UnitPreference = current === "km" ? "mi" : "km";
        persist(next);
        return next;
      });
    },
  };
}

export const unitPreference = createUnitStore();
