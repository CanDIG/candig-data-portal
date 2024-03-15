import React from 'react';
import Highcharts from 'highcharts';
import HighchartsGantt from 'highcharts/modules/gantt';
import HighchartsReact from 'highcharts-react-official';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import patientData from '../useClinicalPatientData';

// Initialize the Gantt module
HighchartsGantt(Highcharts);
HighchartsExporting(Highcharts);
HighchartsAccessibility(Highcharts);

const headerFormatter = () =>
    function () {
        const startDate = Date.UTC(2017, 11, 1);
        const monthsSinceStart = Math.floor((this.value - startDate) / (30 * 24 * 3600 * 1000)) + 1;
        return `Month ${monthsSinceStart}`;
    };
    
function calculateDateFromMonthInterval(initialDateUTC, monthInterval) {
    // Parse the initial UTC date string to a Date object
    const initialDate = new Date(initialDateUTC);
    // Calculate the new date by adding the month interval
    initialDate.setMonth(initialDate.getMonth() + monthInterval);
    // Return the time in milliseconds (suitable for Highcharts)
    return initialDate.getTime();
    };

const treatmentStartDate = filteredData.primary_diagnoses.treatments.start_date.month_interval;
const treatmentEndDate = filteredData.primary_diagnoses.treatments.end_date.month_interval;
const treatments = patientData.treatments.map(treatment => ({
    start: calculateDateFromMonthInterval(startDate, treatmentEndDate),
    end: calculateDateFromMonthInterval(startDate, treatmentStartDate ),
    name: treatment.name
    }));
    
const keyDates = patientData.keyDates.map(event => ({
    x: calculateDateFromMonthInterval(patientData.initialDate, event.monthInterval),
    name: event.name
    }));

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
        xAxis: {
            minRange: 14 * 24 * 3600 * 1000,
            labels: {
                formatter: headerFormatter()
            }
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
                        name: 'Treatment',
                        id: 'treatment'
                    },
                    {
                        start: Date.UTC(2017, 11, 1),
                        end: Date.UTC(2018, 1, 2),
                        name: 'Surgery',
                        parent: 'treatment'
                    },
                    {
                        start: Date.UTC(2018, 11, 9),
                        end: Date.UTC(2018, 11, 19),
                        name: 'Chemotherapy',
                        parent: 'treatment'
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
