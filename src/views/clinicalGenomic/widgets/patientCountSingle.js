import { useState } from 'react';

import { Avatar, Box, Button, CardHeader, Divider, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/system';
import { styled } from '@mui/material/styles';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import PropTypes from 'prop-types';

const PREFIX = 'PatientCountSingle';

const classes = {
    patientEntry: `${PREFIX}-patientEntry`,
    container: `${PREFIX}-container`,
    siteName: `${PREFIX}-siteName`,
    locked: `${PREFIX}-locked`,
    button: `${PREFIX}-button`,
    divider: `${PREFIX}-divider`
};

const StyledBox = styled(Box)(({ theme }) => ({
    [`& .${classes.patientEntry}`]: {
        // React center span?
    },

    [`& .${classes.container}`]: {
        height: 80
    },

    [`& .${classes.siteName}`]: {
        // Left-aligned
        width: 120
    },

    [`& .${classes.locked}`]: {
        backgroundColor: theme.palette.action.disabledBackground
    },

    [`& .${classes.button}`]: {
        // Right-aligned
        float: 'right',
        marginLeft: 'auto'
    },

    [`& .${classes.divider}`]: {
        borderColor: theme.palette.primary.main,
        marginTop: 20,
        marginBottom: 4
    }
}));

function PatientCountSingle(props) {
    const { site, counts } = props;
    const theme = useTheme();

    const [expanded, setExpanded] = useState(false);

    // Sum together an array of either numbers, or objects with patients_count in them
    const SumCensoredTotals = (countsArray) =>
        countsArray.reduce(
            (partialSum, cohortTotal) => {
                if (typeof cohortTotal === 'object') {
                    // New notation
                    if (cohortTotal.patients_count.startsWith('<')) {
                        return [partialSum[0], partialSum[1] + parseInt(cohortTotal.patients_count.substr(1), 10)];
                    }
                    return partialSum + parseInt(cohortTotal.patients_count, 10);
                }
                return [partialSum[0] + cohortTotal, partialSum[1] + cohortTotal];
            },
            [0, 0]
        );

    const PrintCensoredCounts = (totals) => (totals[0] === totals[1] ? totals[0] : `${totals[0]}-${totals[1]}`);

    const totalPatients = SumCensoredTotals(Object.values(counts.totals)) || [0, 0];
    const patientsInSearch = SumCensoredTotals(Object.values(counts.counts)) || [0, 0];
    const numCohorts = Object.values(counts.totals)?.length || 0;

    /* const avatarProps = locked
        ? {
              // If we're locked out, gray out the avatar
              sx: { bgcolor: theme.palette.action.disabled }
          }
        : {}; */

    return (
        <StyledBox pr={2} sx={{ border: 1, borderRadius: 2, boxShadow: 2, borderColor: 'primary.main' }}>
            <Grid container justifyContent="center" alignItems="center" spacing={2} className={classes.container}>
                <Grid item xs={2}>
                    <CardHeader avatar={<Avatar>{site.slice(0, 1).toUpperCase()}</Avatar>} title={<b>{site}</b>} />
                </Grid>
                <Divider flexItem orientation="vertical" className={classes.divider} />
                <Grid item xs={2}>
                    <Typography align="center" className={classes.patientEntry}>
                        {PrintCensoredCounts(patientsInSearch)}
                    </Typography>
                </Grid>
                <Divider flexItem orientation="vertical" className={classes.divider} />
                <Grid item xs={2}>
                    <Typography align="center" className={classes.patientEntry}>
                        {PrintCensoredCounts(totalPatients)}
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
                    ) : null}
                </Grid>
            </Grid>

            {expanded
                ? counts.totals.map((cohort) => {
                      const locked = !counts.unlockedPrograms?.some((programID) => programID === cohort.program_id);
                      return (
                          <Grid
                              container
                              justifyContent="center"
                              alignItems="center"
                              spacing={2}
                              key={cohort.program_id}
                              className={classes.container}
                          >
                              <Grid item xs={2}>
                                  <Typography variant="h5" align="center" className={classes.patientEntry}>
                                      <b>{cohort.program_id}</b>
                                  </Typography>
                              </Grid>
                              <Divider flexItem orientation="vertical" className={classes.divider} />
                              <Grid item xs={2}>
                                  <Typography align="center" className={classes.patientEntry}>
                                      {counts.counts?.[cohort.program_id] || 0}
                                  </Typography>
                              </Grid>
                              <Divider flexItem orientation="vertical" className={classes.divider} />
                              <Grid item xs={2}>
                                  <Typography align="center" className={classes.patientEntry}>
                                      {cohort.patients_count || 0}
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
                                  ) : null}
                              </Grid>
                          </Grid>
                      );
                  })
                : null}
        </StyledBox>
    );
}

PatientCountSingle.propTypes = {
    site: PropTypes.string,
    counts: PropTypes.object
};

export default PatientCountSingle;
