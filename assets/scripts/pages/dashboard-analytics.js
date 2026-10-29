/**
 * Analytics Dashboard Charts
 */
if (typeof echarts !== 'undefined') {
    const styles = getComputedStyle(document.documentElement);
    const token = name => styles.getPropertyValue(`--${name}`).trim();
    // === BAR CHART ===
    const $barDom = $('#barChart');
    if ($barDom.length) {
        const barChart = echarts.init($barDom[0], 'naha');
        const barOption = {
            tooltip: { trigger: 'axis' },
            legend: { bottom: 0 },
            xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            },
            yAxis: { type: 'value' },
            series: [
                {
                    name: 'Active',
                    data: [120, 200, 150, 80, 70, 110, 130],
                    type: 'bar',
                    itemStyle: { color: token('nd-primary') }
                },
                {
                    name: 'Inactive',
                    data: [60, 100, 90, 40, 50, 70, 60],
                    type: 'bar',
                    itemStyle: { color: token('nd-chart-2') }
                }
            ]
        };
        barChart.setOption(barOption);
        $(window).on('resize', () => barChart.resize());
    }

    // === PIE CHART ===
    const $pieDom = $('#pieChart');
    if ($pieDom.length) {
        const pieChart = echarts.init($pieDom[0], 'naha');
        const pieOption = {
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: { bottom: 0 },
            series: [
                {
                    name: 'Customer Status',
                    type: 'pie',
                    radius: '65%',
                    center: ['50%', '50%'],
                    data: [
                        { value: 1048, name: 'Active', itemStyle: { color: token('nd-success') } },
                        { value: 735, name: 'Inactive', itemStyle: { color: token('nd-chart-6') } },
                        { value: 580, name: 'Pending', itemStyle: { color: token('nd-warning') } },
                        { value: 484, name: 'Banned', itemStyle: { color: token('nd-danger') } },
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: `rgba(${token('bs-body-color-rgb')}, 0.12)`
                        }
                    }
                }
            ]
        };
        pieChart.setOption(pieOption);
        $(window).on('resize', () => pieChart.resize());
    }
}
