import * as React from 'react';

// mui
import { useTheme } from '@mui/system';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';

// REDUX

// project imports
import { useSearchQueryWriterContext, useSearchResultsReaderContext, useSearchQueryReaderContext } from '../SearchResultsContext';

function ClinicalView() {
    const theme = useTheme();

    // Mobile
    const [desktopResolution, setdesktopResolution] = React.useState(window.innerWidth > 1200);
    const searchResults = useSearchResultsReaderContext().clinical;
    const writerContext = useSearchQueryWriterContext();
    const queryReader = useSearchQueryReaderContext();

    // Function to add location to each patient
    function addLocationToPatients(searchResults) {
        if (!searchResults) return;

        Object.keys(searchResults).forEach((location) => {
            if (searchResults[location]?.results) {
                searchResults[location].results.forEach((patient) => {
                    patient.location = location;
                });
            }
        });
    }

    // Function to calculate age based on intervals
    function calculateAge(patient) {
        if (patient?.date_resolution === 'month') {
            if (patient?.date_of_birth?.month_interval && patient?.date_of_death?.month_interval) {
                const ageInMonths = patient.date_of_death.month_interval - patient.date_of_birth.month_interval;
                patient.date_of_death = Math.floor(ageInMonths / 12);
                patient.date_of_birth = Math.floor(-patient.date_of_birth.month_interval / 12);
            } else if (patient?.date_of_birth?.month_interval && !patient?.date_of_death?.month_interval) {
                patient.date_of_birth = Math.floor(-patient.date_of_birth.month_interval / 12);
            } else {
                delete patient.date_of_birth;
                delete patient.date_of_death;
            }
        } else if (patient?.date_resolution === 'day') {
            if (patient?.date_of_death?.day_interval && patient?.date_of_birth?.day_interval) {
                const ageInDays = patient.date_of_death.day_interval - patient.date_of_birth.day_interval;
                patient.date_of_death = Math.floor(ageInDays / 365);
                patient.date_of_birth = Math.floor(-patient.date_of_birth.day_interval / 365);
            } else if (patient?.date_of_birth?.day_interval && !patient?.date_of_death?.day_interval) {
                patient.date_of_birth = Math.floor(-patient.date_of_birth.day_interval / 365);
            } else {
                delete patient.date_of_birth;
                delete patient.date_of_death;
            }
        } else {
            delete patient.date_of_birth;
            delete patient.date_of_death;
        }
    }

    // Function to process search results
    function processSearchResults(searchResults) {
        let rows = [];

        if (searchResults) {
            addLocationToPatients(searchResults);

            rows = Object.values(searchResults)
                .flatMap((locationData) => locationData.results)
                .map((patient, index) => {
                    patient.id = index;
                    patient.deceased = !!patient.date_of_death;
                    calculateAge(patient);
                    return patient;
                });
        }

        return rows;
    }

    const rows = processSearchResults(searchResults);

    const handleRowClick = (row) => {
        const url = `/patientView?patientId=${row.submitter_donor_id}&programId=${row.program_id}&location=${row.location}`;
        window.open(url, '_blank');
    };

    // Tracks Screensize
    React.useEffect(() => {
        window.addEventListener('resize', () => setdesktopResolution(window.innerWidth > 1200));
    }, [desktopResolution, setdesktopResolution]);

    // JSON on bottom now const screenWidth = desktopResolution ? '48%' : '100%';
    const columns = [
        { field: 'submitter_donor_id', headerName: 'Donor ID', minWidth: 220, sortable: false },
        { field: 'location', headerName: 'Location', minWidth: 220, sortable: false },
        { field: 'program_id', headerName: 'Program ID', minWidth: 220, sortable: false },
        { field: 'sex_at_birth', headerName: 'Sex At Birth', minWidth: 170, sortable: false },
        { field: 'deceased', headerName: 'Deceased', minWidth: 170, sortable: false },
        { field: 'date_of_birth', headerName: 'Age at First Diagnosis', minWidth: 200, sortable: false },
        { field: 'date_of_death', headerName: 'Age at Death', minWidth: 220, sortable: false }
    ];

    const HandlePageChange = (newModel) => {
        if (newModel.page !== queryReader.query?.page) {
            writerContext((old) => ({ ...old, query: { ...old.query, page: newModel.page, page_size: newModel.pageSize } }));
        }
    };

    const totalRows = searchResults
        ? Object.values(searchResults)
              ?.map((site) => site.count)
              .reduce((partial, a) => partial + a, 0)
        : 0;

    const paginationModel = {
        page: queryReader.query?.page || 0,
        pageSize: queryReader.query?.pageSize || 10
    };

    return (
        <Box mr={2} ml={1} p={1} sx={{ border: 1, borderRadius: 2, boxShadow: 2, borderColor: theme.palette.primary[200] + 75 }}>
            <Typography pb={1} variant="h4">
                Clinical Data
            </Typography>
            <div style={{ height: 510, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    rowCount={totalRows}
                    pageSizeOptions={[10]}
                    onRowClick={(rowData) => handleRowClick(rowData.row)}
                    paginationModel={paginationModel}
                    onPaginationModelChange={HandlePageChange}
                    paginationMode="server"
                    hideFooterSelectedRowCount
                />
            </div>
        </Box>
    );
}

export default ClinicalView;
