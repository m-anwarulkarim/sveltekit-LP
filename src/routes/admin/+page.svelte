<script lang="ts">
	import {
		DashboardStats,
		DashboardChart,
		RecentOrdersTable
	} from './_components/dashboard';

	let { data }: { data: any } = $props();
</script>

<div class="space-y-6 max-w-7xl mx-auto">
	<!-- 6 KPI Metric Summary Cards -->
	<DashboardStats {data} />

	<!-- Visual Dual Analytics Section -->
	<DashboardChart {data} />

	<!-- Recent Web Orders Quick Preview -->
	<RecentOrdersTable {data} />
</div>
