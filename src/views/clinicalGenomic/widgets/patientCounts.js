import * as React from 'react';
import { makeStyles } from '@mui/styles';

import { Box, Grid, Typography } from '@mui/material';

import { useSearchResultsReaderContext } from '../SearchResultsContext';
import PatientCountSingle from './patientCountSingle';

const useStyles = makeStyles((theme) => ({
    header: {
        // Unknown what we want in here
    },
    divider: {
        borderColor: theme.palette.primary.main,
        marginTop: 20,
        marginBottom: 4
    }
}));

function PatientCounts(props) {
    const classes = useStyles();
    const context = useSearchResultsReaderContext();
    const sites = context?.federation;
    const searchResults = context?.clinical;

    // Generate the map of site->cohort->numbers
    // First, we need to match each site within federation with the site within clinical
    let siteData = [];
    if (Array.isArray(sites)) {
        siteData = sites.map((entry) => {
            // Find this site within our search results
            const counts = {};
            if (Array.isArray(searchResults)) {
                const match = searchResults.find((search) => entry.location.name === search.location.name);
                // Iterate through each donor in this site
                match?.results?.results?.forEach((donor) => {
                    if (donor.program_id in counts) {
                        counts[donor.program_id] += 1;
                    } else {
                        counts[donor.program_id] = 1;
                    }
                });
            }

            // Return the data that PatientCountSingle needs
            return {
                location: entry.location.name,
                counts,
                totals: entry?.results || {}
            };
        });
    }

    return (
        <>
            {/* Header */}
            <Box mr={2} ml={1} pr={5} sx={{ border: 1, borderRadius: 2, borderColor: 'white' }}>
                <Grid container justifyContent="center" alignItems="center" spacing={2}>
                    <Grid item xs={2}>
                        <Typography variant="h4" className={classes.header}>
                            Patient Data
                        </Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant="h5" align="center" className={classes.header}>
                            Total Patients
                        </Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant="h5" align="center" className={classes.header}>
                            Patients In Search
                        </Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant="h5" align="center" className={classes.header}>
                            Cohorts
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
