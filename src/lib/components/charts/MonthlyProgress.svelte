<script lang="ts">
  import EChart from "./EChart.svelte";
  import type { EChartsOption } from "echarts";

  export let data: { month: string; cumulativeRoutes: number; cumulativeDistance: number }[] = [];

  $: option = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      top: 0,
      data: ["Cumulative Routes", "Cumulative Distance (km)"],
    },
    grid: {
      left: 48,
      right: 48,
      top: 40,
      bottom: 40,
    },
    xAxis: {
      type: "category",
      data: data.map((row) => row.month),
    },
    yAxis: [
      {
        type: "value",
        name: "Routes",
      },
      {
        type: "value",
        name: "km",
      },
    ],
    series: [
      {
        name: "Cumulative Routes",
        type: "line",
        areaStyle: { opacity: 0.2 },
        smooth: true,
        data: data.map((row) => row.cumulativeRoutes),
        itemStyle: { color: "#FF6B00" },
      },
      {
        name: "Cumulative Distance (km)",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: data.map((row) => row.cumulativeDistance),
        itemStyle: { color: "#14B8A6" },
      },
    ],
  } as EChartsOption;
</script>

<EChart {option} height="320px" />
