<script lang="ts">
  import EChart from "./EChart.svelte";
  import type { EChartsOption } from "echarts";

  export let data: { difficulty: number; completed: number; total: number }[] = [];

  $: option = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: {
      top: 0,
      data: ["Completed", "Remaining"],
    },
    grid: {
      left: 48,
      right: 24,
      top: 40,
      bottom: 24,
    },
    xAxis: {
      type: "value",
    },
    yAxis: {
      type: "category",
      data: data.map((row) => `${row.difficulty}/5`),
    },
    series: [
      {
        name: "Completed",
        type: "bar",
        stack: "total",
        data: data.map((row) => row.completed),
        itemStyle: { color: "#0AE448" },
      },
      {
        name: "Remaining",
        type: "bar",
        stack: "total",
        data: data.map((row) => Math.max(row.total - row.completed, 0)),
        itemStyle: { color: "#374151" },
      },
    ],
  } as EChartsOption;
</script>

<EChart {option} height="320px" />
