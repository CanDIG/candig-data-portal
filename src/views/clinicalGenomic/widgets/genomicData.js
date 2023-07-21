import * as React from 'react';

// mui
import { useTheme, makeStyles } from '@mui/styles';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

// REDUX

// project imports
import { useSearchQueryReaderContext, useSearchResultsReaderContext } from '../SearchResultsContext';

// Styles
const useStyles = makeStyles({
    dropdownItem: {
        background: 'white',
        paddingRight: '1.25em',
        paddingLeft: '1.25em',
        border: 'none',
        width: 'fit-content(5em)',
        '&:hover': {
            background: '#2196f3',
            color: 'white'
        }
    },
    mobileRow: {
        width: '800px'
    },
    scrollbar: {
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
            height: '0.4em',
            width: '0.4em'
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 4px rgba(0,0,0,0.00)'
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)'
        }
    }
});

function GenomicData() {
    const theme = useTheme();

    // Mobile
    const [desktopResolution, setdesktopResolution] = React.useState(window.innerWidth > 1200);

    const searchResults = useSearchResultsReaderContext().genomic;
    const query = useSearchQueryReaderContext().genomic;

    // Flatten the search results so that we are filling in the rows
    let rows = [];
    if (searchResults) {
        rows =
            searchResults?.map((patient, index) => {
                // Make sure each row has an ID
                const retVal = { ...patient };
                retVal.id = index;
                retVal.genotypeLabel = patient.genotype.value;
                if (patient.genotype.secondaryAlleleIds) {
                    retVal.genotypeLabel += ` (${patient.genotype.secondaryAlleleIds[0]})`;
                }
                retVal.zygosityLabel = patient.genotype.zygosity?.label || '';
                retVal.location = patient.location.name;

                // TODO: Fix the below with the actual normal ID
                retVal.normalId = patient.biosampleId;
                return retVal;
            }) || [];
    }

    // Tracks Screensize
    React.useEffect(() => {
        window.addEventListener('resize', () => setdesktopResolution(window.innerWidth > 1200));
    }, [desktopResolution, setdesktopResolution]);

    // JSON on bottom now const screenWidth = desktopResolution ? '48%' : '100%';
    const columns = [
        { field: 'location', headerName: 'Node', minWidth: 150 },
        { field: 'donorID', headerName: 'Donor ID', minWidth: 150 },
        { field: 'position', headerName: 'Position', minWidth: 200 },
        { field: 'biosampleId', headerName: 'Normal Specimen ID', minWidth: 200 },
        { field: 'submitter_specimen_id', headerName: 'Tumour Specimen ID', minWidth: 200 },
        { field: 'genotypeLabel', headerName: 'Genotype', minWidth: 300 },
        { field: 'zygosityLabel', headerName: 'Zygosity', minWidth: 200 }
    ];

    const queryParams = query?.gene || `${query?.referenceName}:${query?.start}-${query?.end}`;
    const hasValidQuery = (query?.referenceName && query?.start && query?.end) || query?.gene;

    return (
        <Box mr={2} ml={1} p={1} sx={{ border: 1, borderRadius: 2, boxShadow: 2, borderColor: theme.palette.primary[200] + 75 }}>
            <Typography pb={1} variant="h4">
                {hasValidQuery ? `Genomic Variants: ${queryParams}` : 'Genomic Variants: Please query from the sidebar to populate'}
            </Typography>
            <div style={{ height: 510, width: '100%' }}>
                <DataGrid rows={rows} columns={columns} pageSize={10} rowsPerPageOptions={[10]} hideFooterSelectedRowCount />
            </div>
        </Box>
    );
}

export default GenomicData;
