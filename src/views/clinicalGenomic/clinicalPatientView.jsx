import { useState, useEffect } from 'react';
import { styled } from '@mui/system';
import { Box, Button, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Alert from '@mui/material/Alert';
import { useSelector, useDispatch } from 'react-redux';
import { IconPlayerPlay } from '@tabler/icons-react';

import MainCard from '../../ui-component/cards/MainCard';
import useClinicalPatientData from './useClinicalPatientData';
import { formatKey, handleTableSet } from '../../utils/utils';
import Timeline from './widgets/timeline';
import { query } from '../../store/api';
import DefaultErrorBoundary from '../../ui-component/DefaultErrorBoundary';
import { SET_MENU } from '../../store/actions';
import { useTour } from '../../ui-component/tour/TourContext';
import patientTourSteps from '../../ui-component/tour/patientTourSteps';
import waitForElement from '../../ui-component/tour/waitForElement';

// Only auto-start the patient-page tour the first time (per browser).
const PATIENT_TOUR_SEEN_KEY = 'candig_patient_tour_seen';

const StyledTopLevelBox = styled(Box)(({ theme }) => ({
    border: `1px solid ${theme.palette.primary.main}`,
    marginBottom: '1em',
    padding: '1em',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '1em'
}));

const TimelineContainer = styled(Box)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2)
}));

function ClinicalPatientView() {
    const { customization } = useSelector((state) => state);
    const dispatch = useDispatch();
    const { startTour } = useTour();
    const [patientId, setPatientId] = useState('');
    const [programId, setProgramId] = useState('');
    const [location, setLocation] = useState('');
    const [genomicRows, setGenomicRows] = useState([]);
    const [genomicColumns] = useState([
        { field: 'program_id', headerName: 'Program ID', flex: 1 },
        { field: 'submitter_sample_id', headerName: 'Sample ID', flex: 1 },
        { field: 'experiment_id', headerName: 'Experiment ID', flex: 1 },
        { field: 'variant_count', headerName: 'Variant Count', flex: 1 },
        { field: 'genomes', headerName: 'Genomes', flex: 1 },
        { field: 'tumour_normal_designation', headerName: 'Tumour/Normal Designation', flex: 1, minWidth: 250 },
        { field: 'variants', headerName: 'Variants', flex: 1 },
        { field: 'reads', headerName: 'Reads', flex: 1 },
        { field: 'transcriptomes', headerName: 'Transcriptomes', flex: 1 }
    ]);
    // When the following is changed, the folders of the clinical sidebar should also change (once per change)
    const [forceSelection, setForceSelection] = useState([0, null]);
    const { data, rows, columns, title, topLevel, setRows, setColumns, setTitle } = useClinicalPatientData(
        patientId,
        programId,
        location,
        forceSelection
    );
    const ageAtFirstDiagnosis = topLevel.age_at_first_diagnosis;
    const dateOfBirth = data?.date_of_birth;

    // Start the patient-page tour, making sure the folder sidebar is open and the
    // page has rendered before Joyride looks for its targets.
    const runPatientTour = () => {
        dispatch({ type: SET_MENU, opened: true });
        waitForElement('[data-tour="patient-info"]').then(() => startTour(patientTourSteps));
    };

    // Auto-start the tour the first time a patient page is opened (per browser).
    useEffect(() => {
        if (localStorage.getItem(PATIENT_TOUR_SEEN_KEY)) return;
        localStorage.setItem(PATIENT_TOUR_SEEN_KEY, 'true');
        runPatientTour();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEventClick = (category, array) => {
        const { titleClick, reorderedColumns, rowsClick } = handleTableSet(category[0], array, ageAtFirstDiagnosis);
        setTitle(titleClick);
        setColumns(reorderedColumns);
        setRows(rowsClick);
        setForceSelection((old) => [old[0] + 1, category]);
    };

    useEffect(() => {
        // Extract patientId from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const initialPatientId = urlParams.get('patientId');
        const intitalProgramId = urlParams.get('programId');
        const initiallocation = urlParams.get('location');
        const submitterDonorId = urlParams.get('submitterDonorId');
        setPatientId(initialPatientId || '');
        setProgramId(intitalProgramId || '');
        setLocation(initiallocation || '');

        if (!submitterDonorId) return;

        query({
            donors: submitterDonorId,
            genomic_data_types: 'any'
        }).then((response) => {
            let allGenomics = [];
            response.forEach((siteResponse) => {
                if (siteResponse?.results?.genomic) {
                    allGenomics = allGenomics.concat(siteResponse.results.genomic);
                }
            });
            const flattenedRows = allGenomics.map((row, idx) => ({
                id: idx,
                submitter_sample_id: row.submitter_sample_id,
                program_id: row.program_id,
                variant_count: row.variants_count || 0,
                tumour_normal_designation: row.tumour_normal_designation || 'NA',
                experiment_id: row.genomes.join(', ') || 'NA',
                genomes: row.genomes.join(', ') || 'NA',
                variants: row.variants.join(', ') || 'NA',
                reads: row.reads.join(', ') || 'NA',
                transcriptomes: row.transcriptomes.join(', ') || 'NA'
            }));
            setGenomicRows(flattenedRows);
        });
    }, []);

    return (
        <MainCard sx={{ borderRadius: customization.borderRadius * 0.25, margin: 0 }}>
            <DefaultErrorBoundary>
                {!dateOfBirth && (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Alert variant="outlined" severity="warning">
                            Unable to display timeline due to missing date of birth information.
                        </Alert>
                    </div>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography pb={1} variant="h5" style={{ fontWeight: 'bold' }}>
                        {title}
                    </Typography>
                    <Button size="small" startIcon={<IconPlayerPlay size={18} />} onClick={runPatientTour}>
                        Take a tour
                    </Button>
                </Box>
                <Typography pb={1} variant="h6">
                    {patientId}
                </Typography>
                <StyledTopLevelBox data-tour="patient-info">
                    {Object.entries(topLevel).map(([key, value]) => (
                        <div
                            key={key}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: '0.5em'
                            }}
                        >
                            <p style={{ fontWeight: 'bold', margin: 0 }}>{formatKey(key)}:</p>
                            <p style={{ margin: 0 }}>{String(value)}</p>
                        </div>
                    ))}
                </StyledTopLevelBox>
                <div style={{ width: '100%' }} data-tour="patient-clinical">
                    <DataGrid
                        sx={{ minHeight: '30vh', maxHeight: '68vh' }}
                        rows={rows}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                        hideFooterSelectedRowCount
                    />
                </div>
                {genomicRows.length > 0 && (
                    <>
                        <Typography pb={1} variant="h5" sx={{ mt: 3 }}>
                            Genomic Data
                        </Typography>

                        <div style={{ width: '100%' }} data-tour="patient-genomic">
                            <DataGrid
                                sx={{ minHeight: '20vh', marginBottom: '2em' }}
                                rows={genomicRows}
                                columns={genomicColumns}
                                pageSize={5}
                                rowsPerPageOptions={[5, 10]}
                                disableRowSelectionOnClick
                            />
                        </div>
                    </>
                )}
                {dateOfBirth && (
                    <TimelineContainer data-tour="patient-timeline">
                        <Timeline data={data} onEventClick={handleEventClick} />
                    </TimelineContainer>
                )}
            </DefaultErrorBoundary>
        </MainCard>
    );
}

export default ClinicalPatientView;
