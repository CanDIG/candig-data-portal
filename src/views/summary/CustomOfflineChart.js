import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// MUI
import { useTheme } from '@mui/styles';
import { Box, IconButton } from '@mui/material';

// REDUX
import { useSelector } from 'react-redux';

// Third-party libraries
import Cookies from 'js-cookie';
import Highcharts, { map } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { IconTrash } from '@tabler/icons';

// Custon Components and constants
import MainCard from 'ui-component/cards/MainCard';
import { DataVisualizationChartInfo, validCharts, validStackedCharts } from 'store/constant';

window.Highcharts = Highcharts;

/*
 * Component for offline chart
 * @param {string} chartType
 * @param {string} barTitle
 * @param {string} height
 * @param {string} datasetName
 * @param {array} dataObject
 */

function CustomOfflineChart({ chartType, data, index, height, dataVis, dataObject, dropDown, onRemoveChart, edit }) {
    const theme = useTheme();

    // State management
    const events = useSelector((state) => state);
    const [chart, setChart] = useState(chartType);
    const [chartData, setChartData] = useState(data);

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

    // Function to create charts bar, line, pie, stacked, etc.
    useEffect(() => {
        /* eslint-disable react/no-this-in-sfc */
        /* eslint-disable object-shorthand */
        function createChart() {
            if (validStackedCharts.includes(chartData)) {
                // Stacked Bar Chart
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
                data?.forEach((value, key) => {
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
                        text: DataVisualizationChartInfo[chartData].title
                    },
                    xAxis: { title: { text: DataVisualizationChartInfo[chartData].xAxis }, categories },
                    yAxis: { title: { text: DataVisualizationChartInfo[chartData].yAxis } },
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
            } else if (validCharts.includes(chart)) {
                // Bar Chart
                const data = [];
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
                        text: DataVisualizationChartInfo[chartData].title
                    },
                    xAxis: { title: { text: DataVisualizationChartInfo[chartData].xAxis }, categories },
                    yAxis: { title: { text: DataVisualizationChartInfo[chartData].yAxis } },
                    colors: [theme.palette.primary.dark],
                    series: [{ data, colorByPoint: true, showInLegend: false }],
                    tooltip: {
                        useHTML: true,
                        formatter: function () {
                            let dataSum = 0;
                            this.series.points.forEach((point) => {
                                dataSum += point.y;
                            });
                            const pcnt = (this.y / dataSum) * 100;
                            return `<b> ${this.point.category}</b><br> - ${this.y} <br> - ${Highcharts.numberFormat(pcnt)}%`;
                        }
                    }
                });
            } else {
                // Pie Chart
                setChartOptions({
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
                        text: DataVisualizationChartInfo[chartData].title
                    },
                    xAxis: { title: { text: DataVisualizationChartInfo[chartData].xAxis } },
                    yAxis: { title: { text: DataVisualizationChartInfo[chartData].yAxis } },
                    tooltip: {
                        pointFormat: '<b>{point.name}:</b> {point.y}'
                    },
                    series: [
                        {
                            data: Object.keys(dataObject === '' ? dataVis[chartData] : dataObject).map((key) => ({
                                name: key,
                                y: dataObject === '' ? dataVis[chartData][key] : dataObject[key]
                            }))
                        }
                    ]
                });
            }
        }

        createChart();
    }, [dataVis, chart, chartData]);

    function setCookieDataVisChart(event) {
        // Set cookie for Data Visualization Chart Type
        const dataVisChart = JSON.parse(Cookies.get('dataVisChartType'));
        dataVisChart[index] = event.target.value;
        Cookies.set('dataVisChartType', JSON.stringify(dataVisChart), { expires: 365 });
    }

    function setCookieDataVisData(event) {
        // Set Cookie for Data Visualization Data
        const dataVisData = JSON.parse(Cookies.get('dataVisData'));
        dataVisData[index] = event.target.value;
        Cookies.set('dataVisData', JSON.stringify(dataVisData), { expires: 365 });
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
                    onClick={onRemoveChart}
                >
                    <IconTrash />
                </IconButton>
            )}
            <MainCard sx={{ borderRadius: events.customization.borderRadius * 0.25 }}>
                <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                {dropDown && (
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        {validStackedCharts.includes(chartData) ? (
                            <label htmlFor="types">
                                Chart Types:
                                <select
                                    value={chart}
                                    name="types"
                                    id="types"
                                    onChange={(event) => {
                                        setChart(event.target.value);
                                        setCookieDataVisChart(event);
                                    }}
                                >
                                    <option value="bar">Stacked Bar</option>
                                </select>
                            </label>
                        ) : (
                            <label htmlFor="types">
                                Chart Types:
                                <select
                                    value={chart}
                                    name="types"
                                    id="types"
                                    onChange={(event) => {
                                        setChart(event.target.value);
                                        setCookieDataVisChart(event);
                                    }}
                                >
                                    <option value="bar">Bar</option>
                                    <option value="line">Line</option>
                                    <option value="column">Column</option>
                                    <option value="scatter">Scatter</option>
                                    <option value="pie">Pie</option>
                                </select>
                            </label>
                        )}
                        <label htmlFor="types">
                            Data:
                            <select
                                value={chartData}
                                name="types"
                                id="types"
                                onChange={(event) => {
                                    setChartData(event.target.value);
                                    setCookieDataVisData(event);
                                }}
                            >
                                {Object.keys(dataVis).map((key) => (
                                    <option key={key} value={key}>
                                        {DataVisualizationChartInfo[key].title}
                                    </option>
                                ))}
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
    onRemoveChart: PropTypes.func
};

CustomOfflineChart.defaultProps = {
    height: '200px; auto'
};

export default CustomOfflineChart;
