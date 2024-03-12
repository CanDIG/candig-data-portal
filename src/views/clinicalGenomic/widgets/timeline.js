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

function Timeline() {
    const taskColors = ['#1565c0', '#1c812e', '#ffb800', '#1e88e5', '#36b84c', '#ffd34f'];

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
            }
        },
        xAxis: {
            gridLineWidth: 1,
            gridLineColor: '#e6e6e6'
        },
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
        rangeSelector: {
            enabled: true,
            selected: 0
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
                        start: Date.UTC(2017, 11, 1),
                        end: Date.UTC(2018, 1, 2),
                        completed: { amount: 1 },
                        name: 'Surgery',
                        color: taskColors[0]
                    },
                    {
                        start: Date.UTC(2018, 11, 9),
                        end: Date.UTC(2018, 11, 19),
                        completed: { amount: 0.3 },
                        name: 'Chemotherapy',
                        color: taskColors[3]
                    }
                ]
            },
            {
                type: 'scatter',
                name: 'Key Dates',
                data: [
                    {
                        x: Date.UTC(2017, 12, 30),
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
                    pointFormat: '{point.name}: {point.x:%e. %b}'
                },
                showInLegend: true
            },
            {
                type: 'scatter',
                name: 'Primary Diagnosis',
                data: [
                    {
                        x: Date.UTC(2017, 11, 30),
                        y: 0,
                        name: 'Breast'
                    },
                    {
                        x: Date.UTC(2018, 1, 30),
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
                    pointFormat: '{point.name}: {point.x:%e. %b}'
                },
                showInLegend: true
            }
        ]
    };

    return <HighchartsReact highcharts={Highcharts} constructorType="ganttChart" options={chartOptions} />;
}

export default Timeline;
