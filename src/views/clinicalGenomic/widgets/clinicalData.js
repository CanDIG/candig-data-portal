import * as React from 'react';

// mui
import { useTheme } from '@mui/styles';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

// REDUX

// project imports
import { useSearchQueryWriterContext, useSearchResultsReaderContext } from '../SearchResultsContext';

function ClinicalView() {
    const theme = useTheme();
    const [paginationModel, setPaginationModel] = React.useState({
        pageSize: 25,
        page: 0
    });

    // Mobile
    const [desktopResolution, setdesktopResolution] = React.useState(window.innerWidth > 1200);
    const searchResults = useSearchResultsReaderContext().clinical;
    const writerContext = useSearchQueryWriterContext();

    // Flatten the search results so that we are filling in the rows
    let rows = [];
    if (searchResults) {
        rows =
            Object.values(searchResults)
                ?.map((results) => results.results)
                ?.flat(1)
                ?.map((patient, index) => {
                    // Make sure each row has an ID and a deceased status
                    patient.id = index;
                    patient.deceased = !!patient.date_of_death;

                    return patient;
                }) || [];
    }

    const handleRowClick = (row) => {
        console.log(row);
        const url = `/patientView?patientId=${row.submitter_donor_id}&programId=${row.program_id}`;
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

    const HandlePageChange = (newPage) => {
        if (newPage !== paginationModel.page) {
            writerContext((old) => ({ ...old, query: { ...old.query, page: newPage } }));
        }
        setPaginationModel({
            pageSize: 10,
            page: newPage
        });
    };

    const totalRows = searchResults
        ? Object.values(searchResults)
              ?.map((site) => site.count)
              .reduce((partial, a) => partial + a, 0)
        : 0;

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
                    rowCount={totalRows}
                    rowsPerPageOptions={[10]}
                    onRowClick={(rowData) => handleRowClick(rowData.row)}
                    paginationModel={paginationModel}
                    onPageChange={HandlePageChange}
                    paginationMode="server"
                    hideFooterSelectedRowCount
                />
            </div>
        </Box>
    );
}

export default ClinicalView;
