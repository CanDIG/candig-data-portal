import * as React from 'react';
import { styled } from '@mui/material/styles';

import { Box, Grid, Typography } from '@mui/material';

import { useSearchResultsReaderContext } from '../SearchResultsContext';
import PatientCountSingle from './patientCountSingle';

const PREFIX = 'PatientCounts';

const classes = {
    divider: `${PREFIX}-divider`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
    [`& .${classes.divider}`]: {
        borderColor: theme.palette.primary.main,
        marginTop: 20,
        marginBottom: 4
    }
}));

function PatientCounts() {
    const context = useSearchResultsReaderContext();
    const sites = context?.federation;
    const programs = context?.programs;

    // Generate the map of site->cohort->numbers
    // First, we need to match each site within federation with the site within clinical
    let siteData = [];
    if (Array.isArray(sites)) {
        siteData = sites.map((entry) => {
            const counts = context?.counts?.patients_per_cohort?.[entry.location.name] || {};

            let unlockedPrograms = [];
            if (Array.isArray(programs)) {
                unlockedPrograms = programs
                    .filter((search) => entry.location.name === search.location.name)?.[0]
                    ?.results?.items?.map((program) => program.program_id);
            }

            // Return the data that PatientCountSingle needs
            return {
                location: entry.location.name,
                counts,
                totals: entry?.results || {},
                unlockedPrograms
            };
        });
    }

    return (
        <Root>
            {/* Header */}
            <Box mr={2} ml={1} pr={5} sx={{ border: 1, borderRadius: 2, borderColor: 'white' }}>
                <Grid container justifyContent="center" alignItems="center" spacing={2}>
                    <Grid item xs={2}>
                        <Typography variant="h4">Patient Data</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant="h5" align="center" className={classes.header}>
                            Patients In Search
                        </Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant="h5" align="center" className={classes.header}>
                            Total Patients
                        </Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant="h5" align="center" className={classes.header}>
                            Total Cohorts
                        </Typography>
                    </Grid>
                    <Grid item xs={1} ml="auto" className={classes.button}>
                        {/* Just here for spacing */}
                    </Grid>
                </Grid>
            </Box>
            {/* Individual counts */}
            {siteData.map((site) => (
                <React.Fragment key={site.location}>
                    <PatientCountSingle site={site.location} counts={site} />
                    <br />
                </React.Fragment>
            ))}
        </Root>
    );
}

export default PatientCounts;
