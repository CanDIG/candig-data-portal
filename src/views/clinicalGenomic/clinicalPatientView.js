import { useState, useEffect } from 'react';
import { styled } from '@mui/system';
import { Box, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSelector } from 'react-redux';
import clsx from 'clsx';

import MainCard from 'ui-component/cards/MainCard';
import useClinicalPatientData from './useClinicalPatientData';
import { formatKey, handleTableSet } from '../../utils/utils';
import Timeline from './widgets/timeline';

const StyledTopLevelBox = styled(Box)(({ theme }) => ({
    border: `1px solid ${theme.palette.primary.main}`,
    marginTop: '1em',
    padding: '1em',
    borderBottomLeftRadius: '10px',
    borderBottomRightRadius: '10px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '1em',
    boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.2)'
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
    let { rows, columns, title, topLevel} = useClinicalPatientData(patientId, programId);
    const ageAtFirstDiagnosis = topLevel.age_at_first_diagnosis;
    const handleEventClick = (category, array) => {
        const { titleClick, reorderedColumns, rowsClick } = handleTableSet(category, array, ageAtFirstDiagnosis);
        title = titleClick;
        columns = reorderedColumns;
        rows = rowsClick;
        console.log('rows', rows);
        console.log('columns', columns);
        console.log('title', title);
    };

    useEffect(() => {
        // Extract patientId from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const initialPatientId = urlParams.get('patientId');
        const initialProgramId = urlParams.get('programId');

        setPatientId(initialPatientId || '');
        setProgramId(initialProgramId || '');
    }, []);

    const additionalClass = 'your-additional-class'; // Replace with your actual class

    return (
        <MainCard sx={{ borderRadius: customization.borderRadius * 0.25, margin: 0 }}>
            <Typography pb={1} variant="h5" style={{ fontWeight: 'bold' }}>
                {title}
            </Typography>
            <Typography pb={1} variant="h6">
                {patientId}
            </Typography>
            <div style={{ width: '100%', height: '68vh' }}>
                <DataGrid rows={rows} columns={columns} pageSize={10} rowsPerPageOptions={[10]} hideFooterSelectedRowCount />
            </div>
            <StyledTopLevelBox className={clsx(additionalClass)}>
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
            <TimelineContainer>
                <Timeline patientId={patientId} programId={programId} onEventClick={handleEventClick} />
            </TimelineContainer>
        </MainCard>
    );
}

export default ClinicalPatientView;
