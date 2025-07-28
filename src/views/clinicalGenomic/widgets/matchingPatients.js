import * as React from 'react';

// mui
import { useTheme } from '@mui/system';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { IconTableShare } from '@tabler/icons-react';
// REDUX

// project imports
import { useSearchQueryWriterContext, useSearchResultsReaderContext, useSearchQueryReaderContext } from '../SearchResultsContext';

function MatchingPatientsView() {
    const theme = useTheme();

    // Mobile
    const [desktopResolution, setdesktopResolution] = React.useState(window.innerWidth > 1200);
    const searchResultsClinical = useSearchResultsReaderContext().clinical;
    const searchResultsGenomic = useSearchResultsReaderContext().genomic;
    const writerContext = useSearchQueryWriterContext();
    const queryReader = useSearchQueryReaderContext();
    const query = useSearchQueryReaderContext().query;

    let rows = [];
    if (searchResultsGenomic) {
        rows =
            searchResultsGenomic
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

    // Function to add location to each patient
    function addLocationToPatients(searchResultsClinical) {
        if (!searchResultsClinical) return;

        Object.keys(searchResultsClinical).forEach((location) => {
            if (searchResultsClinical[location]?.results) {
                searchResultsClinical[location].results.forEach((patient) => {
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
        return patient;
    }

    // Function to process search results
    function processsearchResultsClinical(searchResultsClinical) {
        let rows = [];

        if (searchResultsClinical) {
            addLocationToPatients(searchResultsClinical);

            rows = Object.values(searchResultsClinical)
                .filter((location) => typeof location !== 'undefined')
                .flatMap((locationData) => locationData.results)
                .map((patient, index) => {
                    patient.id = index;
                    patient.deceased = !!patient.date_of_death;
                    return calculateAge({ ...patient });
                });
        }

        return rows;
    }

    rows = [...rows, ...processsearchResultsClinical(searchResultsClinical)];

    const handleRowClick = (row) => {
        const url = `/patientView?patientId=${row.submitter_donor_id}&programId=${row.program_id}&location=${row.location}`;
        window.open(url, '_blank');
    };

    // Tracks Screensize
    React.useEffect(() => {
        window.addEventListener('resize', () => setdesktopResolution(window.innerWidth > 1200));
    }, [desktopResolution, setdesktopResolution]);

    const hasClinicalResults =
        searchResultsClinical && Object.values(searchResultsClinical).some((location) => location?.results?.length > 0);
    const queryParams = query?.gene || query?.chrom;
    const hasValidQuery = (query?.assembly && query?.chrom) || query?.gene;

    // JSON on bottom now const screenWidth = desktopResolution ? '48%' : '100%';
    const clinicalOnlyFields = [
        ['location', 'Location', 75],
        ['program_id', 'Program ID', 150],
        ['sex_at_birth', 'Sex At Birth', 115],
        ['deceased', 'Deceased', 115],
        ['date_of_birth', 'Age at First Diagnosis', 160],
        ['date_of_death', 'Age at Death', 100]
    ];

    const genomicOnlyFields = [
        ['variant_count', 'Estimated Variants', 150],
        ['tumour_normal_designation', 'Tumour/Normal', 125],
        ['submitter_sample_id', 'Sample Registration ID', 175]
    ];

    const columns = [
        {
            field: 'submitter_donor_id',
            headerName: 'Patient ID',
            minWidth: 225,
            flex: 1,
            sortable: false,
            renderCell: (params) => (
                <Tooltip title="Open Patient View" placement="right">
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            '&:hover': {
                                color: theme.palette.primary.main
                            }
                        }}
                    >
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', marginRight: '1em' }}>
                            <IconTableShare stroke={1.5} size="1.3rem" />
                        </Box>
                        <Typography noWrap>{params.value}</Typography>
                    </Box>
                </Tooltip>
            )
        },
        // Include clinical columns if clinical results exist
        ...(hasClinicalResults
            ? clinicalOnlyFields.map(([field, headerName, minWidth]) => ({
                  field,
                  headerName,
                  minWidth,
                  flex: 1,
                  sortable: false,
                  filterable: false
              }))
            : []),
        // Include genomic columns if genomic results exist and query is valid
        ...(searchResultsGenomic?.length > 0 && hasValidQuery
            ? genomicOnlyFields.map(([field, headerName, minWidth]) => ({
                  field,
                  headerName,
                  minWidth,
                  flex: 1,
                  sortable: false,
                  filterable: false
              }))
            : [])
    ];

    const HandlePageChange = (newModel) => {
        if (newModel.page !== queryReader.query?.page) {
            writerContext((old) => ({
                ...old,
                query: { ...old.query, page: newModel.page, page_size: newModel.pageSize },
                reqNum: old.reqNum + 1
            }));
        }
    };

    const totalRows = searchResultsClinical
        ? Object.values(searchResultsClinical)
              ?.filter((location) => typeof location !== 'undefined')
              ?.map((site) => site.count)
              .reduce((partial, a) => partial + a, 0)
        : 0;

    const paginationModel = {
        page: queryReader.query?.page || 0,
        pageSize: queryReader.query?.pageSize || 10
    };

    const headingText = 'Matching Patients:';
    let headingTextResults = '';

    if ((!searchResultsGenomic || searchResultsGenomic.length === 0) && (!hasClinicalResults || totalRows === 0)) {
        headingTextResults = ' No matching patients found. Try adjusting your filters.';
    } else if (!hasValidQuery) {
        headingTextResults = ' Genomic results require a query for gene or position';
    } else {
        headingTextResults = ` Genomic results for ${queryParams || ''}`;
    }

    return (
        <Box mr={1} ml={1} p={1} sx={{ border: 1, borderRadius: 2, boxShadow: 2, borderColor: theme.palette.primary[200] + 75 }}>
            <Box display="flex" alignItems="center" gap={2} pb={1}>
                <Typography variant="h4">{headingText}</Typography>
                <Typography variant="subtitle1">{headingTextResults}</Typography>
            </Box>
            <div style={{ height: 680, width: '100%' }}>
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

export default MatchingPatientsView;
