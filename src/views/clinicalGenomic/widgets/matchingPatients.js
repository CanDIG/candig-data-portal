import * as React from 'react';

// mui
import { useTheme } from '@mui/system';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { IconTableShare } from '@tabler/icons-react';

// project imports
import { useSearchQueryWriterContext, useSearchResultsReaderContext, useSearchQueryReaderContext } from '../SearchResultsContext';

function MatchingPatientsView() {
    const theme = useTheme();
    const [desktopResolution, setdesktopResolution] = React.useState(window.innerWidth > 1200);

    const searchResultsClinical = useSearchResultsReaderContext().clinical;
    const searchResultsGenomic = useSearchResultsReaderContext().genomic;
    const writerContext = useSearchQueryWriterContext();
    const queryReader = useSearchQueryReaderContext();
    const query = React.useMemo(() => queryReader.query || {}, [queryReader.query]);

    // Helpers: location, calculate age
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

    function calculateAge(patient) {
        if (patient?.date_resolution === 'month') {
            if (patient?.date_of_birth?.month_interval && patient?.date_of_death?.month_interval) {
                const ageInMonths = patient.date_of_death.month_interval - patient.date_of_birth.month_interval;
                patient.date_of_death = Math.floor(ageInMonths / 12);
                patient.date_of_birth = Math.floor(-patient.date_of_birth.month_interval / 12);
            } else if (patient?.date_of_birth?.month_interval) {
                patient.date_of_birth = Math.floor(-patient.date_of_birth.month_interval / 12);
                delete patient.date_of_death;
            } else {
                delete patient.date_of_birth;
                delete patient.date_of_death;
            }
        } else if (patient?.date_resolution === 'day') {
            if (patient?.date_of_death?.day_interval && patient?.date_of_birth?.day_interval) {
                const ageInDays = patient.date_of_death.day_interval - patient.date_of_birth.day_interval;
                patient.date_of_death = Math.floor(ageInDays / 365);
                patient.date_of_birth = Math.floor(-patient.date_of_birth.day_interval / 365);
            } else if (patient?.date_of_birth?.day_interval) {
                patient.date_of_birth = Math.floor(-patient.date_of_birth.day_interval / 365);
                delete patient.date_of_death;
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

    // Process genomic data
    let genomicRows = [];
    if (searchResultsGenomic) {
        genomicRows = searchResultsGenomic
            .filter((patient) => patient && patient.donor_id)
            .map((patient) => ({
                ...patient,
                submitter_donor_id: patient.donor_id,
                location: patient.location?.name,
                genomes: (patient.genomes || []).join(', '),
                transcriptomes: (patient.transcriptomes || []).join(', '),
                reads: (patient.reads || []).join(', '),
                variants: (patient.variants || []).join(', ')
            }));
    }

    // Process clinical data
    let clinicalRows = [];
    if (searchResultsClinical) {
        addLocationToPatients(searchResultsClinical);

        clinicalRows = Object.values(searchResultsClinical)
            .flatMap((locationData) => locationData.results || [])
            .filter((p) => p && p.submitter_donor_id)
            .map((patient) => {
                patient.deceased = !!patient.date_of_death;
                return calculateAge({ ...patient });
            });
    }

    // Merge clinical into genomic (keeping multiple genomic rows per donor_id + submitter_sample_id)
    let mergedRows = [];

    if (genomicRows.length > 0) {
        mergedRows = genomicRows.map((g) => {
            const matchingClinical = clinicalRows.find((c) => c.submitter_donor_id === g.submitter_donor_id);
            return {
                ...matchingClinical,
                ...g
            };
        });
    } else {
        // If no genomic data, just use clinical rows
        mergedRows = clinicalRows;
    }

    const rows = mergedRows;

    // Patient Info Page click handler
    const handleRowClick = (row) => {
        if (!row?.submitter_donor_id) {
            console.warn('Row data not loaded yet:', row);
            return;
        }
        const url = `/patientView?patientId=${row.submitter_donor_id}&programId=${row.program_id}&location=${row.location}&submitterSampleId=${row.submitter_sample_id}&tumourNormalDesignation=${row.tumour_normal_designation}&variantCount=${row.variant_count}`;
        // TODO: Disabled until we have the patient view up and running
        // window.open(url, '_blank');
    };

    // Responsive
    React.useEffect(() => {
        window.addEventListener('resize', () => setdesktopResolution(window.innerWidth > 1200));
    }, [desktopResolution]);

    const hasClinicalResults = React.useMemo(
        () => searchResultsClinical && Object.values(searchResultsClinical).some((location) => location?.results?.length > 0),
        [searchResultsClinical]
    );
    const hasValidQuery = (query?.assembly && query?.chrom) || query?.gene || query?.genomic_data_types?.length > 0;

    // Column definitions
    const clinicalFields = [
        ['location', 'Location', 75],
        ['program_id', 'Dataset ID', 150],
        ['sex_at_birth', 'Sex At Birth', 115],
        ['deceased', 'Deceased', 115],
        ['age_at_diagnosis', 'Age at First Diagnosis', 160]
        // ['date_of_death', 'Age at Death', 100]
        // ['num_exposures', 'Number of exposures', 160],
        // ['num_interventions', 'Number of interventions', 160],
        // ['num_measures', 'Number of measures', 160],
        // ['num_treatments', 'Number of treatments', 160]
    ];

    const genomicFields = [
        ['variant_count', 'Estimated Variants', 150],
        ['tumour_normal_designation', 'Tumour/Normal', 125],
        ['submitter_sample_id', 'Sample Registration ID', 175],
        ['genomes', 'Genomes', 250],
        ['variants', 'Variants', 250],
        ['transcriptomes', 'Transcriptomes', 250],
        ['reads', 'Reads', 250]
    ];

    const hasGenomicData = rows.some(
        (row) =>
            row.variant_count != null || row.tumour_normal_designation != null || row.submitter_sample_id != null || row.genomes?.length > 0
    );

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
        ...clinicalFields.map(([field, headerName, minWidth]) => ({
            field,
            headerName,
            minWidth,
            flex: 1,
            sortable: false,
            filterable: false
        })),
        ...(hasGenomicData
            ? genomicFields.map(([field, headerName, minWidth]) => ({
                  field,
                  headerName,
                  minWidth,
                  flex: 1,
                  sortable: false,
                  filterable: false
              }))
            : [])
    ];

    // Pagination
    const HandlePageChange = (newModel) => {
        if (newModel.page !== query.page) {
            writerContext((old) => ({
                ...old,
                query: { ...old.query, page: newModel.page, page_size: newModel.pageSize },
                reqNum: old.reqNum + 1
            }));
        }
    };

    const paginationModel = {
        page: query.page || 0,
        pageSize: query.pageSize || 10
    };

    // Heading
    const headingText = 'Matching Patients:';
    let headingTextResults = '';

    if (!searchResultsGenomic && !hasClinicalResults) {
        headingTextResults = 'No matching patients found. Try adjusting your filters.';
    } else if (!hasValidQuery) {
        // headingTextResults = 'Showing Clinical matches only. Genomic results require a query for gene, position, or genomic data type';
    } else {
        headingTextResults = `Clinical results`;
    }

    const totalRows = searchResultsClinical
        ? Object.values(searchResultsClinical)
              ?.filter((location) => typeof location !== 'undefined')
              ?.map((site) => site.count)
              .reduce((partial, a) => partial + a, 0)
        : 0;

    return (
        <Box
            mr={1}
            ml={1}
            p={1}
            sx={{
                border: 1,
                borderRadius: 2,
                boxShadow: 2,
                borderColor: theme.palette.primary[200] + 75
            }}
        >
            <Box display="flex" alignItems="center" gap={1} pb={1}>
                <Typography variant="h4">{headingText}</Typography>
                <Typography variant="subtitle1">{headingTextResults}</Typography>
            </Box>
            <div style={{ height: 680, width: '100%' }}>
                <DataGrid
                    getRowId={(row) => `${row.submitter_donor_id}_${row.submitter_sample_id || ''}`}
                    key={rows.length}
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
