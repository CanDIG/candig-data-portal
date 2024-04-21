import { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsGantt from 'highcharts/modules/gantt';
import HighchartsReact from 'highcharts-react-official';
import HighchartsExporting from 'highcharts/modules/exporting';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/system';

// Initialize the Gantt module
HighchartsGantt(Highcharts);
HighchartsExporting(Highcharts);

// Formatter for xAxis labels based on the date resolution (Month/Year)
const formatHeader = (dateResolution) =>
    function formatHeader() {
        const value = Math.floor(this.value);

        if (dateResolution === 'Month') {
            const monthsSinceStart = value % 12;
            return `${monthsSinceStart} Month(s) Old`;
        }
        if (dateResolution === 'Year') {
            const yearsSinceStart = Math.floor(value / 12);
            return `${yearsSinceStart} Year(s) Old`;
        }
        return `Age Unknown`;
    };

// Custom formatter for tooltips, displaying date, start/end and treatment type information
const tooltipFormatter = () =>
    function tooltipFormatter() {
        const boldName = `<span style="font-weight: bold">${this.name || 'Treatment'}</span><br/>`;
        const yearInAge = Math.floor(this.x / 12);

        const getYearInAgeText = (prefix, value) => `${prefix}: ${Math.floor(value / 12)} Year(s) Old`;

        const treatmentTypeText = this.treatment_type ? `Type: ${this.treatment_type}` : 'Treatment type not specified';

        let tooltipContent = '';

        if (this.extra_info) {
            const extraInfoText = `${this.extra_info} : ${yearInAge} Year(s) Old`;
            const missingInfoText = this.missing_info === 'Start' ? 'Start Date Missing' : 'End Date Missing';
            tooltipContent = `${boldName}${treatmentTypeText}<br/>${extraInfoText}<br/>${missingInfoText}<br/>`;
        } else if (this.start) {
            const startYearText = getYearInAgeText('Start', this.start);
            const endYearText = getYearInAgeText('End', this.end);

            if (this.name === 'Treatments') {
                tooltipContent = `${boldName}${startYearText}<br/>${endYearText}<br/>`;
            } else {
                tooltipContent = `${boldName}${treatmentTypeText}<br/>${startYearText}<br/>${endYearText}<br/>`;
            }
        } else {
            tooltipContent = `${boldName}${yearInAge} Year(s) Old`;
        }

        return tooltipContent;
    };

// Main component for displaying the patient timeline
function Timeline({ data, onEventClick }) {
    const [chartOptions, setChartOptions] = useState({});
    const birthMonthInterval = data?.date_of_birth?.month_interval ?? 0;
    const [isTreatmentsCollapsed, setIsTreatmentsCollapsed] = useState(false);
    const theme = useTheme();
    useEffect(() => {
        const generateSeriesData = (data, path, path2, date, id, yValue, colour, namePrefix, isSingleItem, name, birthDateValue) => {
            const birthDate = birthDateValue ?? 0;
            if (isSingleItem) {
                return data?.[path]?.month_interval
                    ? [
                          {
                              x: data[path].month_interval - birthDate,
                              y: yValue,
                              name: namePrefix,
                              color: colour
                          }
                      ]
                    : [];
            }

            if (path === 'primary_diagnoses' || name === 'Followup&Relapse2') {
                return Array.isArray(data?.[path])
                    ? data[path].map((item) => ({
                          // eslint-disable-next-line no-unsafe-optional-chaining
                          x: item?.[date]?.month_interval !== undefined ? item?.[date]?.month_interval - birthDate : '',
                          y: yValue,
                          name: `${namePrefix}${item?.[id]}`,
                          color: colour,
                          customGroupId: name
                      }))
                    : [];
            }

            if (path === 'biomarkers') {
                return Array.isArray(data?.[path])
                    ? data[path].map((item) => {
                          const id =
                              item?.submitter_treatment_id ||
                              item?.submitter_primary_diagnosis_id ||
                              item?.submitter_follow_up_id ||
                              item?.submitter_specimen_id;
                          return {
                              // eslint-disable-next-line no-unsafe-optional-chaining
                              x: item?.[date]?.month_interval !== undefined ? item?.[date]?.month_interval - birthDate : '',
                              y: yValue,
                              name: `${namePrefix}${typeof id !== 'undefined' ? id : 'No Linked Event'}`,
                              color: colour
                          };
                      })
                    : [];
            }

            if (name === 'Followup&Relapse1' || path === 'specimens') {
                return (
                    data?.flatMap((item) =>
                        Array.isArray(item?.[path])
                            ? item[path].map((subItem) => ({
                                  // eslint-disable-next-line no-unsafe-optional-chaining
                                  x: subItem?.[date]?.month_interval !== undefined ? subItem?.[date]?.month_interval - birthDate : '',
                                  y: yValue,
                                  name: `${namePrefix}${subItem?.[id]}`,
                                  color: colour,
                                  customGroupId: name
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
                                        x:
                                            subItem2?.[date]?.month_interval !== undefined
                                                ? // eslint-disable-next-line no-unsafe-optional-chaining
                                                  subItem2?.[date]?.month_interval - birthDate
                                                : '',
                                        y: yValue,
                                        name: `${namePrefix}${subItem2?.[id]}`,
                                        color: colour,
                                        customGroupId: name
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
            theme.palette.primary.light,
            'Date of Birth',
            true,
            null,
            data?.date_of_birth?.month_interval
        );
        const dateOfDeathSeries = generateSeriesData(
            data,
            'date_of_death',
            null,
            null,
            null,
            0,
            theme.palette.primary.main,
            'Date of Death',
            true,
            null,
            data?.date_of_birth?.month_interval
        );
        const dateAliveAfterLostToFollowupSeries = generateSeriesData(
            data,
            'date_alive_after_lost_to_followup',
            null,
            null,
            null,
            0,
            theme.palette.primary.dark,
            'Date Alive After Lost to Followup',
            true,
            null,
            data?.date_of_birth?.month_interval
        );
        const testDateSeries = generateSeriesData(
            data,
            'biomarkers',
            null,
            'test_date',
            '',
            2,
            theme.palette.secondary.dark,
            'Biomarker ',
            false,
            null
        );
        const specimenCollectionSeries = generateSeriesData(
            data?.primary_diagnoses,
            'specimens',
            null,
            'specimen_collection_date',
            'submitter_specimen_id',
            3,
            theme.palette.secondary.light,
            '',
            false,
            null,
            data?.date_of_birth?.month_interval
        );
        const primaryDiagnosisSeries = generateSeriesData(
            data,
            'primary_diagnoses',
            null,
            'date_of_diagnosis',
            'submitter_primary_diagnosis_id',
            1,
            theme.palette.secondary.main,
            '',
            false,
            null,
            data?.date_of_birth?.month_interval
        );
        const followupSeries1 = generateSeriesData(
            data?.primary_diagnoses,
            'followups',
            null,
            'date_of_followup',
            'submitter_follow_up_id',
            4,
            theme.palette.secondary.dark,
            'Followup ',
            false,
            'Followup&Relapse1',
            data?.date_of_birth?.month_interval
        );
        const relapseSeries1 = generateSeriesData(
            data?.primary_diagnoses,
            'followups',
            null,
            'date_of_relapse',
            'submitter_follow_up_id',
            4,
            theme.palette.secondary.main,
            'Relapse ',
            false,
            'Followup&Relapse1',
            data?.date_of_birth?.month_interval
        );
        const followupSeries2 = generateSeriesData(
            data,
            'followups',
            null,
            'date_of_followup',
            'submitter_follow_up_id',
            4,
            theme.palette.secondary.dark,
            'Followup ',
            false,
            'Followup&Relapse2',
            data?.date_of_birth?.month_interval
        );
        const relapseSeries2 = generateSeriesData(
            data,
            'followups',
            null,
            'date_of_relapse',
            'submitter_follow_up_id',
            4,
            theme.palette.secondary.main,
            'Relapse ',
            false,
            'Followup&Relapse2',
            data?.date_of_birth?.month_interval
        );
        const followupSeries3 = generateSeriesData(
            data?.primary_diagnoses,
            'treatments',
            'followups',
            'date_of_followup',
            'submitter_follow_up_id',
            4,
            theme.palette.secondary.dark,
            'Followup ',
            false,
            'Followup&Relapse3',
            data?.date_of_birth?.month_interval
        );
        const relapseSeries3 = generateSeriesData(
            data?.primary_diagnoses,
            'treatments',
            'followups',
            'date_of_relapse',
            'submitter_follow_up_id',
            4,
            theme.palette.secondary.main,
            'Relapse ',
            false,
            'Followup&Relapse3',
            data?.date_of_birth?.month_interval
        );

        const seriesData = {
            primaryDiagnosisSeries,
            dateOfBirthSeries,
            dateOfDeathSeries,
            dateAliveAfterLostToFollowupSeries,
            testDateSeries,
            followupSeries1,
            relapseSeries1,
            followupSeries2,
            relapseSeries2,
            followupSeries3,
            relapseSeries3,
            specimenCollectionSeries
        };

        const initialCategories = ['Major Life Events', 'Primary Diagnosis', 'Test Date', 'Specimen Collection Date', 'Followup & Relapse'];

        const categorySeriesMap = {
            'Major Life Events': ['dateOfBirthSeries', 'dateOfDeathSeries', 'dateAliveAfterLostToFollowupSeries'],
            'Primary Diagnosis': ['primaryDiagnosisSeries'],
            'Test Date': ['testDateSeries'],
            'Specimen Collection Date': ['specimenCollectionSeries'],
            'Followup & Relapse': [
                'followupSeries1',
                'relapseSeries1',
                'followupSeries2',
                'relapseSeries2',
                'followupSeries3',
                'relapseSeries3'
            ]
        };

        const activeCategories = initialCategories.filter((category) =>
            categorySeriesMap[category].some((seriesKey) => seriesData[seriesKey].length > 0)
        );

        const adjustedSeries = Object.entries(seriesData).flatMap(([key, series]) => {
            const category = Object.keys(categorySeriesMap).find((category) => categorySeriesMap[category].includes(key));
            const newY = activeCategories.indexOf(category);
            return series.map((dataPoint) => ({ ...dataPoint, y: newY }));
        });

        const tooltip = {
            pointFormatter: tooltipFormatter()
        };

        activeCategories.push('Treatments');

        const yIndexParent = activeCategories.length - 1;
        let yIndex = activeCategories.length - 1;
        const treatmentIntervals = [];
        const treatmentPoints = [];
        data.primary_diagnoses?.forEach((diagnosis) =>
            diagnosis.treatments?.forEach((treatment) => {
                const treatmentStart = treatment.treatment_start_date?.month_interval;
                const treatmentEnd = treatment.treatment_end_date?.month_interval;

                if (treatmentStart !== null && treatmentStart !== undefined && treatmentEnd !== null && treatmentEnd !== undefined) {
                    treatmentIntervals.push({
                        name: treatment.submitter_treatment_id,
                        start: treatmentStart - birthMonthInterval,
                        end: treatmentEnd - birthMonthInterval,
                        treatment_type: treatment?.treatment_type,
                        y: (yIndex += 1),
                        color: theme.palette.primary.main,
                        customGroupId: 'treatments'
                    });
                } else if (
                    (treatmentStart !== null && treatmentStart !== undefined) ||
                    (treatmentEnd !== null && treatmentEnd !== undefined)
                ) {
                    treatmentPoints.push({
                        x: treatmentStart - birthMonthInterval,
                        name: treatment.submitter_treatment_id,
                        y: (yIndex += 1),
                        color: theme.palette.primary.light,
                        treatment_type: treatment?.treatment_type,
                        extra_info: treatmentStart !== null ? 'Start' : 'End',
                        missing_info: treatmentStart !== null ? 'End' : 'Start',
                        customGroupId: 'treatments'
                    });
                }
            })
        );

        const startTimes = treatmentIntervals.map((interval) => interval.start);
        const endTimes = treatmentIntervals.map((interval) => interval.end);
        const xValues = treatmentPoints.map((point) => point.x);
        const allValues = [...startTimes, ...endTimes, ...xValues];
        const maxTime = allValues ? Math.max(...allValues) : 'undefined';
        const minTime = allValues ? Math.min(...allValues) : 'undefined';

        const treatmentParentSeries = {
            type: 'gantt',
            data: [
                {
                    start: minTime,
                    end: maxTime,
                    y: yIndexParent,
                    color: theme.palette.primary.dark,
                    name: 'Treatments'
                }
            ],
            marker: {
                enabled: true,
                symbol: 'circle',
                radius: 4
            },
            tooltip,
            name: 'Treatments'
        };

        adjustedSeries.push(...treatmentIntervals, ...treatmentPoints);

        const Updatedseries = adjustedSeries.map((s) => ({
            type: typeof s?.start !== 'undefined' ? 'gantt' : 'scatter',
            data: [s],
            name: s.name,
            marker: {
                enabled: true,
                symbol: 'circle',
                radius: 4
            },
            tooltip,
            visible: s?.customGroupId === 'treatments' ? !isTreatmentsCollapsed : true
        }));

        Updatedseries.push(treatmentParentSeries);

        const newCategories = activeCategories.concat(
            treatmentIntervals.map((t) => t.name),
            treatmentPoints.map((t) => t.name)
        );

        const toggleTreatmentsCollapse = () => {
            setIsTreatmentsCollapsed((current) => {
                const newVisibility = !current;
                Highcharts.charts.forEach((chart) => {
                    if (chart) {
                        chart.series.forEach((series) => {
                            if (series.userOptions.customGroupId === 'treatments') {
                                series.setVisible(newVisibility);
                            }
                        });
                        chart.redraw();
                    }
                });
                return newVisibility;
            });
        };

        // Handles setup of the Highcharts chart with the patient data
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
                categories: newCategories
            },
            xAxis: [
                {
                    type: 'linear',
                    tickInterval: 1,
                    minRange: 12,
                    labels: {
                        align: 'center',
                        formatter: formatHeader('Month'),
                        style: {
                            fontSize: '8px'
                        }
                    },
                    plotLines: [
                        {
                            color: '#000000',
                            value: -birthMonthInterval,
                            width: 2,
                            zIndex: 5,
                            label: {
                                text: 'First Day of Diagnosis',
                                align: 'left',
                                verticalAlign: 'top',
                                x: -150,
                                y: 150,
                                style: {
                                    textOutline: '1px contrast',
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
                        formatter: formatHeader('Year')
                    },
                    opposite: true
                }
            ],
            navigator: {
                enabled: true,
                xAxis: {
                    labels: {
                        enabled: false
                    }
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
                            textOutline: '1px contrast',
                            color: '#333333',
                            fontFamily: 'Arial, sans-serif'
                        }
                    },
                    cursor: 'pointer',
                    events: {
                        click(event) {
                            const seriesName = event.point.series.name;
                            const seriesID = event.point.series.userOptions.data[0].customGroupId;
                            let category = null;
                            let array = null;

                            if (seriesName.includes('Biomarker')) {
                                category = 'biomarkers';
                                array = data?.biomarkers;
                            } else if (seriesName.includes('SPECIMEN')) {
                                category = 'specimens';
                                array = data?.primary_diagnoses;
                            } else if (seriesName.includes('PRIMARY_DIAGNOSIS')) {
                                category = 'primary_diagnoses';
                                array = data?.primary_diagnoses;
                            } else if (seriesID === 'treatments' || seriesName === 'Treatments') {
                                category = 'treatments';
                                const aggregateTreatments = () => {
                                    let allTreatments = [];
                                    data?.primary_diagnoses?.forEach((diagnosis) => {
                                        if (Array.isArray(diagnosis.treatments)) {
                                            allTreatments = allTreatments.concat(diagnosis.treatments);
                                        }
                                    });

                                    return allTreatments;
                                };
                                array = aggregateTreatments(data);
                            } else if (seriesID === 'Followup&Relapse1') {
                                category = 'followups';
                                array = data?.primary_diagnoses;
                            } else if (seriesID === 'Followup&Relapse2') {
                                category = 'followups';
                                const aggregateFollowups = () => {
                                    let allFollowups = [];
                                    data?.primary_diagnoses?.forEach((diagnosis) => {
                                        if (Array.isArray(diagnosis.followups)) {
                                            allFollowups = allFollowups.concat(diagnosis.followups);
                                        }
                                    });

                                    return allFollowups;
                                };
                                array = aggregateFollowups(data);
                            } else if (seriesID === 'Followup&Relapse3') {
                                category = 'followups';
                                const aggregateFollowups = () => {
                                    let allFollowups = [];
                                    data?.primary_diagnoses?.forEach((diagnosis) => {
                                        diagnosis.treatments?.forEach((treatment) => {
                                            if (Array.isArray(treatment.followups)) {
                                                allFollowups = allFollowups.concat(treatment.followups);
                                            }
                                        });
                                    });

                                    return allFollowups;
                                };
                                array = aggregateFollowups(data);
                            }

                            if (category && onEventClick) {
                                onEventClick(category, array);
                            }
                        }
                    }
                }
            },
            series: Updatedseries
        });

        setChartOptions((prevOptions) => ({
            ...prevOptions,
            chart: {
                ...prevOptions.chart,
                events: {
                    render() {
                        const chart = this;

                        if (chart.customButton) {
                            chart.customButton.destroy();
                        }

                        const treatmentCategoryIndex = chart.yAxis[0].categories.indexOf('Treatments');
                        const yPosition = chart.yAxis[0].toPixels(treatmentCategoryIndex) - 5;
                        chart.customButton = chart.renderer
                            .symbol('triangle', chart.plotLeft - 15, yPosition, 10, 10)
                            .attr({
                                fill: '#7cb5ec',
                                cursor: 'pointer',
                                zIndex: 5
                            })
                            .add()
                            .on('click', () => {
                                toggleTreatmentsCollapse();
                            });

                        const rotationDeg = isTreatmentsCollapsed ? 180 : 0;
                        chart.customButton.attr({
                            transform: `rotate(${rotationDeg} ${chart.customButton.x + 5} ${chart.customButton.y + 5})`
                        });
                    }
                }
            }
        }));
    }, [data, isTreatmentsCollapsed, birthMonthInterval, onEventClick]);

    if (!data?.date_of_birth) {
        // Display warning if necessary patient data is missing
        return <Alert severity="warning">Unable to display the timeline due to missing Date of Birth information.</Alert>;
    }

    // Render the HighchartsReact component with the configured chart options
    return <HighchartsReact highcharts={Highcharts} constructorType="ganttChart" options={chartOptions} />;
}

// PropTypes for component validation
Timeline.propTypes = {
    data: PropTypes.object.isRequired,
    onEventClick: PropTypes.func
};

export default Timeline;
