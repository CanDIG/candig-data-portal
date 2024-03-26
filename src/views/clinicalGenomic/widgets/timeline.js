import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsGantt from 'highcharts/modules/gantt';
import HighchartsReact from 'highcharts-react-official';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import useClinicalPatientData from '../useClinicalPatientData';

// Initialize the Gantt module
HighchartsGantt(Highcharts);
HighchartsExporting(Highcharts);
HighchartsAccessibility(Highcharts);

const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i += 1) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

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

function Timeline({ patientId, programId }) {
    const { data } = useClinicalPatientData(patientId, programId);
    const [chartOptions, setChartOptions] = useState({});
    useEffect(() => {
        const primaryDiagnosisSeries =
            data.primary_diagnoses?.map((diagnosis) => ({
                x: diagnosis.date_of_diagnosis?.month_interval,
                y: 1,
                name: `${diagnosis.submitter_primary_diagnosis_id}`
            })) || [];

        const treatmentSeriesData =
            data.primary_diagnoses?.flatMap(
                (diagnosis) =>
                    diagnosis.treatments?.map((treatment) => ({
                        start: treatment.treatment_start_date?.month_interval,
                        end: treatment.treatment_end_date?.month_interval,
                        name: `${treatment.submitter_treatment_id}`,
                        y: 2,
                        color: generateRandomColor(),
                        dataLabels: {
                            enabled: false
                        }
                    })) || []
            ) || [];

        const dateOfBirthSeries = data?.date_of_birth?.month_interval
            ? [
                  {
                      x: data.date_of_birth.month_interval,
                      y: 0,
                      name: 'Date of Birth',
                      dataLabels: {
                          enabled: true,
                          format: 'Date of Birth'
                      }
                  }
              ]
            : [];

        const dateOfDeathSeries = data?.date_of_death?.month_interval
            ? [
                  {
                      x: data.date_of_death.month_interval,
                      y: 0,
                      name: 'Date of Death',
                      dataLabels: {
                          enabled: true,
                          format: 'Date of Death'
                      }
                  }
              ]
            : [];

        const dateAliveAfterLostToFollowup = data?.date_alive_after_lost_to_followup?.month_interval
            ? [
                  {
                      x: data.date_alive_after_lost_to_followup?.month_interval,
                      y: 0,
                      name: 'Date Alive After Lost to Followup',
                      dataLabels: {
                          enabled: true,
                          format: 'Date Alive After Lost to Followup'
                      }
                  }
              ]
            : [];

        const testDateSeries =
            data.biomarkers?.map((biomarker) => ({
                x: biomarker.test_date?.month_interval,
                y: 3,
                name: `${biomarker.submitter_primary_diagnosis_id} Test Date`
            })) || [];

        const specimenCollectionSeries =
            data.primary_diagnoses?.flatMap(
                (diagnosis) =>
                    diagnosis.specimens?.map((specimen) => ({
                        x: specimen.specimen_collection_date?.month_interval,
                        y: 4,
                        name: `${specimen.submitter_specimen_id}`
                    })) || []
            ) || [];

        const followupSeries1 =
            data.primary_diagnoses?.flatMap(
                (diagnosis) =>
                    diagnosis.followups?.map((followup) => ({
                        x: followup.date_of_followup?.month_interval,
                        name: `Followup ${followup.submitter_follow_up_id}`,
                        y: 5
                    })) || []
            ) || [];

        const relapseSeries1 =
            data.primary_diagnoses?.flatMap(
                (diagnosis) =>
                    diagnosis.followups?.map((followup) => ({
                        x: followup.date_of_relapse?.month_interval,
                        name: `Relapse ${followup.submitter_follow_up_id}`,
                        y: 5
                    })) || []
            ) || [];

        const followupSeries2 =
            data.followups?.map((followup) => ({
                x: followup.date_of_followup?.month_interval,
                name: `Followup ${followup.submitter_follow_up_id}`,
                y: 5
            })) || [];

        const relapseSeries2 =
            data.followups?.map((followup) => ({
                x: followup.date_of_relapse?.month_interval,
                name: `Relapse ${followup.submitter_follow_up_id}`,
                y: 5
            })) || [];

        const followupSeries3 =
            data.primary_diagnoses?.flatMap(
                (diagnosis) =>
                    diagnosis.treatments?.flatMap(
                        (treatment) =>
                            treatment.followups?.map((followup) => ({
                                x: followup.date_of_followup?.month_interval,
                                name: `Followup ${followup.submitter_follow_up_id}`,
                                y: 5
                            })) || []
                    ) || []
            ) || [];

        const relapseSeries3 =
            data.primary_diagnoses?.flatMap(
                (diagnosis) =>
                    diagnosis.treatments?.flatMap(
                        (treatment) =>
                            treatment.followups?.map((followup) => ({
                                x: followup.date_of_relapse?.month_interval,
                                name: `Relapse ${followup.submitter_follow_up_id}`,
                                y: 5
                            })) || []
                    ) || []
            ) || [];

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
                minRange: 1,
                type: 'category',
                categories: ['Major Life Events', 'Primary Diagnoses', 'Treatments', 'Biomarkers', 'Specimens', 'Followups & Relapses']
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
                    tickInterval: 12,
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
                    data: treatmentSeriesData,
                    tooltip: {
                        pointFormat: '{point.name} Start: Month {point.start} End: Month {point.end}'
                    }
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
                    data: dateAliveAfterLostToFollowup,
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

    return <HighchartsReact highcharts={Highcharts} constructorType="ganttChart" options={chartOptions} />;
}

export default Timeline;
