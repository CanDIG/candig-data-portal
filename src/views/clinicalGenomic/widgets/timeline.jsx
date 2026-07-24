import { useCallback, useEffect, useMemo, useState } from 'react';
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
                tooltipContent = `${boldName}${startYearText}<br/>${endYearText}`;
            } else {
                tooltipContent = `${boldName}${treatmentTypeText}<br/>${startYearText}<br/>${endYearText}`;
            }
        } else {
            tooltipContent = `${boldName}${getDateText(this.x)}`;
        }

        if (this.disease_status_at_followup) {
            tooltipContent += `<br/>Disease status: ${this.disease_status_at_followup}`;
        }

        // Surgery / radiation detail for treatments whose type calls for it.
        if (Array.isArray(this.surgeries)) {
            this.surgeries.forEach((surgery) => {
                if (surgery.type && surgery.site) {
                    tooltipContent += `<br/>Surgery: ${surgery.type} (${surgery.site})`;
                } else if (surgery.type) {
                    tooltipContent += `<br/>Surgery: ${surgery.type}`;
                } else if (surgery.site) {
                    tooltipContent += `<br/>Surgery site: ${surgery.site}`;
                }
            });
        }
        if (Array.isArray(this.radiations)) {
            this.radiations.forEach((modality) => {
                tooltipContent += `<br/>Radiation modality: ${modality}`;
            });
        }

        return tooltipContent;
    };

// Main component for displaying the patient timeline
function Timeline({ data, onEventClick }) {
    const [chartOptions, setChartOptions] = useState({});
    const birthMonthInterval = data?.date_of_birth?.month_interval ?? 0;
    const [isTreatmentsCollapsed, setIsTreatmentsCollapsed] = useState(false);
    // Set of submitter_treatment_ids whose dated sub-treatments are expanded.
    const [expandedTreatments, setExpandedTreatments] = useState(() => new Set());
    const theme = useTheme();

    // Toggle whether a single treatment's dated sub-treatments (systemic therapies)
    // are shown as indented rows beneath it.
    const toggleTreatmentExpand = useCallback((treatmentId) => {
        setExpandedTreatments((prev) => {
            const next = new Set(prev);
            if (next.has(treatmentId)) {
                next.delete(treatmentId);
            } else {
                next.add(treatmentId);
            }
            return next;
        });
    }, []);

    // The first treatment that has an expand toggle — i.e. it is placed on the
    // timeline (has a treatment date) AND carries dated systemic therapies. The
    // guided tour expands this one to demonstrate the per-drug rows. Mirrors the
    // conditions used when building the sub-treatment rows in the effect below.
    const firstExpandableTreatmentId = useMemo(() => {
        let found = null;
        (data?.primary_diagnoses || []).forEach((diagnosis) =>
            (diagnosis.treatments || []).forEach((treatment) => {
                if (found) return;
                const hasTreatmentDate =
                    treatment.treatment_start_date?.month_interval != null || treatment.treatment_end_date?.month_interval != null;
                if (!hasTreatmentDate) return;
                const hasDatedTherapy = (treatment.systemic_therapies || []).some(
                    (therapy) => therapy?.start_date?.month_interval != null || therapy?.end_date?.month_interval != null
                );
                if (hasDatedTherapy) found = treatment.submitter_treatment_id;
            })
        );
        return found;
    }, [data]);

    const demoTreatmentExpanded = firstExpandableTreatmentId ? expandedTreatments.has(firstExpandableTreatmentId) : false;

    // Driven by the guided tour (via a hidden control) to show a systemic-therapy
    // treatment expanding into its drug rows. Also ensures the Treatments group is
    // open so the expanded rows are visible.
    const toggleDemoTreatmentExpand = useCallback(() => {
        if (!firstExpandableTreatmentId) return;
        setIsTreatmentsCollapsed(false);
        toggleTreatmentExpand(firstExpandableTreatmentId);
    }, [firstExpandableTreatmentId, toggleTreatmentExpand]);
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
                          customGroupId: name,
                          showInNavigator: true
                      }
                  ]
                : [];

        const generateSeriesDataPrimaryDiagnosis = (data, namePrefix, y, colour, date, name, id) =>
            Array.isArray(data)
                ? data?.map((item) => ({
                      x: formatDate(item?.[date]),
                      y,
                      name: `${namePrefix}${item?.[id]}`,
                      color: colour,
                      customGroupId: name,
                      showInNavigator: true,
                      disease_status_at_followup: item?.disease_status_at_followup
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
                                    customGroupId: name,
                                    showInNavigator: true
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
                          customGroupId: name,
                          showInNavigator: true,
                          disease_status_at_followup: subItem?.disease_status_at_followup
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
                                    customGroupId: name,
                                    showInNavigator: true,
                                    disease_status_at_followup: subItem2?.disease_status_at_followup
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
        // Category names in row order (parent treatments interleaved with their
        // expanded sub-treatments), used to build the yAxis categories.
        const orderedTreatmentNames = [];
        // Display label and indent depth per treatment row, parallel to
        // orderedTreatmentNames. Depth drives the y-axis label indentation so each
        // treatment sits under the "Treatments" bar and each drug sits under its
        // treatment. The display label can differ from the point name (used in
        // tooltips), so an indented drug row needn't repeat its treatment id.
        const orderedTreatmentLabels = [];
        const orderedTreatmentDepths = [];
        // Treatments that have at least one dated sub-treatment; each gets an
        // expand/collapse toggle rendered next to its row.
        const subTreatmentParents = [];

        // Adds one dated row (a gantt bar if it has both dates, otherwise a single
        // point) and records its category name in row order.
        const pushDatedRow = ({ name, displayLabel, start, end, treatment_type, intervalColour, pointColour, isSubTreatment, surgeries, radiations }) => {
            if (start != null && end != null) {
                treatmentIntervals.push({
                    name,
                    start: start - birthMonthInterval,
                    end: end - birthMonthInterval,
                    treatment_type,
                    y: (yIndex += 1),
                    color: intervalColour,
                    customGroupId: 'treatments',
                    isSubTreatment,
                    // A same-day treatment has zero width; render it as a visible milestone.
                    milestone: start === end,
                    surgeries,
                    radiations
                });
            } else {
                const presentDate = start != null ? start : end;
                treatmentPoints.push({
                    x: presentDate - birthMonthInterval,
                    name,
                    y: (yIndex += 1),
                    color: pointColour,
                    treatment_type,
                    extra_info: start != null ? 'Start' : 'End',
                    missing_info: start != null ? 'End' : 'Start',
                    customGroupId: 'treatments',
                    isSubTreatment,
                    surgeries,
                    radiations
                });
            }
            orderedTreatmentNames.push(name);
            orderedTreatmentLabels.push(displayLabel ?? name);
            orderedTreatmentDepths.push(isSubTreatment ? 2 : 1);
        };

        // Pulls surgery/radiation detail for a treatment's tooltip, but only when the
        // treatment_type calls for it and a matching linked object actually exists.
        // Anything missing is simply omitted so nothing errors or shows blank.
        const treatmentTypeIncludes = (treatment, keyword) =>
            (Array.isArray(treatment?.treatment_type) ? treatment.treatment_type : [treatment?.treatment_type]).some(
                (type) => typeof type === 'string' && type.toLowerCase().includes(keyword)
            );

        const getSurgeryDetails = (treatment) =>
            treatmentTypeIncludes(treatment, 'surgery') && Array.isArray(treatment?.surgeries)
                ? treatment.surgeries
                      .map((surgery) => ({ type: surgery?.surgery_type, site: surgery?.surgery_site }))
                      .filter((surgery) => surgery.type || surgery.site)
                : [];

        const getRadiationDetails = (treatment) =>
            treatmentTypeIncludes(treatment, 'radiation') && Array.isArray(treatment?.radiations)
                ? treatment.radiations.map((radiation) => radiation?.radiation_therapy_modality).filter(Boolean)
                : [];

        // treatment_type may be a single string or an array of them; join into a
        // readable string for the row label (e.g. "Systemic therapy, Surgery").
        const formatTreatmentType = (type) =>
            (Array.isArray(type) ? type : type != null ? [type] : []).filter(Boolean).join(', ');

        // The parent "Treatments" summary bar spans the full treatment range, so
        // compute that range from the raw dates regardless of collapse state.
        const treatmentTimes = [];
        data.primary_diagnoses?.forEach((diagnosis) =>
            diagnosis.treatments?.forEach((treatment) => {
                const start = treatment.treatment_start_date?.month_interval;
                const end = treatment.treatment_end_date?.month_interval;
                if (start != null) treatmentTimes.push(start - birthMonthInterval);
                if (end != null) treatmentTimes.push(end - birthMonthInterval);
            })
        );
        const maxTime = treatmentTimes.length > 0 ? Math.max(...treatmentTimes) : undefined;
        const minTime = treatmentTimes.length > 0 ? Math.min(...treatmentTimes) : undefined;

        // Build the individual treatment (and expanded sub-treatment) rows only when the
        // Treatments group is expanded. When collapsed we keep just the parent summary
        // row so it — and its expand toggle — stay visible instead of scrolling off.
        if (!isTreatmentsCollapsed) {
            data.primary_diagnoses?.forEach((diagnosis) =>
                diagnosis.treatments?.forEach((treatment) => {
                    const treatmentId = treatment.submitter_treatment_id;
                    const treatmentStart = treatment.treatment_start_date?.month_interval;
                    const treatmentEnd = treatment.treatment_end_date?.month_interval;

                    // Treatments with no dates at all can't be placed on the timeline.
                    if (treatmentStart == null && treatmentEnd == null) {
                        return;
                    }

                    const treatmentTypeText = formatTreatmentType(treatment?.treatment_type);
                    pushDatedRow({
                        name: treatmentId,
                        // Show the treatment type next to the id in the row label,
                        // e.g. "TR_001: Systemic therapy". The point name stays the
                        // bare id (the tooltip lists the type separately).
                        displayLabel: treatmentTypeText ? `${treatmentId}: ${treatmentTypeText}` : treatmentId,
                        start: treatmentStart,
                        end: treatmentEnd,
                        treatment_type: treatment?.treatment_type,
                        intervalColour: theme.palette.primary.main,
                        pointColour: theme.palette.primary.light,
                        isSubTreatment: false,
                        surgeries: getSurgeryDetails(treatment),
                        radiations: getRadiationDetails(treatment)
                    });

                    // Only systemic therapies carry their own dates in the data model;
                    // radiations and surgeries have none, so they are not shown here.
                    const datedTherapies = (treatment.systemic_therapies || []).filter(
                        (therapy) => therapy?.start_date?.month_interval != null || therapy?.end_date?.month_interval != null
                    );
                    if (datedTherapies.length === 0) {
                        return;
                    }

                    subTreatmentParents.push({ name: treatmentId, expanded: expandedTreatments.has(treatmentId) });
                    if (!expandedTreatments.has(treatmentId)) {
                        return;
                    }

                    datedTherapies.forEach((therapy) => {
                        const label = therapy.drug_name || therapy.systemic_therapy_type || 'Systemic therapy';
                        const rowName = `↳ ${treatmentId}: ${label}`;
                        pushDatedRow({
                            name: rowName,
                            // Indentation conveys the parent, so the row label shows
                            // just the drug/therapy; the full name is kept for tooltips.
                            displayLabel: label,
                            start: therapy.start_date?.month_interval,
                            end: therapy.end_date?.month_interval,
                            treatment_type: therapy.systemic_therapy_type,
                            intervalColour: theme.palette.secondary.main,
                            pointColour: theme.palette.secondary.light,
                            isSubTreatment: true
                        });
                    });
                })
            );
        }

        // All treatment rows (parent summary bar, each treatment, and each expanded
        // sub-treatment) live in ONE gantt series. Highcharts does not reliably place
        // many single-point gantt series on a category axis, so a single multi-point
        // series is required for the y (row) of every point to be respected.
        const treatmentData = [
            {
                start: minTime,
                end: maxTime,
                y: yIndexParent,
                color: theme.palette.primary.dark,
                name: 'Treatments',
                customGroupId: 'treatments'
            },
            ...treatmentIntervals,
            // Treatments with a single date render as gantt milestones.
            ...treatmentPoints.map((point) => ({ ...point, start: point.x, end: point.x, milestone: true }))
        ];

        const treatmentsSeries = {
            type: 'gantt',
            name: 'Treatments',
            customGroupId: 'treatments',
            data: treatmentData,
            marker: {
                enabled: true,
                symbol: 'circle',
                radius: 4
            },
            tooltip,
            // Always visible: collapsing is handled by omitting the detail rows above,
            // so the parent summary row (and its toggle) stay on the chart.
            visible: true
        };

        const Updatedseries = adjustedSeries.map((s) => ({
            type: 'scatter',
            data: [s],
            name: s.name,
            marker: {
                enabled: true,
                symbol: 'circle',
                radius: 4
            },
            tooltip,
            visible: true
        }));

        Updatedseries.push(treatmentsSeries);

        const newCategories = activeCategories.concat(orderedTreatmentNames);
        // Indent depth and display text for every y category, parallel to
        // newCategories. Non-treatment rows and the "Treatments" summary bar are
        // depth 0; individual treatments depth 1; expanded drug rows depth 2.
        const categoryDepths = [...activeCategories.map(() => 0), ...orderedTreatmentDepths];
        const categoryLabels = [...activeCategories, ...orderedTreatmentLabels];

        // Initial view: zoom to the span between the first day of diagnosis and the
        // last displayed event. Earlier events (e.g. birth) remain reachable via the
        // navigator/scrollbar.
        const diagnosisX = -birthMonthInterval;
        const displayedTimes = [
            ...adjustedSeries.flatMap((s) => [s?.x, s?.start, s?.end]),
            ...treatmentData.flatMap((s) => [s?.start, s?.end])
        ].filter((v) => typeof v === 'number' && Number.isFinite(v));
        const lastDisplayed = displayedTimes.length > 0 ? Math.max(...displayedTimes) : diagnosisX;
        const zoomPadding = 2;
        const initialMin = diagnosisX - zoomPadding;
        const initialMax = Math.max(lastDisplayed + zoomPadding, initialMin + 12);

        // Grow the chart with the number of rows so expanded sub-treatments always
        // fit; a fixed height overflows and Highcharts clamps extra rows to the top.
        const chartHeight = Math.max(600, 200 + newCategories.length * 45);

        // Collapsing/expanding just flips the flag; the effect rebuilds the chart with
        // or without the detail rows (the parent summary row always stays).
        const toggleTreatmentsCollapse = () => setIsTreatmentsCollapsed((current) => !current);

        // Handles setup of the Highcharts chart with the patient data
        setChartOptions({
            chart: {
                height: chartHeight,
                marginRight: 50,
                events: {
                    render() {
                        const chart = this;

                        // Redraw all collapse/expand toggles from scratch each render.
                        (chart.customButtons || []).forEach((button) => button?.destroy());
                        chart.customButtons = [];

                        // Draws a triangle toggle beside the row for `categoryName`.
                        // `collapsed` controls its rotation (pointing up when collapsed).
                        const drawToggle = (categoryName, collapsed, onClick) => {
                            const categoryIndex = chart.yAxis[0].categories.indexOf(categoryName);
                            if (categoryIndex < 0) {
                                return;
                            }
                            const yPosition = chart.yAxis[0].toPixels(categoryIndex) - 5;
                            const button = chart.renderer
                                .symbol('triangle', chart.plotLeft - 15, yPosition, 10, 10)
                                .attr({
                                    fill: '#7cb5ec',
                                    cursor: 'pointer',
                                    zIndex: 6
                                })
                                .add()
                                .on('click', onClick);

                            if (collapsed) {
                                button.attr({
                                    transform: `rotate(180 ${button.x + 5} ${button.y + 5})`
                                });
                            }
                            chart.customButtons.push(button);
                        };

                        // Parent toggle collapses/expands the whole Treatments group.
                        drawToggle('Treatments', isTreatmentsCollapsed, () => toggleTreatmentsCollapse());

                        // Per-treatment toggles reveal each treatment's dated sub-treatments.
                        if (!isTreatmentsCollapsed) {
                            subTreatmentParents.forEach(({ name, expanded }) => {
                                drawToggle(name, !expanded, () => toggleTreatmentExpand(name));
                            });
                        }
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
                // Place points by their explicit y (row index) rather than by point
                // name, so the interleaved sub-treatment rows stay in the right order.
                uniqueNames: false,
                labels: {
                    useHTML: true,
                    align: 'left',
                    // Indent each row by its depth so individual treatments sit under
                    // the "Treatments" bar and expanded drug rows sit under their
                    // treatment. Points are placed by explicit y index, so changing
                    // the label text here doesn't affect row placement.
                    formatter() {
                        const depth = categoryDepths[this.pos] || 0;
                        const label = categoryLabels[this.pos] ?? this.value;
                        return `<span style="padding-left:${depth * 14}px;font-family:Arial,sans-serif;font-weight:bold">${label}</span>`;
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
                    min: initialMin,
                    max: initialMax,
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
                    showInNavigator: true,
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
        expandedTreatments,
        toggleTreatmentExpand,
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
    return (
        <>
            {/* Hidden control the guided tour clicks to demonstrate a systemic-therapy
                treatment expanding into its per-drug rows. Not a visible/targetable
                tour step — the step anchors to the timeline container. */}
            <button
                type="button"
                data-tour="timeline-expand-demo"
                data-active={demoTreatmentExpanded ? 'true' : 'false'}
                aria-hidden="true"
                tabIndex={-1}
                style={{ display: 'none' }}
                onClick={toggleDemoTreatmentExpand}
            />
            <HighchartsReact highcharts={Highcharts} constructorType="ganttChart" options={chartOptions} />
        </>
    );
}

// PropTypes for component validation
Timeline.propTypes = {
    data: PropTypes.object.isRequired,
    onEventClick: PropTypes.func
};

export default Timeline;
