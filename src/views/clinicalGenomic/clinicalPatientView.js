import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { makeStyles, useTheme } from '@mui/styles';

import { useSelector } from 'react-redux';

import MainCard from 'ui-component/cards/MainCard';
import PatientView from './widgets/patientView';
import { useSidebarWriterContext } from '../../layout/MainLayout/Sidebar/SidebarContext';
import { useSearchQueryWriterContext, useSearchResultsReaderContext } from './SearchResultsContext';

import PatientSidebar from './widgets/patientSidebar';
import SearchHandler from './search/SearchHandler';

import useClinicalPatientData from './useClinicalPatientData';

const useStyles = makeStyles((theme) => ({
    topLevelClass: {
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
    }
}));

function ClinicalPatientView() {
    const theme = useTheme();
    const classes = useStyles();
    const { customization } = useSelector((state) => state);
    const { opened: sidebarOpened } = customization;

    const [patientId, setPatientId] = useState('');
    const [programId, setProgramId] = useState('');
    const { data, rows, columns, title, topLevel, formatKey } = useClinicalPatientData(patientId, programId);

    useEffect(() => {
        // Extract patientId from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const initialPatientId = urlParams.get('patientId');
        const intitalProgramId = urlParams.get('programId');

        setPatientId(initialPatientId || '');
        setProgramId(intitalProgramId || '');
    }, []);

    return (
        <>
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
                <Box className={classes.topLevelClass}>
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
                </Box>
            </MainCard>
        </>
    );
}

export default ClinicalPatientView;
