import { createRef, useState, useEffect } from 'react';

// mui
// import { useTheme, makeStyles } from '@mui/styles';
import { Box, MenuItem, Select, Typography } from '@mui/material';
import PropTypes from 'prop-types';

// project imports
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

// assets
import MainCard from 'ui-component/cards/MainCard';
import { useTheme } from '@mui/system';

window.Highcharts = Highcharts;

function FieldLevelCompletenessGraph(props) {
    const { data, loading } = props;
    const [filter, setFilter] = useState('All sites');
    const theme = useTheme();
    const chartRef = createRef();

    NoDataToDisplay(Highcharts);

    useEffect(() => {
        const chartObj = chartRef?.current?.chart;

        if (loading) {
            chartObj?.showLoading();
        } else {
            chartObj?.hideLoading();
        }
    }, [chartRef, loading]);

    // TODO: Filter fields here
    const fields = {};
    const allCohorts = ['All sites'];
    if (data) {
        Object.values(data).forEach((site) => {
            const cohorts = site.results?.results;
            if (!cohorts) {
                return;
            }

            // Convert each one into a singular field
            // Category -> Field name -> { missing & total }
            cohorts.forEach((cohort) => {
                allCohorts.push(cohort.program_id);
                if (cohort.program_id !== filter && filter !== 'All sites') {
                    return;
                }

                const theseFields = cohort?.metadata?.required_but_missing;
                Object.keys(theseFields).forEach((fieldCategory) => {
                    Object.keys(theseFields[fieldCategory]).forEach((fieldName) => {
                        const concatenatedName = `${fieldCategory}/${fieldName}`;
                        if (!(concatenatedName in fields)) {
                            fields[concatenatedName] = {
                                missing: theseFields[fieldCategory][fieldName].missing,
                                total: theseFields[fieldCategory][fieldName].total
                            };
                        } else {
                            fields[concatenatedName].missing += theseFields[fieldCategory][fieldName].missing;
                            fields[concatenatedName].total += theseFields[fieldCategory][fieldName].total;
                        }
                    });
                });
            });
        });
    }

    /* Object.keys(fields).forEach((field) => {
        fields[field].pct = 1 - fields[field].missing / fields[field].total;
    }); */

    // Convert this into something HighCharts can understand
    // First, we need to convert the fields into a list, sorted by their width
    const series = Object.keys(fields)
        .map((field) => {
            const pct = fields[field].total === 0 ? 0 : 1 - fields[field].missing / fields[field].total;
            return [field, pct * 100];
        })
        .sort((a, b) => a[1] - b[1]);
    const categories = series.map((point) => point[0]);
    const dataPoints = series.map((point) => point[1]);
    console.log(categories);
    console.log(dataPoints);
    const highChartSettings = {
        credits: {
            enabled: false
        },
        chart: {
            type: 'bar',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
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
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true,
                    format: '{y}%'
                }
            }
        },
        title: {
            text: 'Data Completeness'
        },
        xAxis: {
            labels: {
                // Anonymous functions don't appear to work with highcharts for some reason?
                /* eslint-disable */
                formatter: function() {
                    const identifier = this.value.toString().split('/');
                    const field = identifier.slice(1).join('/').replaceAll('_', ' ');
                    let title = identifier[0][0].toUpperCase() + identifier[0].slice(1).toLowerCase();
                    return `<b>${title}</b> <span style="text-transform:uppercase">${field}</span>`;
                }
                /* eslint-enable */
            },
            min: 0,
            max: 10,
            type: 'category'
        },
        yAxis: {
            title: null,
            min: 0,
            max: 100
        },
        scrollbar: {
            enabled: true
        },
        series: [{ data: series, colorByPoint: true, showInLegend: false }],
        tooltip: {
            pointFormat: '<b>{point.name}:</b> {point.y}%'
        }
    };

    // Determine what we can do with the data
    return (
        <Box sx={{ position: 'relative' }}>
            <MainCard sx={{ borderRadius: 0.25 }}>
                <Select value={filter} onChange={(event) => setFilter(event.target.value)}>
                    {allCohorts.map((cohort) => (
                        <MenuItem value={cohort} key={cohort}>
                            {cohort}
                        </MenuItem>
                    ))}
                </Select>
                <HighchartsReact Highcharts={Highcharts} options={highChartSettings} ref={chartRef} />
            </MainCard>
        </Box>
    );
}

FieldLevelCompletenessGraph.propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool
};

export default FieldLevelCompletenessGraph;
