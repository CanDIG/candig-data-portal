import { useState, useEffect } from 'react';

// mui
import { useTheme } from '@mui/styles';
import PropTypes from 'prop-types';
import Highcharts, { map } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import MainCard from 'ui-component/cards/MainCard';
import { Box, Typography, Grid, IconButton } from '@mui/material';

// REDUX
import { useSelector } from 'react-redux';

// assets
import { IconTrash } from '@tabler/icons';

import { DataVisualization } from 'store/constant';

window.Highcharts = Highcharts;

/*
 * Component for offline chart
 * @param {string} chartType
 * @param {string} barTitle
 * @param {string} height
 * @param {string} datasetName
 * @param {array} dataObject
 */

function CustomOfflineChart({ chartType, data, height, dataVis, dataObject, dropDown, callBack, edit }) {
    const theme = useTheme();
    const events = useSelector((state) => state);
    const [chart, setChart] = useState(chartType);
    const [chartData, setChartData] = useState(data);
    const validCharts = ['bar', 'line', 'scatter', 'column'];
    const validStackedCharts = ['patients_per_cohort', 'full_clinical_data', 'full_genomic_data'];

    const [chartOptions, setChartOptions] = useState({
        credits: {
            enabled: false
        },
        colors: [
            theme.palette.primary[200],
            theme.palette.secondary[200],
            theme.palette.tertiary[200],
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.tertiary.main,
            theme.palette.primary.dark,
            theme.palette.secondary.dark,
            theme.palette.tertiary.dark,
            theme.palette.primary[800],
            theme.palette.secondary[800],
            theme.palette.tertiary[800]
        ]
    });

    useEffect(() => {
        /*
         * Create a Pie chart from props
         */
        console.log(chartData);
        console.log(DataVisualization[chartData].title);
        function createPieChart() {
            const options = {
                credits: {
                    enabled: false
                },
                colors: [
                    theme.palette.primary[200],
                    theme.palette.primary.main,
                    theme.palette.primary.dark,
                    theme.palette.primary[800],
                    theme.palette.secondary[200],
                    theme.palette.secondary.main,
                    theme.palette.secondary.dark,
                    theme.palette.secondary[800],
                    theme.palette.tertiary[200],
                    theme.palette.tertiary.main,
                    theme.palette.tertiary.dark,
                    theme.palette.tertiary[800]
                ],
                chart: {
                    type: chart,
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                },
                title: {
                    text: DataVisualization[chartData].title
                },
                xAxis: { title: { text: DataVisualization[chartData].xAxis } },
                yAxis: { title: { text: DataVisualization[chartData].yAxis } },
                tooltip: {
                    pointFormat: '<b>{point.name}:</b> {point.y}'
                }
            };
            options.series = [
                {
                    data: Object.keys(dataObject === '' ? dataVis[chartData] : dataObject).map((key) => ({
                        name: key,
                        y: dataObject === '' ? dataVis[chartData][key] : dataObject[key]
                    }))
                }
            ];
            setChartOptions(options);
        }

        /*
         * Create Bar chart from props
         */
        function createBarChart() {
            const data = [];
            /* Expected dataObject Shape */
            /*
                {
                    "0-19 Years": 10,
                    "20-29 Years": 20,
                    "30-39 Years": 40,
                    "40-49 Years": 60,
                    "50-59 Years": 50,
                    "60-69 Years": 55,
                    "70-79 Years": 20,
                    "80+ Years": 15
                }
            */
            // See dataObject type
            const categories = Object.keys(dataObject === '' ? dataVis[chartData] : dataObject).map((key) => {
                data.push(dataObject === '' ? dataVis[chartData][key] : dataObject[key]);
                return key;
            });

            setChartOptions({
                credits: {
                    enabled: false
                },
                chart: {
                    type: chart
                },

                title: {
                    text: DataVisualization[chartData].title
                },
                xAxis: { title: { text: DataVisualization[chartData].xAxis }, categories },
                yAxis: { title: { text: DataVisualization[chartData].yAxis } },
                colors: [theme.palette.primary.dark],
                series: [{ data, colorByPoint: true, showInLegend: false }],
                tooltip: {
                    useHTML: true,
                    // Highcharts needs us to use 'this' to access series data, but eslint dislikes this
                    /* eslint-disable react/no-this-in-sfc */
                    /* eslint-disable object-shorthand */
                    formatter: function () {
                        let dataSum;

                        this.series.points.forEach((point) => {
                            dataSum += point.y;
                        });

                        const pcnt = (this.y / dataSum) * 100;
                        return `<b> ${this.point.category}</b><br> - ${this.y} <br> - ${Highcharts.numberFormat(pcnt)}%`;
                        /* eslint-enable react/no-this-in-sfc */
                        /* eslint-enable object-shorthand */
                    }
                }
            });
        }

        /*
         * Create Stacked Bar chart from props
         */

        function createStackedBarChart() {
            const data = new Map();
            const categories = [];
            dataObject = dataObject === '' ? dataVis[chartData] : dataObject;

            Object.keys(dataObject).forEach((key, i) => {
                categories.push(key);
                Object.keys(dataObject[key]).forEach((cohort) => {
                    if (!data.has(cohort)) {
                        data.set(cohort, new Array(Object.keys(dataObject).length).fill(0));
                    }
                    data.get(cohort).splice(i, 1, dataObject[key][cohort]);
                });
            });

            const stackSeries = [];
            data.forEach((value, key) => {
                stackSeries.push({ name: key, data: value });
            });

            setChartOptions({
                credits: {
                    enabled: false
                },
                chart: {
                    type: chart,
                    height
                },
                title: {
                    text: DataVisualization[chartData].title
                },
                xAxis: { title: { text: DataVisualization[chartData].xAxis }, categories },
                yAxis: { title: { text: DataVisualization[chartData].yAxis } },
                colors: [
                    theme.palette.secondary[200],
                    theme.palette.tertiary[200],
                    theme.palette.primary[200],
                    theme.palette.secondary.main,
                    theme.palette.tertiary.main,
                    theme.palette.primary.main,
                    theme.palette.secondary.dark,
                    theme.palette.tertiary.dark,
                    theme.palette.primary.dark,
                    theme.palette.secondary[800],
                    theme.palette.tertiary[800],
                    theme.palette.primary[800]
                ],
                plotOptions: {
                    series: {
                        stacking: 'normal'
                    }
                },
                legend: { enabled: false },
                series: stackSeries,
                tooltip: {
                    pointFormat: '<b>{point.name}:</b> {point.y}'
                }
            });
        }

        if (validStackedCharts.includes(chartData)) {
            createStackedBarChart();
        } else if (validCharts.includes(chart)) {
            createBarChart();
        } else {
            createPieChart();
        }
    }, [dataVis, chart, chartData]);

    function RemoveChart() {
        // Remove chart from parent
        console.log('Remove Chart', chartData);
        callBack();
    }

    /* eslint-disable jsx-a11y/no-onchange */
    return (
        <Box sx={{ position: 'relative' }}>
            {edit && (
                <IconButton
                    color="error"
                    size="small"
                    sx={{
                        background: 'white',
                        border: 1,
                        borderRadius: '100%',
                        borderColor: theme.palette.error.main,
                        boxShadow: theme.shadows[8],
                        position: 'absolute',
                        zIndex: '1000',
                        padding: '0.10em',
                        left: -5,
                        top: -10
                    }}
                    onClick={() => {
                        RemoveChart();
                    }}
                >
                    <IconTrash />
                </IconButton>
            )}
            <MainCard sx={{ borderRadius: events.customization.borderRadius * 0.25 }}>
                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                {dropDown && (
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <label htmlFor="types">
                            Chart Types:
                            <select value={chart} name="types" id="types" onChange={(event) => setChart(event.target.value)}>
                                <option value="bar">Bar</option>
                                <option value="line">Line</option>
                                <option value="column">Column</option>
                                <option value="scatter">Scatter</option>
                                <option value="pie">Pie</option>
                                <option value="bar">Stacked Bar</option>
                            </select>
                        </label>
                        <label htmlFor="types">
                            Data:
                            <select value={chartData} name="types" id="types" onChange={(event) => setChartData(event.target.value)}>
                                <option value="patients_per_cohort">Distribution of Cohort by Node</option>
                                <option value="full_clinical_data">Complete Clinical Data</option>
                                <option value="full_genomic_data">Complete Genomic Data</option>
                                <option value="diagnosis_age_count">Age</option>
                                <option value="treatment_type_count">Treatment</option>
                                <option value="cancer_type_count">Cancer type</option>
                            </select>
                        </label>
                    </Box>
                )}
            </MainCard>
        </Box>
    );
}

CustomOfflineChart.propTypes = {
    dropDown: PropTypes.bool.isRequired,
    height: PropTypes.string,
    dataVis: PropTypes.any,
    dataObject: PropTypes.any,
    callBack: PropTypes.func
};

CustomOfflineChart.defaultProps = {
    height: '200px; auto'
};

export default CustomOfflineChart;
