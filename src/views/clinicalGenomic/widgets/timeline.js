/* eslint-disable arrow-body-style */
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
    // Data for the Gantt chart
    const chartOptions = {
        title: {
            text: 'Patient Timeline'
        },
        yAxis: {
            uniqueNames: true
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
        accessibility: {
            point: {
                descriptionFormat:
                    '{yCategory}. ' +
                    '{#if completed}Task {(multiply completed.amount 100):.1f}% completed. {/if}' +
                    'Start {x:%Y-%m-%d}, end {x2:%Y-%m-%d}.'
            },
            series: {
                descriptionFormat: '{name}'
            }
        },
        lang: {
            accessibility: {
                axis: {
                    xAxisDescriptionPlural: 'The chart has a two-part X axis showing time in both week numbers and days.',
                    yAxisDescriptionPlural: 'The chart has one Y axis showing task categories.'
                }
            }
        },
        series: [
            {
                name: 'Project 1',
                data: [
                    {   y: 0,
                        start: Date.UTC(2017, 11, 1),
                        end: Date.UTC(2018, 1, 2),
                        name: 'Treatment',
                        completed: {
                            amount: 1
                        }
                    },
                    {   y: 1,
                        start: Date.UTC(2018, 1, 2),
                        end: Date.UTC(2018, 11, 5),
                        name: 'Treatment',
                        completed: {
                            amount: 0.5
                        }
                    },
                    {   y: 2,
                        start: Date.UTC(2018, 11, 8),
                        end: Date.UTC(2018, 11, 9),
                        name: 'Treatment',
                        completed: {
                            amount: 0.15
                        }
                    },
                    {   y: 3,
                        start: Date.UTC(2018, 11, 9),
                        end: Date.UTC(2018, 11, 19),
                        name: 'Development',
                        completed: {
                            amount: 0.3
                        }
                    },
                    {   y: 4,
                        start: Date.UTC(2018, 11, 10),
                        end: Date.UTC(2018, 11, 23),
                        name: 'Testing'
                    },
                    {   y: 5,
                        start: Date.UTC(2018, 11, 25, 8),
                        end: Date.UTC(2018, 11, 25, 16),
                        name: 'Release'
                    }
                ]
            }
        ]
    };

    useEffect(() => {
        // Clean up on unmount
        return () => Highcharts.charts.forEach((chart) => chart && chart.container && chart.destroy());
    }, []);

    return <HighchartsReact highcharts={Highcharts} constructorType={"ganttChart"} options={chartOptions} />;
}

export default Timeline;
