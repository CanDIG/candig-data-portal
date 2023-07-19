import * as React from 'react';

// npm installs
import ReactJson from 'react-json-view';
import cancerTypeCSV from '../../../assets/data_files/cancer_histological_codes_labels.csv';
import papa from 'papaparse';

// mui
import { useTheme, makeStyles } from '@mui/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box } from '@mui/material';

// REDUX

// project imports
import MainCard from 'ui-component/cards/MainCard';
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
    const classes = useStyles();
    const [isLoading, setIsLoading] = React.useState(true);
    const [pageNum, setPageNum] = React.useState(true);

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
                return retVal;
            }) || [];
    }

    const jsonTheme = {
        base00: 'white',
        base01: '#ddd',
        base02: '#ddd',
        base03: 'black',
        base04: '#0E3E17',
        base05: 'black',
        base06: 'black',
        base07: '#252525',
        base08: '#252525',
        base09: '#00418A',
        base0A: '#00418A',
        base0B: '#00418A',
        base0C: '#00418A',
        base0D: '#00418A',
        base0E: '#00418A',
        base0F: '#00418A'
    };

    // Tracks Screensize
    React.useEffect(() => {
        window.addEventListener('resize', () => setdesktopResolution(window.innerWidth > 1200));
    }, [desktopResolution, setdesktopResolution]);

    // JSON on bottom now const screenWidth = desktopResolution ? '48%' : '100%';
    const columns = [
        { field: 'location', headerName: 'Node', minWidth: 200 },
        { field: 'position', headerName: 'Position', minWidth: 200 },
        { field: 'biosampleId', headerName: 'Normal Specimen ID', minWidth: 220 },
        { field: 'biosampleId', headerName: 'Tumour Specimen ID', minWidth: 220 },
        { field: 'genotypeLabel', headerName: 'Genotype', minWidth: 300 },
        { field: 'zygosityLabel', headerName: 'Zygosity', minWidth: 200 }
    ];

    const queryParams = query?.gene || `${query?.chromosome}:${query?.start}-${query?.end}`;
    const hasValidQuery = (query?.referenceName && query?.start && query?.end) || query?.gene;

    return (
        <Box mr={2} ml={1} p={1} pr={5} sx={{ border: 1, borderRadius: 2, boxShadow: 2, borderColor: theme.palette.primary[200] + 75 }}>
            <h2> {hasValidQuery ? `Genomic Data: ${queryParams}` : 'Genomic Data: Please query from the sidebar to populate.'} </h2>
            <div style={{ height: 510, width: '100%' }}>
                <DataGrid rows={rows} columns={columns} pageSize={10} rowsPerPageOptions={[10]} hideFooterSelectedRowCount />
            </div>
        </Box>
    );
}

export default GenomicData;
