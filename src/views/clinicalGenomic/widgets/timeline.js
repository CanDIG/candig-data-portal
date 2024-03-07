/* eslint-disable arrow-body-style */
import React, { useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsGantt from 'highcharts/modules/gantt';
import HighchartsReact from 'highcharts-react-official';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import useClinicalPatientData from './useClinicalPatientData';

// Initialize the Gantt module
HighchartsGantt(Highcharts);
HighchartsExporting(Highcharts);
HighchartsAccessibility(Highcharts);

function Timeline() {
    // Data for the Gantt chart
    let data = [{}]
    const date_data = useClinicalPatientData(patientId, programId);

    for (let x = 0; x < date_data.length; x++) {
        data.push({
            name: date_data[x].title,
            start: date_data[x].start,
            end: date_data[x],
            y: x
        })
    };

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
        series: [{
            data: data,
        }]
    };

    useEffect(() => {
        // Clean up on unmount
        return () => Highcharts.charts.forEach((chart) => chart && chart.container && chart.destroy());
    }, []);

    return <HighchartsReact highcharts={Highcharts} constructorType={"ganttChart"} options={chartOptions} />;
}

export default Timeline;
