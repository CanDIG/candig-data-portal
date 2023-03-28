import { useState, useEffect } from 'react';

// mui
import { useTheme } from '@mui/styles';
import PropTypes from 'prop-types';
import Highcharts, { map } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import MainCard from 'ui-component/cards/MainCard';

// REDUX
import { useSelector } from 'react-redux';
import { xAxis } from 'store/constant';

window.Highcharts = Highcharts;

/*
 * Transform a camelCase string to a capital spaced string
 */
function splitString(newString) {
    const splitted = newString.replace(/([a-z])([A-Z])/g, '$1 $2');
    const capitalized = splitted.charAt(0).toUpperCase() + splitted.substr(1);
    return capitalized;
}

/*
 * Component for offline chart
 * @param {string} chartType
 * @param {string} barTitle
 * @param {string} height
 * @param {string} datasetName
 * @param {array} dataObject
 */

function CustomOfflineChart({ chartType, chart, barTitle, height, datasetName, dataObject, xAxisTitle, yAxisTitle }) {
    const theme = useTheme();
    const events = useSelector((state) => state);
    const [chartOptions, setChartOptions] = useState({
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
            const data = [];

            const categories = Object.keys(dataObject).map((key) => {
                data.push(dataObject[key]);
                return key;
            });

            setChartOptions({
                credits: {
                    enabled: false
                },
                series: [{ data, colorByPoint: true, showInLegend: false }],
                xAxis: { categories },
                tooltip: {
                    pointFormat: '<b>{point.name}:</b> {point.y}'
                }
            });
        }

        /*
        * Create Stacked Bar chart from props
        */

        function createStackedBarChart() {
            const data = new Map();
            const categories = [];
            let i = 0;

            Object.keys(dataObject).map((key) => {
                categories.push(key);
                Object.keys(dataObject[key]).map((cohort) => {
                    if (data.has(cohort)) {
                        data.get(cohort).splice(i, 1, dataObject[key][cohort])
                    } else {
                        data.set(cohort, new Array(Object.keys(dataObject).length).fill(0));
                        data.get(cohort).splice(i, 1, dataObject[key][cohort]);
                    }
                });
                i++;
            });

            const stackSeries = [];
            for (let [key, value] of data) {
                stackSeries.push({ name: key, data: value });
            };

            setChartOptions({
                credits: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        stacking: 'normal'
                    }
                },
                legend: { enabled: false },
                series: stackSeries,
                xAxis: { categories }
            });
        }
        console.log("Chart type " + chart);
        if (chart === "pie") {
            createPieChart();
        } else if (chart === 'bar') {
            createBarChart();
        } else {
            createStackedBarChart();
        }

    }, [datasetName, dataObject, chartType]);

    return (
        <MainCard sx={{ borderRadius: events.customization.borderRadius * 0.25 }}>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </MainCard>
    );
}

CustomOfflineChart.propTypes = {
    chartType: PropTypes.string.isRequired,
    chart: PropTypes.string.isRequired,
    barTitle: PropTypes.string.isRequired,
    height: PropTypes.string,
    datasetName: PropTypes.string,
    dataObject: PropTypes.objectOf(PropTypes.number).isRequired,
    xAxis: PropTypes.array
};

CustomOfflineChart.defaultProps = {
    datasetName: '',
    height: '200px; auto'
};

export default CustomOfflineChart;
