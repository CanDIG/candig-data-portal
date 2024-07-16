import { useState, useEffect } from 'react';
import { styled } from '@mui/system';
import { Box, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Alert from '@mui/material/Alert';
import { useSelector } from 'react-redux';

import MainCard from 'ui-component/cards/MainCard';
import useClinicalPatientData from './useClinicalPatientData';
import { formatKey, handleTableSet } from '../../utils/utils';
import Timeline from './widgets/timeline';

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
    const [patientId, setPatientId] = useState('');
    const [programId, setProgramId] = useState('');
    const [location, setLocation] = useState('');
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

        setPatientId(initialPatientId || '');
        setProgramId(intitalProgramId || '');
        setLocation(initiallocation || '');
    }, []);

    return (
        <MainCard sx={{ borderRadius: customization.borderRadius * 0.25, margin: 0 }}>
            {!dateOfBirth && (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <Alert variant="outlined" severity="warning">
                        Unable to display timeline due to missing date of birth information.
                    </Alert>
                </div>
            )}
            <Typography pb={1} variant="h5" style={{ fontWeight: 'bold' }}>
                {title}
            </Typography>
            <Typography pb={1} variant="h6">
                {patientId}
            </Typography>
            <StyledTopLevelBox>
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
            <div style={{ width: '100%', height: '68vh' }}>
                <DataGrid rows={rows} columns={columns} pageSize={10} rowsPerPageOptions={[10]} hideFooterSelectedRowCount />
            </div>
            {dateOfBirth && (
                <TimelineContainer>
                    <Timeline data={data} onEventClick={handleEventClick} />
                </TimelineContainer>
            )}
        </MainCard>
    );
}

export default ClinicalPatientView;
