import { createRef, useState, useEffect } from 'react';

// MUI
import PropTypes from 'prop-types';
import { useTheme } from '@mui/system';
import { Box, IconButton } from '@mui/material';

// REDUX
import { useSelector } from 'react-redux';

// Third-party libraries
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import { IconTrash } from '@tabler/icons-react';

// Custon Components and constants
import MainCard from 'ui-component/cards/MainCard';
import { DataVisualizationChartInfo, validCharts, validStackedCharts } from 'store/constant';
import { HAS_CENSORED_DATA_MARKER } from 'utils/utils';

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
        trimByDefault,
        onChangeDataVisChartType,
        onChangeDataVisData
    } = props;
    const theme = useTheme();

    // State management
    const customization = useSelector((state) => state.customization);
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
        ],
        title: {
            style: {
                fontWeight: 'normal'
            }
        }
    });

    // Function to create charts bar, line, pie, stacked, etc.
    useEffect(() => {
        // Determine whether or not there exists censored data in the object provided
        function hasCensoredData(dataObj) {
            function isObjectCensored(obj) {
                const realKey = Object.keys(obj).find((thisName) => thisName.endsWith('_count'));
                return obj[realKey].startsWith('<');
            }
            if (typeof dataObj === 'object') {
                // We've already marked this object as having censored data
                if (dataObj[HAS_CENSORED_DATA_MARKER]) {
                    return true;
                }

                return Object.values(dataObj).some((datum) => {
                    // datum is either going to be one of three things:
                    // 1. an array of objects
                    // 2. an object which whose keys are indexes and whose values are objects with <var>_count and <var>_name
                    // 3. an object whose keys are cohorts and whose values are numbers
                    // (Why the return value is formatted this way I have no idea)

                    // Case 1: an array of objects
                    if (Array.isArray(datum)) {
                        return datum.some((obj) => isObjectCensored(obj));
                    }

                    if (typeof datum === 'object') {
                        // Case 2: an object which whose keys are indexes and whose values are objects with <var>_count and <var>_name
                        if (Object.values(datum).every((obj) => typeof obj === 'object')) {
                            return isObjectCensored(datum);
                        }

                        // Case 3: an object whose keys are cohorts and whose values are numbers
                        return Object.values(datum).some((val) => typeof val === 'string' && val.startsWith('<'));
                    }

                    console.log(`Could not parse input to hasCensoredData: ${datum}`);
                    return false;
                });
            }

            if (Array.isArray(dataObj)) {
                return dataObj.some((datum) => isObjectCensored(datum));
            }

            // Usually if the data is undefined we'll get here: return false
            return false;
        }
        const isCensored = hasCensoredData(dataObject);
        const { [HAS_CENSORED_DATA_MARKER]: _, ...dataObjectToUse } = dataObject;
        const censorshipCaption = isCensored
            ? {
                  align: 'left',
                  verticalAlign: 'bottom',
                  text: isCensored ? 'Attention: Totals do not include counts of less than 5 from any node' : '',
                  style: {
                      color: 'gray'
                  }
              }
            : {};

        /* eslint-disable react/no-this-in-sfc */
        /* eslint-disable object-shorthand */
        function createChart() {
            if (validStackedCharts.includes(chartData)) {
                // Stacked Bar Chart
                const data = new Map();
                let categories = [];
                const thisData = dataObjectToUse === '' ? dataVis[chartData] : dataObjectToUse;

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
                        text: DataVisualizationChartInfo[chartData].title,
                        style: {
                            fontWeight: 'normal'
                        }
                    },
                    xAxis: { title: { text: DataVisualizationChartInfo[chartData].xAxis }, categories, allowDecimals: false },
                    yAxis: { title: { text: DataVisualizationChartInfo[chartData].yAxis }, allowDecimals: false },
                    colors: stackedTheme,
                    plotOptions: {
                        series: {
                            stacking: 'normal'
                        }
                    },
                    legend: { enabled: false },
                    series: stackSeries,
                    tooltip: {
                        pointFormat: '<b>{series.name}:</b> {point.y}'
                    },
                    caption: censorshipCaption
                });
            } else if (validCharts.includes(chart)) {
                // Bar Chart
                let entries = Object.keys((dataObjectToUse === '' ? dataVis[chartData] : dataObjectToUse) || []).map((key) => [
                    key,
                    dataObjectToUse === '' ? dataVis[chartData][key] : dataObjectToUse[key]
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
                        text: DataVisualizationChartInfo[chartData]?.title,
                        style: {
                            fontWeight: 'normal'
                        }
                    },
                    xAxis: { title: { text: DataVisualizationChartInfo[chartData]?.xAxis }, categories, allowDecimals: false },
                    yAxis: { title: { text: DataVisualizationChartInfo[chartData]?.yAxis }, allowDecimals: false },
                    colors: [theme.palette.primary.dark],
                    series: [{ data, colorByPoint: true, showInLegend: false }],
                    tooltip: {
                        useHTML: true,
                        // Anonymous functions don't appear to work with highcharts for some reason?
                        /* eslint-disable func-names */
                        formatter: function () {
                            let dataSum = 0;
                            this.series.points.forEach((point) => {
                                dataSum += point.y;
                            });
                            const pcnt = (this.y / dataSum) * 100;
                            return `<b> ${this.key}</b><br> - ${this.y} (${Highcharts.numberFormat(
                                pcnt
                            )}%) total ${this.series.yAxis.axisTitle.textStr.toLowerCase()}`;
                        }
                        /* eslint-enable func-names */
                    },
                    exporting: {
                        enabled: false
                    },
                    caption: censorshipCaption
                });
            } else {
                // Pie Chart
                setChartOptions({
                    credits: {
                        enabled: false
                    },
                    exporting: {
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
                        text: DataVisualizationChartInfo[chartData].title,
                        style: {
                            fontWeight: 'normal'
                        }
                    },
                    xAxis: { title: { text: DataVisualizationChartInfo[chartData].xAxis }, allowDecimals: false },
                    yAxis: { title: { text: DataVisualizationChartInfo[chartData].yAxis }, allowDecimals: false },
                    tooltip: {
                        pointFormat: '<b>{point.name}:</b> {point.y}'
                    },
                    series: [
                        {
                            data: Object.keys(dataObjectToUse === '' ? dataVis[chartData] : dataObjectToUse).map((key) => ({
                                name: key,
                                y: dataObjectToUse === '' ? dataVis[chartData][key] : dataObjectToUse[key]
                            }))
                        }
                    ],
                    caption: censorshipCaption
                });
            }
        }

        createChart();
    }, [
        dataVis,
        chart,
        chartData,
        trim,
        cutoff,
        dataObject,
        grayscale,
        height,
        orderAlphabetically,
        orderByFrequency,
        theme.palette.grey,
        theme.palette.primary,
        theme.palette.secondary,
        theme.palette.tertiary
    ]);

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
    }, [chartRef, loading]);

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
            <MainCard sx={{ borderRadius: customization.borderRadius * 0.25 }}>
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
                                        onChangeDataVisData(event.target.value);
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
                                            onChangeDataVisChartType(event.target.value);
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
                                            onChangeDataVisChartType(event.target.value);
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
    chartType: PropTypes.string,
    cutoff: PropTypes.number,
    data: PropTypes.string,
    dataObject: PropTypes.any,
    dataVis: PropTypes.any,
    dropDown: PropTypes.bool,
    edit: PropTypes.bool,
    grayscale: PropTypes.bool,
    height: PropTypes.string,
    index: PropTypes.number,
    loading: PropTypes.bool,
    onRemoveChart: PropTypes.func,
    orderByFrequency: PropTypes.bool,
    orderAlphabetically: PropTypes.bool,
    trimByDefault: PropTypes.bool,
    onChangeDataVisChartType: PropTypes.func,
    onChangeDataVisData: PropTypes.func
};

CustomOfflineChart.defaultProps = {
    height: '200px; auto'
};

export default CustomOfflineChart;
