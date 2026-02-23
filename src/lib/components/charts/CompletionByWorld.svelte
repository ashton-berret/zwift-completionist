<script lang="ts">
  import EChart from "./EChart.svelte";
  import type { EChartsOption } from "echarts";

  export let data: { world: string; completed: number; total: number; color: string }[] = [];

  $: option = {
    tooltip: {
      trigger: "item",
      formatter: (params: { name: string; value: number }) => {
        const row = data.find((item) => item.world === params.name);
        if (!row) return params.name;
        const pct = row.total ? ((row.completed / row.total) * 100).toFixed(1) : "0.0";
        return `${row.world}: ${row.completed}/${row.total} (${pct}%)`;
      },
    },
    legend: {
      bottom: 0,
      type: "scroll",
    },
    series: [
      {
        name: "Completion by World",
        type: "pie",
        radius: ["45%", "70%"],
        center: ["50%", "45%"],
        label: {
          formatter: "{b}\n{d}%",
        },
        data: data.map((row) => ({
          name: row.world,
          value: row.completed,
          itemStyle: { color: row.color },
        })),
      },
    ],
  } as EChartsOption;
</script>

<EChart {option} height="320px" />
