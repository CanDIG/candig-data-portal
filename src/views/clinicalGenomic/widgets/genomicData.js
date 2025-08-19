import * as React from 'react';

// mui
import { useTheme } from '@mui/system';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

// REDUX

// project imports
import { useSearchQueryReaderContext, useSearchResultsReaderContext } from '../SearchResultsContext';
import config from 'config';

function GenomicData() {
    const theme = useTheme();

    // Mobile
    const [desktopResolution, setdesktopResolution] = React.useState(window.innerWidth > 1200);

    const searchResults = useSearchResultsReaderContext().genomic;
    const countsResults = useSearchResultsReaderContext().counts;
    const query = useSearchQueryReaderContext().query;

    const hasResults = countsResults?.patients_per_program && Object.values(countsResults?.patients_per_program).some((val) => val > 0);

    // Flatten the search results so that we are filling in the rows
    let rows = [];
    if (searchResults) {
        rows =
            searchResults
                ?.map((patient, index) => {
                    // Filter out undefined
                    if (!patient) {
                        return undefined;
                    }
                    // Make sure each row has an ID
                    const retVal = { ...patient };
                    retVal.id = index;
                    // retVal.genotypeLabel = patient.genotype.value;
                    // if (patient.genotype.secondaryAlleleIds) {
                    //     retVal.genotypeLabel += ` (${patient.genotype.secondaryAlleleIds[0]})`;
                    // }
                    // retVal.zygosityLabel = patient.genotype.zygosity?.label || '';
                    retVal.location = patient.location.name;

                    // TODO: Fix the below with the actual normal ID
                    retVal.normalId = patient.biosampleId;
                    return retVal;
                })
                ?.filter((patient) => typeof patient !== 'undefined') || [];
    }

    // Tracks Screensize
    React.useEffect(() => {
        window.addEventListener('resize', () => setdesktopResolution(window.innerWidth > 1200));
    }, [desktopResolution, setdesktopResolution]);

    // JSON on bottom now const screenWidth = desktopResolution ? '48%' : '100%';
    const columns = [
        { field: 'donor_id', headerName: 'Donor ID', minWidth: 220, flex: 1, sortable: false, filterable: false },
        { field: 'location', headerName: 'Location', minWidth: 150, flex: 1, sortable: false, filterable: false },
        { field: 'program_id', headerName: 'Program ID', minWidth: 170, flex: 1, sortable: false, filterable: false },
        { field: 'variant_count', headerName: 'Estimated Variants', minWidth: 150, flex: 1, sortable: false, filterable: false },
        { field: 'tumour_normal_designation', headerName: 'Tumour/Normal', minWidth: 200, flex: 1, sortable: false, filterable: false },
        { field: 'submitter_sample_id', headerName: 'Sample Registration ID', minWidth: 300, flex: 1, sortable: false, filterable: false }
    ];

    const queryParams = query?.gene || query?.chrom;
    const hasValidQuery = (query?.assembly && query?.chrom) || query?.gene;

    let message = '';
    if (!hasValidQuery) {
        message = 'Perform a gene or coordinate search to view genomic variant data.';
    } else if (hasResults) {
        message = 'You do not have authorization to view Donor-level genomic data results from your search.';
    } else {
        message = 'No results';
    }
    // Were there any results at all?
    const noRowsOverlay = () => (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{message}</div>
    );

    return (
        <Box mr={1} ml={1} p={1} sx={{ border: 1, borderRadius: 2, boxShadow: 2, borderColor: theme.palette.primary[200] + 75 }}>
            <Typography pb={1} sx={{ color: config.isDHDP ? theme.palette.primary.main : 'black' }} variant="h4">
                {hasValidQuery ? `Genomic Variants: ${queryParams}` : 'Genomic Variants: Please query from the sidebar to populate'}
            </Typography>
            <div style={{ height: 510, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    hideFooterSelectedRowCount
                    slots={{
                        noRowsOverlay
                    }}
                />
            </div>
        </Box>
    );
}

export default GenomicData;
