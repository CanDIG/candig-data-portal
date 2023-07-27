import { createRef, useCallback, useState, useEffect } from 'react';

// MUI
import PropTypes from 'prop-types';
import { useTheme } from '@mui/styles';
import { Box, IconButton } from '@mui/material';

// REDUX
import { useSelector } from 'react-redux';

// Third-party libraries
import Highcharts, { map } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
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

function CustomOfflineChart(props) {
    const {
        chartType,
        data,
        index,
        height,
        dataVis,
        dataObject,
        dropDown,
        onRemoveChart,
        edit,
        loading,
        orderByFrequency,
        orderAlphabetically,
        cutoff,
        grayscale,
        trimByDefault
    } = props;
    const theme = useTheme();

    // State management
    const events = useSelector((state) => state);
    const [chart, setChart] = useState(chartType);
    const [chartData, setChartData] = useState(data);
    const [trim, setTrim] = useState(trimByDefault || false);
    const chartRef = createRef();

    NoDataToDisplay(Highcharts);

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
                let categories = [];
                const thisData = dataObject === '' ? dataVis[chartData] : dataObject;

                Object.keys(thisData).forEach((key, i) => {
                    categories.push(key);
                    Object.keys(thisData[key]).forEach((cohort) => {
                        if (!data.has(cohort)) {
                            data.set(cohort, new Array(Object.keys(thisData).length).fill(0));
                        }
                        data.get(cohort).splice(i, 1, thisData[key][cohort]);
                    });

                    // Order & truncate the categories by the data
                    if (orderByFrequency) {
                        categories.sort((a, b) => thisData[b] - thisData[a]);
                    }
                    if (cutoff || trim) {
                        categories = categories.slice(0, cutoff || 15);
                    }
                });

                const stackSeries = [];
                data?.forEach((value, key) => {
                    stackSeries.push({ name: key, data: value });
                });
                const grayscaleTheme = [
                    theme.palette.grey[200],
                    theme.palette.grey[300],
                    theme.palette.grey[500],
                    theme.palette.grey[600],
                    theme.palette.grey[700],
                    theme.palette.grey[900]
                ];
                const colouredTheme = [
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
                ];
                const stackedTheme = grayscale ? grayscaleTheme : colouredTheme;

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
                    colors: stackedTheme,
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
                let entries = Object.keys((dataObject === '' ? dataVis[chartData] : dataObject) || []).map((key) => [
                    key,
                    dataObject === '' ? dataVis[chartData][key] : dataObject[key]
                ]);

                // Order & truncate the categories by the data
                if (orderByFrequency) {
                    entries = entries.sort((a, b) => b[1] - a[1]);
                }
                if (orderAlphabetically) {
                    entries = entries.sort((a, b) => (a[0] > b[0] ? 1 : -1));
                }
                if (cutoff || trim) {
                    entries = entries.slice(0, cutoff || 15);
                }

                const categories = entries.map(([key, _]) => key);
                const data = entries.map(([_, val]) => val);

                setChartOptions({
                    credits: {
                        enabled: false
                    },
                    chart: {
                        type: chart
                    },
                    title: {
                        text: DataVisualizationChartInfo[chartData]?.title
                    },
                    xAxis: { title: { text: DataVisualizationChartInfo[chartData]?.xAxis }, categories },
                    yAxis: { title: { text: DataVisualizationChartInfo[chartData]?.yAxis } },
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
                            return `<b> ${this.point.category}</b><br> - ${this.y} (${Highcharts.numberFormat(pcnt)}%) total patient(s)`;
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
    }, [dataVis, chart, chartData, JSON.stringify(dataObject), trim]);

    function setLocalStorageDataVisChart(event) {
        // Set LocalStorage for Data Visualization Chart Type
        const dataVisChart = JSON.parse(localStorage.getItem('dataVisChartType'));
        dataVisChart[index] = event.target.value;
        localStorage.setItem('dataVisChartType', JSON.stringify(dataVisChart), { expires: 365 });
    }

    function setLocalStorageDataVisData(event) {
        // Set LocalStorage for Data Visualization Data
        const dataVisData = JSON.parse(localStorage.getItem('dataVisData'));
        dataVisData[index] = event.target.value;
        localStorage.setItem('dataVisData', JSON.stringify(dataVisData), { expires: 365 });
    }

    function setLocalStorageDataVisTrim(value) {
        // Set LocalStorage for Data Visualization Trim status
        const dataVisTrim = JSON.parse(localStorage.getItem('dataVisTrim'));
        dataVisTrim[index] = value;
        localStorage.setItem('dataVisTrim', JSON.stringify(dataVisTrim), { expires: 365 });
    }

    /* eslint-disable jsx-a11y/no-onchange */

    // Control whether or not this element is currently loading
    useEffect(() => {
        const chartObj = chartRef?.current?.chart;

        if (loading) {
            chartObj?.showLoading();
        } else {
            chartObj?.hideLoading();
        }
    }, [loading]);

    const showTrim = (dataObject || dataVis[chartData]) && Object.entries(dataObject === '' ? dataVis[chartData] : dataObject).length > 15;

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
                <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartRef} />
                {dropDown && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box sx={{ paddingBottom: '0.5em' }}>
                            <label htmlFor="types">
                                Data:
                                <select
                                    value={chartData}
                                    name="types"
                                    id="types"
                                    onChange={(event) => {
                                        setChartData(event.target.value);
                                        setLocalStorageDataVisData(event);
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
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            {validStackedCharts.includes(chartData) ? (
                                <label htmlFor="types">
                                    Chart Types:
                                    <select
                                        value="bar"
                                        name="types"
                                        id="types"
                                        onChange={(event) => {
                                            setChart(event.target.value);
                                            setLocalStorageDataVisChart(event);
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
                                            setLocalStorageDataVisChart(event);
                                        }}
                                    >
                                        <option value="bar">Bar</option>
                                        <option value="line">Line</option>
                                        <option value="column">Column</option>
                                        <option value="scatter">Scatter</option>
                                    </select>
                                </label>
                            )}
                            {showTrim && (
                                <label htmlFor="trim">
                                    Trim:
                                    <input
                                        type="checkbox"
                                        id="trim"
                                        onChange={() => {
                                            setLocalStorageDataVisTrim(!trim);
                                            setTrim((old) => !old);
                                        }}
                                        checked={trim}
                                    />
                                </label>
                            )}
                        </Box>
                    </Box>
                )}
            </MainCard>
        </Box>
    );
}

CustomOfflineChart.propTypes = {
    dropDown: PropTypes.bool,
    height: PropTypes.string,
    dataVis: PropTypes.any,
    dataObject: PropTypes.any,
    onRemoveChart: PropTypes.func,
    grayscale: PropTypes.bool,
    orderByFrequency: PropTypes.bool,
    orderAlphabetically: PropTypes.bool,
    cutoff: PropTypes.number,
    trimByDefault: PropTypes.bool
};

CustomOfflineChart.defaultProps = {
    height: '200px; auto'
};

export default CustomOfflineChart;
