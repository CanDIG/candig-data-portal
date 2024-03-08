import React, { useEffect } from 'react';
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
    const taskColors = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80'];

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
                name: 'Project 1',
                data: [
                    {
                        y: 0,
                        start: Date.UTC(2017, 11, 1),
                        end: Date.UTC(2018, 1, 2),
                        completed: { amount: 1 },
                        name: 'Treatment',
                        color: taskColors[0]
                    },
                    {
                        y: 1,
                        start: Date.UTC(2018, 1, 2),
                        end: Date.UTC(2018, 11, 5),
                        completed: { amount: 0.5 },
                        name: 'Treatment',
                        color: taskColors[1]
                    },
                    {
                        y: 2,
                        start: Date.UTC(2018, 11, 8),
                        end: Date.UTC(2018, 11, 9),
                        completed: { amount: 0.15 },
                        name: 'Treatment',
                        color: taskColors[2]
                    },
                    {
                        y: 3,
                        start: Date.UTC(2018, 11, 9),
                        end: Date.UTC(2018, 11, 19),
                        completed: { amount: 0.3 },
                        name: 'Development',
                        color: taskColors[3]
                    },
                    { y: 4, start: Date.UTC(2018, 11, 10), end: Date.UTC(2018, 11, 23), name: 'Testing', color: taskColors[4] },
                    { y: 5, start: Date.UTC(2018, 11, 25, 8), end: Date.UTC(2018, 11, 25, 16), name: 'Release', color: taskColors[5] }
                ]
            }
        ]
    };

    useEffect(() => {
        // Clean up on unmount
        return () => Highcharts.charts.forEach((chart) => chart && chart.container && chart.destroy());
    }, []);

    return <HighchartsReact highcharts={Highcharts} constructorType={'ganttChart'} options={chartOptions} />;
}

export default Timeline;
