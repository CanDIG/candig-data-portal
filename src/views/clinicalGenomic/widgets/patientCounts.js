import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Box, Grid, Typography } from '@mui/material';
import { useSearchResultsReaderContext } from '../SearchResultsContext';
import PatientCountSingle from './patientCountSingle';

const PREFIX = 'PatientCounts';

const Root = styled('div')(({ theme }) => ({
    marginLeft: '0.5em',
    marginRight: '0.5em',
    [`& .${PREFIX}-divider`]: {
        borderColor: theme.palette.primary.main,
        marginTop: 20,
        marginBottom: 4
    },
    [`& .${PREFIX}-header`]: {
        textAlign: 'center'
    },
    [`& .${PREFIX}-spacing`]: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    }
}));

function PatientCounts() {
    const context = useSearchResultsReaderContext();
    const sites = context?.federation;
    const programs = context?.programs;
    const discoveryCounts = context?.counts?.patients_per_cohort;
    const clinicalCounts = context?.clinical;

    // Generate the map of site->cohort->numbers
    let siteData = [];
    if (Array.isArray(sites)) {
        siteData = sites.map((entry) => {
            const counts = discoveryCounts?.[entry.location.name] || {};
            const realCounts = clinicalCounts?.[entry.location.name]?.summary?.patients_per_cohort || {};
            let unlockedPrograms = [];
            // Fill up the programs using the summary counts
            if (Array.isArray(programs)) {
                unlockedPrograms = programs
                    .filter((search) => entry.location.name === search.location.name)?.[0]
                    ?.results?.items?.map((program) => program.program_id);
            }

            const finalCounts = {};
            Object.keys(counts).forEach((program) => {
                finalCounts[program] = program in realCounts ? realCounts[program] : counts[program];
            });

            // Where possible, also use the real counts

            return {
                location: entry.location.name,
                counts: finalCounts,
                totals: entry?.results || {},
                unlockedPrograms
            };
        });
    }

    return (
        <Root>
            {/* Header */}
            <Box sx={{ border: 1, borderRadius: 2, borderColor: 'white' }}>
                <Grid container justifyContent="center" alignItems="center" spacing={2}>
                    <Grid item xs={2}>
                        <Typography variant="h4">Patient Data</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant="h5" className={`${PREFIX}-header`}>
                            Patients In Search
                        </Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant="h5" className={`${PREFIX}-header`}>
                            Total Patients
                        </Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <Typography variant="h5" className={`${PREFIX}-header`}>
                            Total Cohorts
                        </Typography>
                    </Grid>
                    <Grid item xs={1} ml="auto" className={`${PREFIX}-button`}>
                        {/* Just here for spacing */}
                    </Grid>
                </Grid>
            </Box>
            {/* Individual counts */}
            {siteData.map((site) => (
                <React.Fragment key={site.location}>
                    <PatientCountSingle site={site.location} counts={site} />
                    <Box className={`${PREFIX}-spacing`} />
                </React.Fragment>
            ))}
        </Root>
    );
}

export default PatientCounts;
