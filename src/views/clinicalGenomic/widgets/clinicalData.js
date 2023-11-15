import * as React from 'react';

// mui
import { useTheme, makeStyles } from '@mui/styles';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

// REDUX

// project imports
import { useSearchQueryWriterContext, useSearchResultsReaderContext } from '../SearchResultsContext';

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

function ClinicalView() {
    const theme = useTheme();

    // Mobile
    const [desktopResolution, setdesktopResolution] = React.useState(window.innerWidth > 1200);

    const resultsContext = useSearchResultsReaderContext();
    const searchResults = useSearchResultsReaderContext().clinical;
    const writerContext = useSearchQueryWriterContext();

    // Flatten the search results so that we are filling in the rows
    let rows = [];
    if (searchResults) {
        rows =
            Object.values(searchResults)
                ?.flat(1)
                ?.map((patient, index) => {
                    // Make sure each row has an ID and a deceased status
                    patient.id = index;
                    patient.deceased = !!patient.date_of_death;

                    return patient;
                }) || [];
    }

    const handleRowClick = (row) => {
        const url = `/patientView?patientId=${row.submitter_donor_id}`;
        window.open(url, '_blank');
    };

    // Tracks Screensize
    React.useEffect(() => {
        window.addEventListener('resize', () => setdesktopResolution(window.innerWidth > 1200));
    }, [desktopResolution, setdesktopResolution]);

    // JSON on bottom now const screenWidth = desktopResolution ? '48%' : '100%';
    const columns = [
        { field: 'submitter_donor_id', headerName: 'Donor ID', minWidth: 220, sortable: false },
        { field: 'sex_at_birth', headerName: 'Sex At Birth', minWidth: 170, sortable: false },
        { field: 'deceased', headerName: 'Deceased', minWidth: 170, sortable: false },
        { field: 'date_of_birth', headerName: 'Date of Birth', minWidth: 200, sortable: false },
        { field: 'date_of_death', headerName: 'Date of Death', minWidth: 220, sortable: false }
    ];

    return (
        <Box mr={2} ml={1} p={1} sx={{ border: 1, borderRadius: 2, boxShadow: 2, borderColor: theme.palette.primary[200] + 75 }}>
            <Typography pb={1} variant="h4">
                Clinical Data
            </Typography>
            <div style={{ height: 510, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    onRowClick={(rowData) => handleRowClick(rowData.row)}
                    hideFooterSelectedRowCount
                />
            </div>
        </Box>
    );
}

export default ClinicalView;
