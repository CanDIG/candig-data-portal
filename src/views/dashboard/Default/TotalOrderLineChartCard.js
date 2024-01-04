import PropTypes from 'prop-types';
import React from 'react';

// mui
import { styled } from '@mui/material/styles';
import { Avatar, Button, Grid, Typography } from '@mui/material';

// third-party
import Chart from 'react-apexcharts';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonTotalOrderCard from 'ui-component/cards/Skeleton/EarningCard';

import ChartDataMonth from './chart-data/total-order-month-line-chart';
import ChartDataYear from './chart-data/total-order-year-line-chart';

// assets
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const PREFIX = 'TotalOrderLineChartCard';

const classes = {
    card: `${PREFIX}-card`,
    content: `${PREFIX}-content`,
    avatar: `${PREFIX}-avatar`,
    cardHeading: `${PREFIX}-cardHeading`,
    subHeading: `${PREFIX}-subHeading`,
    avatarCircle: `${PREFIX}-avatarCircle`,
    circleIcon: `${PREFIX}-circleIcon`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
    [`& .${classes.card}`]: {
        backgroundColor: theme.palette.primary.dark,
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
        '&>div': {
            position: 'relative',
            zIndex: 5
        },
        '&:after': {
            content: '""',
            position: 'absolute',
            width: '210px',
            height: '210px',
            background: theme.palette.primary[800],
            borderRadius: '50%',
            zIndex: 1,
            top: '-85px',
            right: '-95px',
            [theme.breakpoints.down('sm')]: {
                top: '-105px',
                right: '-140px'
            }
        },
        '&:before': {
            content: '""',
            position: 'absolute',
            zIndex: 1,
            width: '210px',
            height: '210px',
            background: theme.palette.primary[800],
            borderRadius: '50%',
            top: '-125px',
            right: '-15px',
            opacity: 0.5,
            [theme.breakpoints.down('sm')]: {
                top: '-155px',
                right: '-70px'
            }
        }
    },

    [`& .${classes.content}`]: {
        padding: '20px !important'
    },

    [`& .${classes.avatar}`]: {
        ...theme.typography.commonAvatar,
        ...theme.typography.largeAvatar,
        backgroundColor: theme.palette.primary[800],
        color: '#fff',
        marginTop: '8px'
    },

    [`& .${classes.cardHeading}`]: {
        fontSize: '2.125rem',
        fontWeight: 500,
        marginRight: '8px',
        marginTop: '14px',
        marginBottom: '6px'
    },

    [`& .${classes.subHeading}`]: {
        fontSize: '1rem',
        fontWeight: 500,
        color: theme.palette.primary[200]
    },

    [`& .${classes.avatarCircle}`]: {
        ...theme.typography.smallAvatar,
        cursor: 'pointer',
        backgroundColor: theme.palette.primary[200],
        color: theme.palette.primary.dark
    },

    [`& .${classes.circleIcon}`]: {
        transform: 'rotate3d(1, 1, 1, 45deg)'
    }
}));

// ===========================|| DASHBOARD - TOTAL ORDER LINE CHART CARD ||=========================== //

function TotalOrderLineChartCard({ isLoading }) {
    const [timeValue, setTimeValue] = React.useState(false);
    const handleChangeTime = (event, newValue) => {
        setTimeValue(newValue);
    };

    return (
        <Root>
            {isLoading ? (
                <SkeletonTotalOrderCard />
            ) : (
                <MainCard border={false} className={classes.card} contentClass={classes.content}>
                    <Grid container direction="column">
                        <Grid item>
                            <Grid container justifyContent="space-between">
                                <Grid item>
                                    <Avatar variant="rounded" className={classes.avatar}>
                                        <LocalMallOutlinedIcon fontSize="inherit" />
                                    </Avatar>
                                </Grid>
                                <Grid item>
                                    <Button
                                        disableElevation
                                        variant={timeValue ? 'contained' : 'string'}
                                        size="small"
                                        onClick={(e) => handleChangeTime(e, true)}
                                    >
                                        Month
                                    </Button>
                                    <Button
                                        disableElevation
                                        variant={!timeValue ? 'contained' : 'string'}
                                        size="small"
                                        onClick={(e) => handleChangeTime(e, false)}
                                    >
                                        Year
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item sx={{ mb: 0.75 }}>
                            <Grid container alignItems="center">
                                <Grid item xs={6}>
                                    <Grid container alignItems="center">
                                        <Grid item>
                                            {timeValue ? (
                                                <Typography className={classes.cardHeading}>$108</Typography>
                                            ) : (
                                                <Typography className={classes.cardHeading}>$961</Typography>
                                            )}
                                        </Grid>
                                        <Grid item>
                                            <Avatar className={classes.avatarCircle}>
                                                <ArrowDownwardIcon fontSize="inherit" className={classes.circleIcon} />
                                            </Avatar>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography className={classes.subHeading}>Total Order</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={6}>
                                    {timeValue ? <Chart {...ChartDataMonth} /> : <Chart {...ChartDataYear} />}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </MainCard>
            )}
        </Root>
    );
}

TotalOrderLineChartCard.propTypes = {
    isLoading: PropTypes.bool
};

export default TotalOrderLineChartCard;
