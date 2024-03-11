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
                name: 'Patient Events',
                data: [
                    {
                        start: Date.UTC(2017, 11, 1),
                        end: Date.UTC(2018, 1, 2),
                        completed: { amount: 1 },
                        name: 'Treatment',
                        color: taskColors[0]
                    },
                    {
                        start: Date.UTC(2018, 1, 2),
                        end: Date.UTC(2018, 11, 5),
                        completed: { amount: 0.5 },
                        name: 'Comorbidities',
                        color: taskColors[1]
                    },
                    {
                        start: Date.UTC(2018, 11, 8),
                        end: Date.UTC(2018, 11, 9),
                        completed: { amount: 0.15 },
                        name: 'Primary Diagnosis',
                        color: taskColors[2]
                    },
                    {
                        start: Date.UTC(2018, 11, 9),
                        end: Date.UTC(2018, 11, 19),
                        completed: { amount: 0.3 },
                        name: 'Treatment',
                        color: taskColors[3]
                    },
                    { start: Date.UTC(2018, 11, 10), end: Date.UTC(2018, 11, 23), name: 'Comorbidities', color: taskColors[4] },
                    { start: Date.UTC(2018, 11, 25, 8), end: Date.UTC(2018, 11, 25, 16), name: 'Primary Diagnosis', color: taskColors[5] }
                ]
            },
            {
                type: 'scatter',
                name: 'Key Dates',
                data: [
                    {
                        x: Date.UTC(2018, 12, 11),
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
            }
        ]
    };

    return <HighchartsReact highcharts={Highcharts} constructorType="ganttChart" options={chartOptions} />;
}

export default Timeline;
