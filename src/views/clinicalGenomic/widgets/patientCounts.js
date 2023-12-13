import * as React from 'react';
import { makeStyles } from '@mui/styles';

import { Box, Grid, Typography } from '@mui/material';

import { useSearchResultsReaderContext, useSearchQueryReaderContext } from '../SearchResultsContext';
import PatientCountSingle from './patientCountSingle';

const useStyles = makeStyles((theme) => ({
    divider: {
        borderColor: theme.palette.primary.main,
        marginTop: 20,
        marginBottom: 4
    }
}));

function PatientCounts() {
    const classes = useStyles();
    const context = useSearchResultsReaderContext();
    const sites = context?.federation;
    const searchResults = context?.clinical;
    const filters = useSearchQueryReaderContext()?.filter;
    const programs = context?.programs;

    // Generate the map of site->cohort->numbers
    // First, we need to match each site within federation with the site within clinical
    let siteData = [];
    if (Array.isArray(sites)) {
        siteData = sites.map((entry) => {
            // Find this site within our search results
            const counts = {};
            if (searchResults && entry.location.name in searchResults) {
                // Has this node been excluded from the results?
                if (!(filters && filters?.node?.includes(entry.location.name))) {
                    console.log(entry);
                    console.log(searchResults);
                    const match = searchResults[entry.location.name];
                    // Iterate through each donor in this site
                    match.forEach((donor) => {
                        if (filters && filters?.program_id?.includes(donor.program_id)) {
                            // Exclude based on cohort
                            return;
                        }

                        if (donor.program_id in counts) {
                            counts[donor.program_id] += 1;
                        } else {
                            counts[donor.program_id] = 1;
                        }
                    });
                }
            }

            let unlockedPrograms = [];
            if (Array.isArray(programs)) {
                unlockedPrograms = programs
                    .filter((search) => entry.location.name === search.location.name)?.[0]
                    ?.results?.results?.map((program) => program.program_id);
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
        <>
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
        </>
    );
}

export default PatientCounts;
