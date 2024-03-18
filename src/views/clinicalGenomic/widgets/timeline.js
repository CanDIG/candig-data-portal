import React from 'react';
import Highcharts from 'highcharts';
import HighchartsGantt from 'highcharts/modules/gantt';
import HighchartsReact from 'highcharts-react-official';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsAccessibility from 'highcharts/modules/accessibility';

// Initialize the Gantt module
HighchartsGantt(Highcharts);
HighchartsExporting(Highcharts);
HighchartsAccessibility(Highcharts);

const headerFormatterMonth = () =>
    function () {
        const startDate = 0;
        const monthsSinceStart = Math.floor(this.value - startDate) + 1;
        return `Month ${monthsSinceStart}`;
    };

const headerFormatterYear = () =>
    function () {
        const yearSinceStart = Math.ceil((this.value + 1) / 12);
        return `Year ${yearSinceStart}`;
    };

function Timeline() {
    const chartOptions = {
        chart: {
            height: 600
        },
        title: {
            text: 'Patient Timeline',
            style: {
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold'
            }
        },
        yAxis: {
            uniqueNames: true,
            labels: {
                style: {
                    fontFamily: 'Arial, sans-serif'
                }
            },
            minRange: '200px'
        },
        xAxis: [
            {
                type: 'linear',
                tickInterval: 1,
                minRange: 12,
                labels: {
                    align: 'center',
                    formatter: headerFormatterMonth()
                }
            },
            {
                type: 'linear',
                linkedTo: 0,
                tickInterval: 1,
                minRange: 12,
                labels: {
                    align: 'center',
                    formatter: headerFormatterYear()
                },
                opposite: true
            }
        ],
        navigator: {
            enabled: true,
            liveRedraw: true,
            series: {
                type: 'gantt',
                pointPlacement: 0.5,
                pointPadding: 0.25,
                accessibility: {
                    enabled: false
                }
            },
            xAxis: {
                labels: {
                    enabled: false
                }
            },
            yAxis: {
                min: 0,
                max: 3,
                reversed: true,
                categories: []
            }
        },
        scrollbar: {
            enabled: true
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}',
                    style: {
                        textOutline: 'none',
                        color: '#333333',
                        fontFamily: 'Arial, sans-serif'
                    }
                }
            }
        },
        series: [
            {
                name: 'Treatment',
                data: [
                    {
                        start: 0,
                        end: 100,
                        name: 'Treatment',
                        id: 'treatment'
                    },
                    {
                        start: 2,
                        end: 15,
                        name: 'Surgery',
                        parent: 'treatment'
                    },
                    {
                        start: 3,
                        end: 28,
                        name: 'Chemotherapy',
                        parent: 'treatment'
                    }
                ],
                tooltip: {
                    pointFormat: 'Start: Month {point.start} End: Month {point.end}'
                }
            },
            {
                type: 'scatter',
                name: 'Key Dates',
                data: [
                    {
                        x: 5,
                        y: 0,
                        name: 'Specimen Collection'
                    }
                ],
                marker: {
                    enabled: true,
                    symbol: 'circle',
                    radius: 4
                },
                tooltip: {
                    pointFormat: '{point.name}: {point.x}'
                },
                showInLegend: true
            },
            {
                type: 'scatter',
                name: 'Primary Diagnosis',
                data: [
                    {
                        x: 10,
                        y: 0,
                        name: 'Breast'
                    },
                    {
                        x: 25,
                        y: 0,
                        name: 'Lip'
                    }
                ],
                marker: {
                    enabled: true,
                    symbol: 'circle',
                    radius: 4
                },
                tooltip: {
                    pointFormat: '{point.name}: {point.x}'
                },
                showInLegend: true
            }
        ]
    };

    return <HighchartsReact highcharts={Highcharts} constructorType="ganttChart" options={chartOptions} />;
}

export default Timeline;
