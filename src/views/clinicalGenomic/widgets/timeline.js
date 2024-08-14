import { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsGantt from 'highcharts/modules/gantt';
import HighchartsReact from 'highcharts-react-official';
import HighchartsExporting from 'highcharts/modules/exporting';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/system';

// Initialize the Gantt module
HighchartsGantt(Highcharts);
HighchartsExporting(Highcharts);

// Formatter for xAxis labels based on the date resolution (Month/Year)
const formatHeader = (dateResolution) =>
    function formatHeader() {
        const value = Math.floor(this.value);

        if (dateResolution === 'Month') {
            const monthsSinceStart = (value % 12) + 1;
            return `${monthsSinceStart}M`;
        }
        if (dateResolution === 'Year') {
            const yearsSinceStart = Math.floor(value / 12);
            return `${yearsSinceStart}Y`;
        }
        return `Age Unknown`;
    };

// Custom formatter for tooltips, displaying date, start/end and treatment type information
const tooltipFormatter = () =>
    function tooltipFormatter() {
        const boldName = `<span style="font-weight: bold">${this.name || 'Treatment'}</span><br/>`;

        const getDateText = (value) =>
            `${Math.floor(value / 12)}y ${Math.floor(value % 12)}m ${value % 1 !== 0 ? ` ${(value % 1) * 32}d` : ''}`;

        const treatmentTypeText = this.treatment_type ? `Type: ${this.treatment_type}` : 'Treatment type not specified';

        let tooltipContent = '';

        if (this.extra_info) {
            const extraInfoText = `${this.extra_info} : ${getDateText(this.x)}`;
            const missingInfoText = this.missing_info === 'Start' ? 'Start Date Missing' : 'End Date Missing';
            tooltipContent = `${boldName}${treatmentTypeText}<br/>${extraInfoText}<br/>${missingInfoText}<br/>`;
        } else if (this.start) {
            const startYearText = `Start: ${getDateText(this.start)}`;
            const endYearText = `End: ${getDateText(this.end)}`;

            if (this.name === 'Treatments') {
                tooltipContent = `${boldName}${startYearText}<br/>${endYearText}<br/>`;
            } else {
                tooltipContent = `${boldName}${treatmentTypeText}<br/>${startYearText}<br/>${endYearText}<br/>`;
            }
        } else {
            tooltipContent = `${boldName}${getDateText(this.x)}`;
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
        let dob = data?.date_of_birth?.month_interval ?? 0;
        dob += data?.date_of_birth?.day_interval ? (data.date_of_birth.day_interval % 32) / 32 : 0;

        const formatDate = (date) => {
            if (date?.month_interval !== undefined) {
                if (date?.day_interval) {
                    return date.month_interval + (date.day_interval % 32) / 32 - dob;
                }
                return date.month_interval - dob;
            }
            return '';
        };

        const generateSeriesDataSingle = (data, name, y, colour) =>
            data?.month_interval
                ? [
                      {
                          x: formatDate(data),
                          y,
                          name,
                          color: colour,
                          customGroupId: name
                      }
                  ]
                : [];

        const generateSeriesDataPrimaryDiagnosis = (data, namePrefix, y, colour, date, name, id) =>
            Array.isArray(data)
                ? data.map((item) => ({
                      x: formatDate(item?.[date]),
                      y,
                      name: `${namePrefix}${item?.[id]}`,
                      color: colour,
                      customGroupId: name
                  }))
                : [];

        const generateSeriesDataBiomarker = (data, namePrefix, y, colour, date, name, fullData) =>
            Array.isArray(data)
                ? data
                      .map((item) => {
                          // Determine the biomarker linked ID
                          const id =
                              item?.submitter_treatment_id ||
                              item?.submitter_primary_diagnosis_id ||
                              item?.submitter_follow_up_id ||
                              item?.submitter_specimen_id;

                          const biomarkerDate = item?.[date];

                          // Determine the linked object date if biomarkerDate is not available
                          let linkedObjectDate;
                          if (biomarkerDate === null) {
                              linkedObjectDate = fullData.primary_diagnoses.find(
                                  (diagnosis) => diagnosis.submitter_primary_diagnosis_id === item.submitter_primary_diagnosis_id
                              )?.date_of_diagnosis;
                          }

                          // Determine the biomarker name
                          let dateLabel = '';

                          if (!id) {
                              if (biomarkerDate || linkedObjectDate) {
                                  const dateObject = biomarkerDate || linkedObjectDate;
                                  if (dateObject.day_interval) {
                                      const ageInDays = dateObject.day_interval;
                                      const years = Math.floor(ageInDays / 365);
                                      const remainingDays = ageInDays % 365;
                                      const months = Math.floor(remainingDays / 30);
                                      const days = remainingDays % 30;

                                      dateLabel = `${years}y ${months}m ${days}d`;
                                  } else if (dateObject.month_interval) {
                                      const ageInMonths = dateObject.month_interval;
                                      const years = Math.floor(ageInMonths / 12);
                                      const remainingMonths = ageInMonths % 12;
                                      dateLabel = `${years}y ${remainingMonths}m`;
                                  }
                              }
                          }

                          const biomarkerName = `${namePrefix}${id || ''} Biomarker ${id ? '' : `${dateLabel} since diagnosis`}`;
                          // Return the series data pointy
                          return biomarkerDate
                              ? {
                                    x: formatDate(biomarkerDate),
                                    y,
                                    name: biomarkerName,
                                    color: colour,
                                    customGroupId: name
                                }
                              : null;
                      })
                      .filter((item) => item !== null)
                : [];

        const generateSeriesDataSpecimen = (data, path, namePrefix, y, colour, date, name, id) =>
            data?.flatMap((item) =>
                Array.isArray(item?.[path])
                    ? item[path].map((subItem) => ({
                          x: formatDate(subItem?.[date]),
                          y,
                          name: `${namePrefix}${subItem?.[id]}`,
                          color: colour,
                          customGroupId: name
                      }))
                    : []
            ) || [];

        // eslint-disable-next-line no-unused-vars
        const generateSeriesData = (data, path, path2, date, id, y, colour, namePrefix, name) =>
            data?.flatMap((item) =>
                Array.isArray(item?.[path])
                    ? item[path].flatMap((subItem) =>
                          Array.isArray(subItem?.[path2])
                              ? subItem[path2].map((subItem2) => ({
                                    x: formatDate(subItem2?.[date]),
                                    y,
                                    name: `${namePrefix}${subItem2?.[id]}`,
                                    color: colour,
                                    customGroupId: name
                                }))
                              : []
                      )
                    : []
            ) || [];

        const dateOfBirthSeries = generateSeriesDataSingle(data?.date_of_birth, 'Date of Birth', 0, theme.palette.primary.light, dob);
        const dateOfDeathSeries = generateSeriesDataSingle(data?.date_of_death, 'Age at Death', 0, theme.palette.primary.main, dob);
        const dateAliveAfterLostToFollowupSeries = generateSeriesDataSingle(
            data?.date_alive_after_lost_to_followup,
            'Date Alive After Lost To Followup',
            0,
            theme.palette.primary.light,
            dob
        );
        const primaryDiagnosisSeries = generateSeriesDataPrimaryDiagnosis(
            data?.primary_diagnoses,
            '',
            1,
            theme.palette.secondary.main,
            'date_of_diagnosis',
            'primary_diagnoses',
            'submitter_primary_diagnosis_id'
        );
        const followupSeries2 = generateSeriesDataPrimaryDiagnosis(
            data?.followups,
            'Followup ',
            4,
            theme.palette.secondary.dark,
            'date_of_followup',
            'Followup&Relapse2',
            'submitter_follow_up_id'
        );
        const relapseSeries2 = generateSeriesDataPrimaryDiagnosis(
            data?.followups,
            'Relapse ',
            4,
            theme.palette.secondary.main,
            'date_of_relapse',
            'Followup&Relapse2',
            'submitter_follow_up_id'
        );
        const biomarkerSeries = generateSeriesDataBiomarker(
            data?.biomarkers,
            '',
            2,
            theme.palette.secondary.dark,
            'test_date',
            'biomarkers',
            data
        );
        const followupSeries1 = generateSeriesDataSpecimen(
            data?.primary_diagnoses,
            'followups',
            'Followup ',
            4,
            theme.palette.secondary.dark,
            'date_of_followup',
            'Followup&Relapse1',
            'submitter_follow_up_id'
        );
        const relapseSeries1 = generateSeriesDataSpecimen(
            data?.primary_diagnoses,
            'followups',
            'Relapse ',
            4,
            theme.palette.secondary.main,
            'date_of_relapse',
            'Followup&Relapse1',
            'submitter_follow_up_id'
        );
        const specimenCollectionSeries = generateSeriesDataSpecimen(
            data?.primary_diagnoses,
            'specimens',
            '',
            3,
            theme.palette.secondary.light,
            'specimen_collection_date',
            'specimens',
            'submitter_specimen_id'
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
            'Followup&Relapse3'
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
            'Followup&Relapse3'
        );

        const seriesData = {
            primaryDiagnosisSeries,
            dateOfBirthSeries,
            dateOfDeathSeries,
            dateAliveAfterLostToFollowupSeries,
            biomarkerSeries,
            followupSeries1,
            relapseSeries1,
            followupSeries2,
            relapseSeries2,
            followupSeries3,
            relapseSeries3,
            specimenCollectionSeries
        };

        const initialCategories = [
            'Major Life Events',
            'Primary Diagnosis',
            'Biomarkers',
            'Specimen Collection Date',
            'Followup & Relapse'
        ];

        const categorySeriesMap = {
            'Major Life Events': ['dateOfBirthSeries', 'dateOfDeathSeries', 'dateAliveAfterLostToFollowupSeries'],
            'Primary Diagnosis': ['primaryDiagnosisSeries'],
            Biomarkers: ['biomarkerSeries'],
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
                    name: 'Treatments',
                    customGroupId: 'treatments'
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
                marginRight: 50,
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
                                cursor: 'pointer'
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
                                x: 10,
                                y: 20,
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
                            const seriesID = event.point.series.userOptions.data[0].customGroupId;

                            if (seriesID === 'biomarkers') {
                                onEventClick?.(['biomarkers', 0], data?.biomarkers);
                            } else if (seriesID === 'specimens') {
                                onEventClick?.(['specimens', 1], data?.primary_diagnoses?.map((diagnosis) => diagnosis.specimens)?.flat(1));
                            } else if (seriesID === 'primary_diagnoses') {
                                onEventClick?.(['primary_diagnoses', 0], data?.primary_diagnoses);
                            } else if (seriesID === 'treatments') {
                                const aggregateTreatments = () => {
                                    let allTreatments = [];
                                    data?.primary_diagnoses?.forEach((diagnosis) => {
                                        if (Array.isArray(diagnosis.treatments)) {
                                            allTreatments = allTreatments.concat(diagnosis.treatments);
                                        }
                                    });

                                    return allTreatments;
                                };
                                onEventClick?.(['treatments', 1], aggregateTreatments(data));
                            } else if (seriesID === 'Followup&Relapse1') {
                                const aggregateFollowups = (diagnoses) =>
                                    diagnoses
                                        ?.map((diagnosis) => diagnosis?.followups)
                                        ?.filter((obj) => !!obj)
                                        ?.flat(1);
                                onEventClick?.(['followups', 1], aggregateFollowups(data?.primary_diagnoses));
                            } else if (seriesID === 'Followup&Relapse2') {
                                onEventClick?.(['followups', 0], data?.followups);
                            } else if (seriesID === 'Followup&Relapse3') {
                                const aggregateFollowups = (diagnoses) =>
                                    diagnoses
                                        ?.map((diagnosis) => diagnosis?.followups)
                                        ?.flat(1)
                                        ?.filter((obj) => !!obj);
                                onEventClick?.(['followups', 1], aggregateFollowups(data?.primary_diagnoses));
                            }
                        }
                    }
                }
            },
            series: Updatedseries,
            exporting: {
                enabled: false
            }
        });
    }, [
        data,
        isTreatmentsCollapsed,
        birthMonthInterval,
        onEventClick,
        theme.palette.primary.dark,
        theme.palette.primary.light,
        theme.palette.primary.main,
        theme.palette.secondary.dark,
        theme.palette.secondary.light,
        theme.palette.secondary.main
    ]);

    // Render the HighchartsReact component with the configured chart options
    return <HighchartsReact highcharts={Highcharts} constructorType="ganttChart" options={chartOptions} />;
}

// PropTypes for component validation
Timeline.propTypes = {
    data: PropTypes.object.isRequired,
    onEventClick: PropTypes.func
};

export default Timeline;
