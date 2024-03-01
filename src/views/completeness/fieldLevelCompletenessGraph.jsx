import { createRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

// mui
// import { useTheme, makeStyles } from '@mui/styles';
import { Box, Divider, FormControl, MenuItem, Select, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';

// project imports
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';

// assets
import MainCard from 'ui-component/cards/MainCard';
import { useTheme } from '@mui/system';

window.Highcharts = Highcharts;

const PREFIX = 'FieldLevelCompletenessGraph';

const classes = {
    titleBar: `${PREFIX}-titleBar`,
    title: `${PREFIX}-title`,
    titleBox: `${PREFIX}-titleBox`,
    siteSelection: `${PREFIX}-siteSelection`,
    spacer: `${PREFIX}-spacer`
};

const Root = styled(Box)(({ _ }) => ({
    [`& .${classes.titleBar}`]: {
        display: 'flex',
        alignItems: 'center'
    },
    [`& .${classes.titleBox}`]: {
        flex: 2,
        display: 'inline-flex',
        marginLeft: 'auto'
    },
    [`& .${classes.title}`]: {
        flex: 2,
        display: 'inline-flex',
        flexDirection: 'row-reverse',
        marginLeft: 'auto'
    },
    [`& .${classes.spacer}`]: {
        flexGrow: 3,
        display: 'inline-flex'
    },
    [`& .${classes.siteSelection}`]: {
        flex: 1,
        display: 'inline-flex'
    }
}));

function FieldLevelCompletenessGraph(props) {
    const { data, loading, title } = props;
    const [filter, setFilter] = useState('All cohorts');
    const theme = useTheme();
    const chartRef = createRef();
    const events = useSelector((state) => state);

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
    const allCohorts = ['All cohorts'];
    if (data) {
        Object.values(data).forEach((site) => {
            const cohorts = site.results?.programs;
            if (!cohorts) {
                return;
            }

            // Convert each one into a singular field
            // Category -> Field name -> { missing & total }
            cohorts.forEach((cohort) => {
                const concatName = `${site.location.name} - ${cohort.program_id}`;
                allCohorts.push(concatName);
                if (concatName !== filter && filter !== 'All cohorts') {
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
    const highChartSettings = {
        legend: {
            enabled: false
        },
        credits: {
            enabled: false
        },
        chart: {
            height: '360px; auto',
            type: 'bar',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        colors: [theme.palette.primary.main],
        plotOptions: {
            bar: {
                dataLabels: {
                    align: 'center',
                    color: theme.palette.primary.light,
                    enabled: true,
                    format: '{y}%',
                    inside: true,
                    style: {
                        textOutline: 'none'
                    }
                }
            }
        },
        title: {
            text: null
        },
        xAxis: {
            labels: {
                // Anonymous functions don't appear to work with highcharts for some reason?
                /* eslint-disable */
                formatter: function () {
                    const identifier = this.value.toString().split('/');
                    const field = identifier.slice(1).join('/').replaceAll('_', ' ');
                    let title = identifier[0][0].toUpperCase() + identifier[0].slice(1).toLowerCase();
                    return `<b>${title}:</b> <span style="text-transform:uppercase">${field}</span>`;
                }
                /* eslint-enable */
            },
            scrollbar: {
                enabled: true
            },
            min: 0,
            max: 10,
            type: 'category'
        },
        yAxis: {
            labels: {
                enabled: false
            },
            min: 0,
            max: 100,
            title: null
        },
        series: [{ name: 'Complete', data: series, colorByPoint: true, showInLegend: false }],
        tooltip: {
            pointFormat: '<b>{point.name}:</b> {point.y}%'
        }
    };

    // Determine what we can do with the data
    return (
        <Root sx={{ position: 'relative' }}>
            <MainCard sx={{ borderRadius: events.customization.borderRadius * 0.25, height: '440px; auto' }}>
                <div className={classes.titleBar}>
                    {/* <div className={classes.titleBox}>
                        <div className={classes.title}>{title}</div>
                        <div className={classes.title}>{title}</div>
                    </div> */}
                    <Typography className={classes.title} variant="h2">
                        {title}
                    </Typography>
                    <div className={classes.spacer} />
                    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                        <Select value={filter} onChange={(event) => setFilter(event.target.value)} className={classes.siteSelection}>
                            {allCohorts.map((cohort) => (
                                <MenuItem value={cohort} key={cohort}>
                                    {cohort}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
                <Divider />
                <HighchartsReact Highcharts={Highcharts} options={highChartSettings} ref={chartRef} />
            </MainCard>
        </Root>
    );
}

FieldLevelCompletenessGraph.propTypes = {
    data: PropTypes.array,
    loading: PropTypes.bool,
    title: PropTypes.string
};

export default FieldLevelCompletenessGraph;
