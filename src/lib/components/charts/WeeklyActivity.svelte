<script lang="ts">
  import EChart from "./EChart.svelte";
  import type { EChartsOption } from "echarts";

  export let data: { week: string; distance: number; timeMinutes: number; rides: number }[] = [];

  $: option = {
    tooltip: {
      trigger: "axis",
    },
    legend: {
      top: 0,
      data: ["Distance (km)", "Ride Time (min)"],
    },
    grid: {
      left: 48,
      right: 48,
      top: 40,
      bottom: 40,
    },
    xAxis: {
      type: "category",
      data: data.map((row) => row.week),
    },
    yAxis: [
      {
        type: "value",
        name: "km",
      },
      {
        type: "value",
        name: "min",
      },
    ],
    series: [
      {
        name: "Distance (km)",
        type: "bar",
        data: data.map((row) => row.distance),
        itemStyle: { color: "#FF6B00" },
      },
      {
        name: "Ride Time (min)",
        type: "line",
        yAxisIndex: 1,
        smooth: true,
        data: data.map((row) => row.timeMinutes),
        itemStyle: { color: "#3B82F6" },
      },
    ],
  } as EChartsOption;
</script>

<EChart {option} height="320px" />
