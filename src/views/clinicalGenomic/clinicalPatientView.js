import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { AppBar, Button, Divider, Toolbar, Typography, Box } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { makeStyles, useTheme } from '@mui/styles';

import MainCard from 'ui-component/cards/MainCard';
import PatientView from './widgets/patientView';
import { useSidebarWriterContext } from '../../layout/MainLayout/Sidebar/SidebarContext';
import { useSearchQueryWriterContext, useSearchResultsReaderContext } from './SearchResultsContext';

import PatientSidebar from './widgets/patientSidebar';
import SearchHandler from './search/SearchHandler';

import { fetchFederation } from '../../store/api';

const useStyles = makeStyles((theme) => ({
    sidebarOffset: {
        width: 'calc(100% - 320px)',
        left: 280
    },
    noSidebarOffset: {
        width: 'calc(100% - 80px)',
        left: 40
    },
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

function ClinicalPatientView(data) {
    const theme = useTheme();
    const classes = useStyles();
    const { customization } = useSelector((state) => state);
    const { opened: sidebarOpened } = customization;
    const sidebarWriter = useSidebarWriterContext();
    const [topLevel, setTopLevel] = useState({});
    const [title, setTitle] = useState('');
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [patientId, setPatientId] = useState();

    function formatKey(key) {
        // Replace underscores with spaces and capitalize each word
        return key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    useEffect(() => {
        const filteredData = {};
        const urlParams = new URLSearchParams(window.location.search);
        setPatientId(urlParams.get('patientId'));
        const url = `v2/authorized/donor_with_clinical_data/?submitter_donor_id=${patientId}`;

        function fetchDonor(url) {
            return fetchFederation(url, 'katsu')
                .then((data) => {
                    console.log(data[0].results.results[0]);
                    // Pass the data to the PatientSidebar component as a prop
                    sidebarWriter(
                        <PatientSidebar
                            sidebar={data[0].results.results[0]}
                            setRows={setRows}
                            setColumns={setColumns}
                            setTitle={setTitle}
                        />
                    );

                    const filteredData = Object.fromEntries(
                        Object.entries(data[0].results.results[0]).filter(
                            ([key, value]) => !Array.isArray(value) && typeof value !== 'object'
                        )
                    );

                    // Update the state after processing the data
                    setTopLevel(filteredData);
                })
                .catch((error) => {
                    console.log('Error fetching data : ', error);
                });
        }

        // TOP LEVEL WORK WAS LAST I DID BEFORE IT STARTED BREAKING SIGN
        fetchDonor(url);
    }, []);

    return (
        <>
            <MainCard sx={{ borderRadius: customization.borderRadius * 0.25, margin: 0 }}>
                <Typography pb={1} variant="h4">
                    {title}
                </Typography>
                <Typography pb={1} variant="h5">
                    {patientId}
                </Typography>
                <div style={{ width: '100%', height: '65vh' }}>
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
                            <p style={{ margin: 0 }}>{value}</p>
                        </div>
                    ))}
                </Box>
            </MainCard>
        </>
    );
}

export default ClinicalPatientView;
