import { createRef, useState, useEffect } from 'react';

// mui
import { useTheme } from '@mui/styles';
import PropTypes from 'prop-types';
import Highcharts, { map } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import MainCard from 'ui-component/cards/MainCard';

// REDUX
import { useSelector } from 'react-redux';

// Project import
import { splitString } from 'utils/utils';

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
    const { chartType, chart, barTitle, height, loading, datasetName, dataObject, xAxisTitle, yAxisTitle, orderByFrequency, cutoff } =
        props;
    const theme = useTheme();
    const events = useSelector((state) => state);
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
        chart: { type: chartType, height, style: { fontFamily: `'Roboto', sans-serif` } },
        title: {
            text: splitString(barTitle)
        },
        xAxis: { title: { text: xAxisTitle } },
        yAxis: { title: { text: yAxisTitle } }
    });

    useEffect(() => {
        /*
         * Create a Pie chart from props
         */
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
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false
                }
            };
            options.series = [
                {
                    data: Object.keys(dataObject).map((key) => ({
                        name: key,
                        y: dataObject[key]
                    }))
                }
            ];
            setChartOptions(options);
        }

        /*
         * Create Bar chart from props
         */
        function createBarChart() {
            let categories = Object.keys(dataObject);

            // Order & truncate the categories by the data
            if (orderByFrequency) {
                categories.sort((a, b) => dataObject[b] - dataObject[a]);
            }
            if (cutoff) {
                categories = categories.slice(0, cutoff);
            }

            // See dataObject type
            const data = [];
            categories = categories.map((key) => {
                data.push(dataObject[key]);
                return key;
            });

            setChartOptions({
                credits: {
                    enabled: false
                },
                colors: [theme.palette.primary.dark],
                series: [{ data, colorByPoint: true, showInLegend: false }],
                xAxis: { categories },
                tooltip: {
                    useHTML: true,
                    formatter: () => {
                        // Highcharts needs us to use 'this' to access series data, but eslint dislikes this
                        /* eslint-disable react/no-this-in-sfc */
                        let dataSum;

                        if (!this?.series?.points) {
                            return '';
                        }

                        this.series.points.forEach((point) => {
                            dataSum += point.y;
                        });

                        const pcnt = (this.y / dataSum) * 100;
                        return `<b> ${this.point.category}</b><br> - ${this.y} <br> - ${Highcharts.numberFormat(pcnt)}%`;
                        /* eslint-enable react/no-this-in-sfc */
                    }
                }
            });
        }

        /*
         * Create Stacked Bar chart from props
         */

        function createStackedBarChart() {
            const categories = [];
            const data = new Map();
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
                stackSeries.push({ name: key, data: value, dataSorting: { enabled: orderByFrequency } });
            });

            setChartOptions({
                credits: {
                    enabled: false
                },
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
                xAxis: { categories },
                tooltip: {
                    pointFormat: '<b>{point.name}:</b> {point.y}'
                }
            });
        }

        if (chart === 'pie') {
            createPieChart();
        } else if (chart === 'bar') {
            createBarChart();
        } else {
            createStackedBarChart();
        }
    }, [datasetName, dataObject, chartType]);

    // Control whether or not this element is currently loading
    useEffect(() => {
        const chartObj = chartRef?.current?.chart;

        if (loading) {
            chartObj?.showLoading();
        } else {
            chartObj?.hideLoading();
        }
    }, [loading]);

    return (
        <MainCard sx={{ borderRadius: events.customization.borderRadius * 0.25 }}>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartRef} />
        </MainCard>
    );
}

CustomOfflineChart.propTypes = {
    chartType: PropTypes.string.isRequired,
    chart: PropTypes.string.isRequired,
    barTitle: PropTypes.string.isRequired,
    height: PropTypes.string,
    datasetName: PropTypes.string,
    dataObject: PropTypes.objectOf(PropTypes.any).isRequired,
    orderByFrequency: PropTypes.bool,
    cutoff: PropTypes.number
};

CustomOfflineChart.defaultProps = {
    datasetName: '',
    height: '200px; auto'
};

export default CustomOfflineChart;
