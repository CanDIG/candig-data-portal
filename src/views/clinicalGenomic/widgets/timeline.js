import { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsGantt from 'highcharts/modules/gantt';
import HighchartsReact from 'highcharts-react-official';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import useClinicalPatientData from '../useClinicalPatientData';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';

// Initialize the Gantt module
HighchartsGantt(Highcharts);
HighchartsExporting(Highcharts);
HighchartsAccessibility(Highcharts);

const colorPalette = [
    '#0A407D', // Deep Sapphire
    '#0D5A1B', // Dark Fern
    '#FC9803', // California
    '#1565C0', // Denim
    '#1C821E', // Forest Green
    '#FFB800', // Selective Yellow
    '#1E88E5', // Picton Blue
    '#368B4C', // Emerald
    '#FFD34F', // Mustard
    '#90CAF9', // Malibu
    '#A8FEB6', // Mint Green
    '#FBE7AA', // Banana Mania
    '#E3F2FD', // Hawkes Blue
    '#E4FFE9', // Hint of Green
    '#FFF8E4' // Early Dawn
];

const generateRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colorPalette.length);
    return colorPalette[randomIndex];
};

const headerFormatter = (birthDate, dateResolution) =>
    function headerFormatter() {
        if (dateResolution === 'Month' && typeof birthDate !== 'undefined') {
            const monthsSinceStart = Math.floor(this.value - birthDate) + 1;
            return `${monthsSinceStart} Month(s) Old`;
        }
        if (dateResolution === 'Year' && typeof birthDate !== 'undefined') {
            const yearsSinceStart = Math.ceil((this.value - birthDate) / 12);
            return `${yearsSinceStart} Year(s) Old`;
        }
        return `Age Unknown`;
    };

const treatmentFormatter = (birthDate) =>
    function treatmentFormatter() {
        if (this.extra_info) {
            const monthInAgeExtra = Math.floor(this.x - birthDate) + 1;
            const extraInfo = `${this.extra_info} : ${monthInAgeExtra} Month(s) Old`;
            const missingInfo = this.missing_info === 'Start' ? 'Start Date Missing' : 'End Date Missing';
            const treatmentType = this.treatment_type ? `Type: ${this.treatment_type}` : 'Treatment type not specified';
            return `<span style="font-weight: bold">${this.name || 'Treatment'}</span><br/>
                    ${treatmentType}<br/>
                    ${extraInfo}<br/>
                    ${missingInfo}<br/>`;
        }
        const monthInAgeStart = Math.floor(this.start - birthDate) + 1;
        const monthInAgeEnd = Math.floor(this.end - birthDate) + 1;
        const startMonth = `Start: ${monthInAgeStart} Month(s) Old`;
        const endMonth = `End: ${monthInAgeEnd} Month(s) Old`;
        const treatmentType = this.treatment_type ? `Type: ${this.treatment_type}` : 'Treatment type not specified';
        return `<span style="font-weight: bold">${this.name || 'Treatment'}</span><br/>
                ${treatmentType}<br/>
                ${startMonth}<br/>
                ${endMonth}<br/>`;
    };

function Timeline({ patientId, programId }) {
    const { data } = useClinicalPatientData(patientId, programId);
    const [chartOptions, setChartOptions] = useState({});
    useEffect(() => {
        const treatmentIntervals = [];
        const treatmentPoints = [];

        data.primary_diagnoses?.forEach((diagnosis) =>
            diagnosis.treatments?.forEach((treatment) => {
                const treatmentStart = treatment.treatment_start_date?.month_interval;
                const treatmentEnd = treatment.treatment_end_date?.month_interval;

                if (treatmentStart !== null && treatmentStart !== undefined && treatmentEnd !== null && treatmentEnd !== undefined) {
                    treatmentIntervals.push({
                        name: treatment.submitter_treatment_id,
                        start: treatmentStart,
                        end: treatmentEnd,
                        treatment_type: treatment?.treatment_type,
                        y: 2,
                        color: generateRandomColor()
                    });
                } else if (
                    (treatmentStart !== null && treatmentStart !== undefined) ||
                    (treatmentEnd !== null && treatmentEnd !== undefined)
                ) {
                    treatmentPoints.push({
                        x: treatmentStart,
                        name: treatment.submitter_treatment_id,
                        y: 2,
                        color: generateRandomColor(),
                        treatment_type: treatment?.treatment_type,
                        extra_info: treatmentStart !== null ? 'Start' : 'End',
                        missing_info: treatmentStart !== null ? 'End' : 'Start'
                    });
                }
            })
        );

        const generateSeriesData = (data, path, path2, date, id, yValue, colour, namePrefix, isSingleItem, name) => {
            if (isSingleItem) {
                return data?.[path]?.month_interval
                    ? [
                          {
                              x: data[path].month_interval,
                              y: yValue,
                              name: namePrefix,
                              color: colour
                          }
                      ]
                    : [];
            }

            if (path === 'biomarkers' || path === 'primary_diagnoses' || name === 'Followup&Relapse2') {
                return Array.isArray(data?.[path])
                    ? data[path].map((item) => ({
                          x: item?.[date]?.month_interval,
                          y: yValue,
                          name: `${namePrefix}${item?.[id]}`,
                          color: colour
                      }))
                    : [];
            }

            if (name === 'Followup&Relapse1' || path === 'specimens') {
                return (
                    data?.flatMap((item) =>
                        Array.isArray(item?.[path])
                            ? item[path].map((subItem) => ({
                                  x: subItem?.[date]?.month_interval,
                                  y: yValue,
                                  name: `${namePrefix}${subItem?.[id]}`,
                                  color: colour
                              }))
                            : []
                    ) || []
                );
            }

            return (
                data?.flatMap((item) =>
                    Array.isArray(item?.[path])
                        ? item[path].flatMap((subItem) =>
                              Array.isArray(subItem?.[path2])
                                  ? subItem[path2].map((subItem2) => ({
                                        x: subItem2?.[date]?.month_interval,
                                        y: yValue,
                                        name: `${namePrefix}${subItem2?.[id]}`,
                                        color: colour
                                    }))
                                  : []
                          )
                        : []
                ) || []
            );
        };

        const dateOfBirthSeries = generateSeriesData(
            data,
            'date_of_birth',
            null,
            null,
            null,
            0,
            colorPalette[1],
            'Date of Birth',
            true,
            null
        );
        const dateOfDeathSeries = generateSeriesData(
            data,
            'date_of_death',
            null,
            null,
            null,
            0,
            colorPalette[2],
            'Date of Death',
            true,
            null
        );
        const dateAliveAfterLostToFollowupSeries = generateSeriesData(
            data,
            'date_alive_after_lost_to_followup',
            null,
            null,
            null,
            0,
            colorPalette[3],
            'Date Alive After Lost to Followup',
            true,
            null
        );
        const testDateSeries = generateSeriesData(
            data,
            'biomarkers',
            null,
            'test_date',
            'submitter_primary_diagnosis_id',
            3,
            colorPalette[4],
            '',
            false,
            null
        );
        const specimenCollectionSeries = generateSeriesData(
            data?.primary_diagnoses,
            'specimens',
            null,
            'specimen_collection_date',
            'submitter_specimen_id',
            4,
            colorPalette[5],
            '',
            false,
            'Specimens'
        );
        const primaryDiagnosisSeries = generateSeriesData(
            data,
            'primary_diagnoses',
            null,
            'date_of_diagnosis',
            'submitter_primary_diagnosis_id',
            1,
            colorPalette[0],
            '',
            false,
            null
        );
        const followupSeries1 = generateSeriesData(
            data?.primary_diagnoses,
            'followups',
            null,
            'date_of_followup',
            'submitter_follow_up_id',
            5,
            colorPalette[6],
            'Followup ',
            false,
            'Followup&Relapse1'
        );
        const relapseSeries1 = generateSeriesData(
            data?.primary_diagnoses,
            'followups',
            null,
            'date_of_relapse',
            'submitter_follow_up_id',
            5,
            colorPalette[7],
            'Relapse ',
            false,
            'Followup&Relapse1'
        );
        const followupSeries2 = generateSeriesData(
            data,
            'followups',
            null,
            'date_of_followup',
            'submitter_follow_up_id',
            5,
            colorPalette[6],
            'Followup ',
            false,
            'Followup&Relapse2'
        );
        const relapseSeries2 = generateSeriesData(
            data,
            'followups',
            null,
            'date_of_relapse',
            'submitter_follow_up_id',
            5,
            colorPalette[7],
            'Relapse ',
            false,
            'Followup&Relapse2'
        );
        const followupSeries3 = generateSeriesData(
            data?.primary_diagnoses,
            'treatments',
            'followups',
            'date_of_followup',
            'submitter_follow_up_id',
            5,
            colorPalette[6],
            'Followup ',
            false,
            'Followup&Relapse3'
        );
        const relapseSeries3 = generateSeriesData(
            data?.primary_diagnoses,
            'treatments',
            'followups',
            'date_of_relapse',
            'submitter_follow_up_id',
            5,
            colorPalette[7],
            'Relapse ',
            false,
            'Followup&Relapse3'
        );

        setChartOptions({
            chart: {
                height: 600,
                marginRight: 50
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
                        fontFamily: 'Arial, sans-serif',
                        fontWeight: 'bold'
                    }
                },
                min: 0,
                minRange: 0,
                type: 'category',
                categories: [
                    'Major Life Events',
                    'Primary Diagnosis',
                    'Treatment',
                    'Test Date',
                    'Specimen Collection Date',
                    'Followup & Relapse'
                ]
            },
            xAxis: [
                {
                    type: 'linear',
                    tickInterval: 1,
                    minRange: 6,
                    labels: {
                        align: 'center',
                        formatter: headerFormatter(data?.date_of_birth?.month_interval, 'Month')
                    },
                    plotLines: [
                        {
                            color: colorPalette[0],
                            value: 0,
                            width: 2,
                            zIndex: 5,
                            label: {
                                text: 'First Day of Diagnosis',
                                align: 'left',
                                verticalAlign: 'top',
                                x: -130,
                                y: 150,
                                style: {
                                    color: '#000000',
                                    fontWeight: 'bold',
                                    fontSize: '12px'
                                },
                                rotation: 0,
                                useHTML: true
                            }
                        }
                    ]
                },
                {
                    type: 'linear',
                    linkedTo: 0,
                    tickInterval: 12,
                    minRange: 12,
                    labels: {
                        align: 'center',
                        formatter: headerFormatter(data?.date_of_birth?.month_interval, 'Year')
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
                    max: 10,
                    reversed: true
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
                    data: treatmentIntervals,
                    tooltip: {
                        pointFormatter: treatmentFormatter(data?.date_of_birth?.month_interval)
                    }
                },
                {
                    type: 'scatter',
                    name: 'Treatment',
                    data: treatmentPoints,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 4
                    },
                    tooltip: {
                        pointFormatter: treatmentFormatter(data?.date_of_birth?.month_interval)
                    },
                    showInLegend: true
                },
                {
                    type: 'scatter',
                    name: 'Primary Diagnosis',
                    data: primaryDiagnosisSeries,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 4
                    },
                    tooltip: {
                        pointFormat: '{point.name}: Month {point.x}'
                    },
                    showInLegend: true
                },
                {
                    type: 'scatter',
                    name: 'Date of Birth',
                    data: dateOfBirthSeries,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 4
                    },
                    tooltip: {
                        pointFormat: '{point.name}: Month {point.x}'
                    },
                    showInLegend: true
                },
                {
                    type: 'scatter',
                    name: 'Date of Death',
                    data: dateOfDeathSeries,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 4
                    },
                    tooltip: {
                        pointFormat: '{point.name}: Month {point.x}'
                    },
                    showInLegend: true
                },
                {
                    type: 'scatter',
                    name: 'Date after Lost to Followup',
                    data: dateAliveAfterLostToFollowupSeries,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 4
                    },
                    tooltip: {
                        pointFormat: '{point.name}: Month {point.x}'
                    },
                    showInLegend: true
                },
                {
                    type: 'scatter',
                    name: 'Test Date',
                    data: testDateSeries,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 4
                    },
                    tooltip: {
                        pointFormat: '{point.name}: Month {point.x}'
                    },
                    showInLegend: true
                },
                {
                    type: 'scatter',
                    name: 'Date of Followup',
                    data: followupSeries1,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 4
                    },
                    tooltip: {
                        pointFormat: '{point.name}: Month {point.x}'
                    },
                    showInLegend: true
                },
                {
                    type: 'scatter',
                    name: 'Date of Relapse',
                    data: relapseSeries1,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 4
                    },
                    tooltip: {
                        pointFormat: '{point.name}: Month {point.x}'
                    },
                    showInLegend: true
                },
                {
                    type: 'scatter',
                    name: 'Date of Followup',
                    data: followupSeries2,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 4
                    },
                    tooltip: {
                        pointFormat: '{point.name}: Month {point.x}'
                    },
                    showInLegend: true
                },
                {
                    type: 'scatter',
                    name: 'Date of Relapse',
                    data: relapseSeries2,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 4
                    },
                    tooltip: {
                        pointFormat: '{point.name}: Month {point.x}'
                    },
                    showInLegend: true
                },
                {
                    type: 'scatter',
                    name: 'Date of Followup',
                    data: followupSeries3,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 4
                    },
                    tooltip: {
                        pointFormat: '{point.name}: Month {point.x}'
                    },
                    showInLegend: true
                },
                {
                    type: 'scatter',
                    name: 'Date of Relapse',
                    data: relapseSeries3,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 4
                    },
                    tooltip: {
                        pointFormat: '{point.name}: Month {point.x}'
                    },
                    showInLegend: true
                },
                {
                    type: 'scatter',
                    name: 'Specimen Collection Date',
                    data: specimenCollectionSeries,
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 4
                    },
                    tooltip: {
                        pointFormat: '{point.name}: Month {point.x}'
                    },
                    showInLegend: true
                }
            ]
        });
    }, [data]);

    if (!data?.date_of_birth) {
        return <Alert severity="warning">Unable to display the timeline due to missing Date of Birth information.</Alert>;
    }

    return <HighchartsReact highcharts={Highcharts} constructorType="ganttChart" options={chartOptions} />;
}

Timeline.propTypes = {
    patientId: PropTypes.string.isRequired,
    programId: PropTypes.string.isRequired
};

export default Timeline;
