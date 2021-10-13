import * as React from 'react';

// material-ui
import { useTheme, makeStyles } from '@material-ui/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Grid, Box } from '@material-ui/core';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { katsu } from 'store/api';
import {
    cancerConditionsColumns,
    cancerRelatedProceduresColumns,
    mainColumns,
    medicationStatementColumns,
    processConditionsData,
    processMedicationStatementData,
    processProceduresData,
    processMCodeMainData
} from 'store/mcode';

const useStyles = makeStyles({
    scrollButtons: {
        '&.Mui-disabled': {
            opacity: 0.3
        }
    },
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
    }
});

function MCodeView() {
    const theme = useTheme();
    const classes = useStyles();
    const [mcodeData, setMcodeData] = React.useState([]);
    const [rows, setRows] = React.useState([]);
    const [selectedPatient, setSelectedPatient] = React.useState([]);
    const [selectedPatientEthnicity, setSelectedPatientEthnicity] = React.useState([]);
    const [selectedPatientSex, setSelectedPatientSex] = React.useState([]);
    const [value, setValue] = React.useState('1');
    const [cancerConditions, setCancerConditions] = React.useState([]);
    const [procedures, setProcedures] = React.useState([]);
    const [medicationStatement, setMedicationStatement] = React.useState([]);
    const [desktopResolution, setdesktopResolution] = React.useState(window.innerWidth > 1200);
    const [isListOpen, setListOpen] = React.useState(false);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleRowClick = (row) => {
        const index = mcodeData.results.findIndex((item) => item.id === row.id);
        setSelectedPatient(mcodeData.results[index].id);
        setSelectedPatientEthnicity(mcodeData.results[index].subject.ethnicity);
        setSelectedPatientSex(mcodeData.results[index].subject.sex);
        setCancerConditions(processConditionsData(mcodeData.results[index]));
        setProcedures(processProceduresData(mcodeData.results[index]));
        setMedicationStatement(processMedicationStatementData(mcodeData.results[index]));
        setListOpen(false);
    };

    function returnIds(rows) {
        return rows.map((row) => (
            <button className={classes.dropdownItem} type="button" onClick={() => handleRowClick(row)} key={row.id}>
                {row.id}
            </button>
        ));
    }

    React.useEffect(() => {
        fetch(`${katsu}/api/mcodepackets`)
            .then((response) => response.json())
            .then((data) => {
                setMcodeData(data);
                setSelectedPatient(data.results[0].id);
                setSelectedPatientEthnicity(data.results[0].subject.ethnicity);
                setSelectedPatientSex(data.results[0].subject.sex);
                const tempRows = [];
                for (let i = 0; i < data.results.length; i += 1) {
                    tempRows.push(processMCodeMainData(data.results[i]));
                }
                setRows(tempRows);
                setCancerConditions(processConditionsData(data.results[0]));
                setProcedures(processProceduresData(data.results[0]));
                setMedicationStatement(processMedicationStatementData(data.results[0]));
            });

        window.addEventListener('resize', () => setdesktopResolution(window.innerWidth > 1200));
    }, [desktopResolution, setdesktopResolution]);

    const screenWidth = desktopResolution ? '58%' : '100%';
    return (
        <MainCard title="mCode Data">
            <Grid container direction="row">
                <TabContext value={value}>
                    {selectedPatient && desktopResolution && (
                        <Box mr={2} ml={1} p={1} pr={10} sx={{ position: 'absolute', border: 1, borderRadius: 2 }}>
                            <span style={{ color: theme.palette.primary.main }}>
                                <b>Patient Id</b>
                            </span>
                            <br />
                            <span>{selectedPatient}</span>
                        </Box>
                    )}
                    <Grid container direction="row" justifyContent="flex-end" alignItems="center">
                        {!desktopResolution && (
                            <Grid container direction="row">
                                <Grid>
                                    <Box
                                        mr={1}
                                        p={1}
                                        sx={{ border: 1, borderRadius: 2 }}
                                        onClick={() => setListOpen(!isListOpen)}
                                        type="button"
                                    >
                                        <span style={{ color: theme.palette.primary.main }}>
                                            <b>Patient Id</b>
                                        </span>
                                        <br />
                                        <span>
                                            {selectedPatient}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="icon icon-tabler icon-tabler-chevron-down"
                                                width="15"
                                                height="15"
                                                viewBox="0 0 24 24"
                                                strokeWidth="3"
                                                stroke="#597e8d"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </span>
                                    </Box>
                                    {isListOpen && (
                                        <Grid
                                            container
                                            direction="column"
                                            className="dropdown-menu"
                                            aria-labelledby="actions"
                                            sx={{
                                                position: 'absolute',
                                                zIndex: 1,
                                                border: '1px grey solid',
                                                borderRadius: 2,
                                                width: 'max-content'
                                            }}
                                        >
                                            {returnIds(rows)}
                                        </Grid>
                                    )}
                                </Grid>
                                <Box mr={1} p={1} sx={{ border: 1, borderRadius: 2 }}>
                                    <span style={{ color: theme.palette.primary.main }}>
                                        <b>Ethnicity</b>
                                    </span>
                                    <br />
                                    <span>{selectedPatientEthnicity}</span>
                                </Box>
                                <Box mr={1} p={1} sx={{ border: 1, borderRadius: 2 }}>
                                    <span style={{ color: theme.palette.primary.main }}>
                                        <b>Sex</b>
                                    </span>
                                    <br />
                                    <span>{selectedPatientSex}</span>
                                </Box>
                            </Grid>
                        )}
                        <Box mb={3}>
                            <Tabs
                                value={value}
                                onChange={handleChange}
                                textColor="primary"
                                indicatorColor="primary"
                                variant="scrollable"
                                scrollButtons
                                allowScrollButtonsMobile
                            >
                                <Tab value="1" label="Conditions" />
                                <Tab value="2" label="Procedures" />
                                <Tab value="3" label="Medications" />
                            </Tabs>
                        </Box>
                    </Grid>
                    <Grid container justifyContent="center" alignItems="center">
                        {desktopResolution && (
                            <Grid item mr={2} sx={{ height: 600, width: '40%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={mainColumns}
                                    pageSize={8}
                                    rowsPerPageOptions={[8]}
                                    components={{ Toolbar: GridToolbar }}
                                    onRowClick={(rowData) => handleRowClick(rowData.row)}
                                />
                            </Grid>
                        )}
                        <Grid sx={{ width: screenWidth }}>
                            <TabPanel value="1" sx={{ height: 600, width: '100%', padding: 0 }}>
                                <Grid item sx={{ height: 600, width: '100%' }}>
                                    <DataGrid
                                        rows={cancerConditions}
                                        columns={cancerConditionsColumns}
                                        pageSize={8}
                                        rowsPerPageOptions={[8]}
                                        components={{ Toolbar: GridToolbar }}
                                        disableSelectionOnClick
                                    />
                                </Grid>
                            </TabPanel>
                            <TabPanel value="2" sx={{ height: 600, width: '100%', padding: 0 }}>
                                <Grid item sx={{ height: 600, width: '100%' }}>
                                    <DataGrid
                                        rows={procedures}
                                        columns={cancerRelatedProceduresColumns}
                                        pageSize={8}
                                        rowsPerPageOptions={[8]}
                                        components={{ Toolbar: GridToolbar }}
                                        disableSelectionOnClick
                                    />
                                </Grid>
                            </TabPanel>
                            <TabPanel value="3" sx={{ height: 600, width: '100%', padding: 0 }}>
                                <Grid item sx={{ height: 600, width: '100%' }}>
                                    <DataGrid
                                        rows={medicationStatement}
                                        columns={medicationStatementColumns}
                                        pageSize={8}
                                        rowsPerPageOptions={[8]}
                                        components={{ Toolbar: GridToolbar }}
                                        disableSelectionOnClick
                                    />
                                </Grid>
                            </TabPanel>
                        </Grid>
                    </Grid>
                </TabContext>
            </Grid>
        </MainCard>
    );
}

export default MCodeView;
