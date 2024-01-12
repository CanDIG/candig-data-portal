import React from 'react';

// mui
import { useTheme } from '@mui/system';
import { styled } from '@mui/material/styles';
import { Card, CardContent, Grid, Typography } from '@mui/material';

// third-party
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

// project imports
import chartData from './chart-data/bajaj-area-chart';

const PREFIX = 'BajajAreaChartCard';

const classes = {
    card: `${PREFIX}-card`,
    content: `${PREFIX}-content`,
    contentContainer: `${PREFIX}-contentContainer`,
    fontStyle: `${PREFIX}-fontStyle`
};

const StyledCard = styled(Card)(({ theme }) => ({
    [`&.${classes.card}`]: {
        backgroundColor: theme.palette.secondary.light
    },

    [`& .${classes.content}`]: {
        padding: '0px !important'
    },

    [`& .${classes.contentContainer}`]: {
        padding: '16px',
        paddingBottom: 0,
        color: '#fff'
    },

    [`& .${classes.fontStyle}`]: {
        fontWeight: 400
    }
}));

//= ==========================|| DASHBOARD DEFAULT - BAJAJ AREA CHART CARD ||===========================//

function BajajAreaChartCard() {
    const theme = useTheme();

    const orangeDark = theme.palette.secondary[800];

    React.useEffect(() => {
        const newSupportChart = {
            ...chartData.options,
            colors: [orangeDark],
            tooltip: {
                theme: 'light'
            }
        };
        ApexCharts.exec(`support-chart`, 'updateOptions', newSupportChart);
    }, [orangeDark]);

    return (
        <StyledCard className={classes.card}>
            <CardContent className={classes.content}>
                <Grid container className={classes.contentContainer}>
                    <Grid item xs={12}>
                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                                <Typography variant="subtitle1" sx={{ color: theme.palette.secondary.dark }}>
                                    Bajaj Finery
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h4" sx={{ color: theme.palette.grey[800] }}>
                                    $1839.00
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ color: theme.palette.grey[800] }}>
                            10% Profit
                        </Typography>
                    </Grid>
                </Grid>
                <Chart {...chartData} />
            </CardContent>
        </StyledCard>
    );
}

export default BajajAreaChartCard;
