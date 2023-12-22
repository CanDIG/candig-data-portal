import { useState } from 'react';

import { Avatar, Box, Button, CardHeader, Divider, Grid, Typography } from '@mui/material';
import { useTheme, makeStyles } from '@mui/system';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
    patientEntry: {
        // React center span?
    },
    container: {
        height: 80
    },
    siteName: {
        // Left-aligned
        width: 120
    },
    locked: {
        backgroundColor: theme.palette.action.disabledBackground
    },
    button: {
        // Right-aligned
        float: 'right',
        marginLeft: 'auto'
    },
    divider: {
        borderColor: theme.palette.primary.main,
        marginTop: 20,
        marginBottom: 4
    }
}));

function PatientCountSingle(props) {
    const { site, counts } = props;
    const theme = useTheme();
    const classes = useStyles();
    const [expanded, setExpanded] = useState(false);

    const totalPatients = Object.values(counts.totals)?.reduce((partialSum, cohortTotal) => partialSum + cohortTotal, 0) || 0;
    const patientsInSearch = Object.values(counts.counts)?.reduce((partialSum, cohortTotal) => partialSum + cohortTotal, 0) || 0;
    const numCohorts = Object.values(counts.totals)?.length || 0;

    /* const avatarProps = locked
        ? {
              // If we're locked out, gray out the avatar
              sx: { bgcolor: theme.palette.action.disabled }
          }
        : {}; */

    return (
        <Box pr={2} sx={{ border: 1, borderRadius: 2, boxShadow: 2, borderColor: 'primary.main' }}>
            <Grid container justifyContent="center" alignItems="center" spacing={2} className={classes.container}>
                <Grid item xs={2}>
                    <CardHeader avatar={<Avatar>{site.slice(0, 1).toUpperCase()}</Avatar>} title={<b>{site}</b>} />
                </Grid>
                <Divider flexItem orientation="vertical" className={classes.divider} />
                <Grid item xs={2}>
                    <Typography align="center" className={classes.patientEntry}>
                        {patientsInSearch}
                    </Typography>
                </Grid>
                <Divider flexItem orientation="vertical" className={classes.divider} />
                <Grid item xs={2}>
                    <Typography align="center" className={classes.patientEntry}>
                        {totalPatients}
                    </Typography>
                </Grid>
                <Divider flexItem orientation="vertical" className={classes.divider} />
                <Grid item xs={2}>
                    <Typography align="center" className={classes.patientEntry}>
                        {numCohorts}
                    </Typography>
                </Grid>
                <Divider flexItem orientation="vertical" className={classes.divider} />
                <Grid item className={classes.button} pr={-2}>
                    {numCohorts > 1 ? (
                        <Button
                            onClick={(_) => setExpanded((old) => !old)}
                            variant="contained"
                            sx={{
                                borderRadius: 100,
                                border: `solid 1px ${theme.palette.primary.main}`,
                                backgroundColor: 'white',
                                color: theme.palette.primary.main
                            }}
                        >
                            {expanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                        </Button>
                    ) : (
                        <></>
                    )}
                </Grid>
            </Grid>

            {expanded ? (
                Object.keys(counts.totals).map((cohort) => {
                    const locked = !counts.unlockedPrograms?.some((programID) => programID === cohort);
                    return (
                        <Grid container justifyContent="center" alignItems="center" spacing={2} key={cohort} className={classes.container}>
                            <Grid item xs={2}>
                                <Typography variant="h5" align="center" className={classes.patientEntry}>
                                    <b>{cohort}</b>
                                </Typography>
                            </Grid>
                            <Divider flexItem orientation="vertical" className={classes.divider} />
                            <Grid item xs={2}>
                                <Typography align="center" className={classes.patientEntry}>
                                    {counts.counts?.[cohort] || 0}
                                </Typography>
                            </Grid>
                            <Divider flexItem orientation="vertical" className={classes.divider} />
                            <Grid item xs={2}>
                                <Typography align="center" className={classes.patientEntry}>
                                    {counts.totals[cohort]}
                                </Typography>
                            </Grid>
                            <Divider flexItem orientation="vertical" className={classes.divider} />
                            <Grid item xs={2}>
                                {/* Num cohorts doesn't make any sense here */}
                            </Grid>
                            <Grid item ml="auto" className={classes.button}>
                                {locked ? (
                                    <Button type="submit" variant="contained" disabled sx={{ borderRadius: 1.8 }}>
                                        Request&nbsp;Access
                                    </Button>
                                ) : (
                                    <></>
                                )}
                            </Grid>
                        </Grid>
                    );
                })
            ) : (
                <></>
            )}
        </Box>
    );
}

PatientCountSingle.propTypes = {
    site: PropTypes.string,
    counts: PropTypes.object
};

export default PatientCountSingle;
