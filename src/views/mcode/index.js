import * as React from 'react';

// material-ui
import { useTheme, makeStyles } from '@material-ui/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Grid, Box } from '@material-ui/core';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { katsu } from 'store/api';
import {
    cancerConditionsColumns,
    cancerRelatedProceduresColumns,
    subjectColumns,
    medicationStatementColumns,
    processConditionsData,
    processMedicationStatementData,
    processProceduresData,
    processMCodeMainData
} from 'store/mcode';

const useStyles = makeStyles({
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
    },
    tabs: {
        background: 'white',
        border: 'none',
        fontWeight: 'bold',
        fontSize: '0.85em',
        color: 'grey',
        borderBottom: '3px solid white',
        '&:hover': {
            borderBottom: '3px solid #2196f3',
            color: '#2196f3'
        }
    },
    active: {
        background: 'white',
        fontWeight: 'bold',
        fontSize: '0.85em',
        border: 'none',
        borderBottom: '3px solid #2196f3',
        color: '#2196f3'
    },
    mobileRow: {
        width: '700px'
    },
    scrollbar: {
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
            height: '0.4em',
            width: '0.4em'
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 4px rgba(0,0,0,0.00)'
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)'
        }
    }
});

function MCodeView() {
    const theme = useTheme();
    const classes = useStyles();
    const [mcodeData, setMcodeData] = React.useState([]);
    const [rows, setRows] = React.useState([]);
    const [selectedPatient, setSelectedPatient] = React.useState('');
    const [selectedPatientEthnicity, setSelectedPatientEthnicity] = React.useState('');
    const [selectedPatientSex, setSelectedPatientSex] = React.useState('');
    const [selectedPatientBirthDate, setSelectedPatientBirthDate] = React.useState('');
    const [selectedPatientDeathDate, setSelectedPatientDeathDate] = React.useState('');
    const [selectedPatientLanguage, setSelectedPatientLanguage] = React.useState('');
    const [cancerConditions, setCancerConditions] = React.useState([]);
    const [procedures, setProcedures] = React.useState([]);
    const [medicationStatement, setMedicationStatement] = React.useState([]);
    const [desktopResolution, setdesktopResolution] = React.useState(window.innerWidth > 1200);
    const [isListOpen, setListOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('0');

    const handleRowClick = (row) => {
        const index = mcodeData.results.findIndex((item) => item.id === row.id);
        console.log(mcodeData.results[index]);
        setSelectedPatient(mcodeData.results[index].id);
        setSelectedPatientEthnicity(mcodeData.results[index].subject.ethnicity);
        setSelectedPatientSex(mcodeData.results[index].subject.sex);
        setSelectedPatientLanguage(mcodeData.results[index].subject.extra_properties.communication_language);
        setSelectedPatientBirthDate(mcodeData.results[index].subject.date_of_birth);
        setSelectedPatientDeathDate(mcodeData.results[index].date_of_death);
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

                const tempRows = [];
                for (let i = 0; i < data.results.length; i += 1) {
                    tempRows.push(processMCodeMainData(data.results[i]));
                }
                setRows(tempRows);
                setSelectedPatient(tempRows[0].id);
                setSelectedPatientEthnicity(tempRows[0].ethnicity);
                setSelectedPatientSex(tempRows[0].sex);
                setSelectedPatientBirthDate(tempRows[0].date_of_birth);
                setSelectedPatientDeathDate(tempRows[0].date_of_death);
                setSelectedPatientLanguage(tempRows[0].communication_language);
                setCancerConditions(processConditionsData(data.results[0]));
                setProcedures(processProceduresData(data.results[0]));
                setMedicationStatement(processMedicationStatementData(data.results[0]));
            });

        window.addEventListener('resize', () => setdesktopResolution(window.innerWidth > 1200));
    }, [desktopResolution, setdesktopResolution]);

    const screenWidth = desktopResolution ? '58%' : '100%';
    console.log(selectedPatientBirthDate);
    console.log(selectedPatientDeathDate);
    console.log(selectedPatientLanguage);
    return (
        <MainCard title="mCode Data">
            <Grid container direction="row">
                {selectedPatient && desktopResolution && (
                    <Box mr={2} ml={1} p={1} pr={10} sx={{ position: 'absolute', border: 1, borderRadius: 2 }}>
                        <span style={{ color: theme.palette.primary.main }}>
                            <b>Patient Id</b>
                        </span>
                        <br />
                        <span>{selectedPatient}</span>
                    </Box>
                )}
                {!desktopResolution && (
                    <TableContainer className={[classes.mobileRow, classes.scrollbar]}>
                        <Table>
                            <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
                                <Grid sx={{ width: '110px' }}>
                                    <Box mr={1} p={1} onClick={() => setListOpen(!isListOpen)} type="button">
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
                                {selectedPatientEthnicity && (
                                    <Box mr={1} p={1} sx={{ width: '70px' }}>
                                        <span style={{ color: theme.palette.primary.main }}>
                                            <b>Ethnicity</b>
                                        </span>
                                        <br />
                                        <span>{selectedPatientEthnicity}</span>
                                    </Box>
                                )}
                                {selectedPatientSex && (
                                    <Box mr={1} p={1} sx={{ width: '70px' }}>
                                        <span style={{ color: theme.palette.primary.main }}>
                                            <b>Sex</b>
                                        </span>
                                        <br />
                                        <span>{selectedPatientSex}</span>
                                    </Box>
                                )}
                                {selectedPatientBirthDate && (
                                    <Box mr={1} p={1} sx={{ width: '100px' }}>
                                        <span style={{ color: theme.palette.primary.main }}>
                                            <b>Date of Birth</b>
                                        </span>
                                        <br />
                                        <span>{selectedPatientBirthDate}</span>
                                    </Box>
                                )}
                                {selectedPatientDeathDate && (
                                    <Box mr={1} p={1} sx={{ width: '105px' }}>
                                        <span style={{ color: theme.palette.primary.main }}>
                                            <b>Date of Death</b>
                                        </span>
                                        <br />
                                        <span>{selectedPatientDeathDate}</span>
                                    </Box>
                                )}
                                {selectedPatientLanguage && (
                                    <Box mr={1} p={1} sx={{ width: '100px' }}>
                                        <span style={{ color: theme.palette.primary.main }}>
                                            <b>Language</b>
                                        </span>
                                        <br />
                                        <span>{selectedPatientLanguage}</span>
                                    </Box>
                                )}
                            </Stack>
                        </Table>
                    </TableContainer>
                )}

                <Grid container direction="row" justifyContent="flex-end" alignItems="center">
                    <Box mb={3}>
                        <Grid container direction="row">
                            <Box
                                component="button"
                                pl={1}
                                pr={1}
                                pt={2}
                                pb={2}
                                className={activeTab === '0' ? classes.active : classes.tabs}
                                onClick={() => setActiveTab('0')}
                            >
                                CONDITIONS
                            </Box>
                            <Box
                                component="button"
                                pl={1}
                                pr={1}
                                pt={2}
                                pb={2}
                                className={activeTab === '1' ? classes.active : classes.tabs}
                                onClick={() => setActiveTab('1')}
                            >
                                PROCEDURES
                            </Box>
                            <Box
                                component="button"
                                pl={1}
                                pr={1}
                                pt={2}
                                pb={2}
                                className={activeTab === '2' ? classes.active : classes.tabs}
                                onClick={() => setActiveTab('2')}
                            >
                                MEDICATIONS
                            </Box>
                        </Grid>
                    </Box>
                </Grid>
                <Grid container justifyContent="center" alignItems="center">
                    {desktopResolution && (
                        <Grid item mr={2} sx={{ height: 600, width: '40%' }}>
                            <DataGrid
                                rows={rows}
                                columns={subjectColumns}
                                pageSize={8}
                                rowsPerPageOptions={[8]}
                                components={{ Toolbar: GridToolbar }}
                                onRowClick={(rowData) => handleRowClick(rowData.row)}
                                className={classes.scrollbar}
                            />
                        </Grid>
                    )}
                    <Grid item sx={{ width: screenWidth }}>
                        {activeTab === '0' && (
                            <Grid item sx={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={cancerConditions}
                                    columns={cancerConditionsColumns}
                                    pageSize={8}
                                    rowsPerPageOptions={[8]}
                                    components={{ Toolbar: GridToolbar }}
                                    disableSelectionOnClick
                                    className={classes.scrollbar}
                                />
                            </Grid>
                        )}
                        {activeTab === '1' && (
                            <Grid item sx={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={procedures}
                                    columns={cancerRelatedProceduresColumns}
                                    pageSize={8}
                                    rowsPerPageOptions={[8]}
                                    components={{ Toolbar: GridToolbar }}
                                    disableSelectionOnClick
                                    className={classes.scrollbar}
                                />
                            </Grid>
                        )}
                        {activeTab === '2' && (
                            <Grid item sx={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={medicationStatement}
                                    columns={medicationStatementColumns}
                                    pageSize={8}
                                    rowsPerPageOptions={[8]}
                                    components={{ Toolbar: GridToolbar }}
                                    disableSelectionOnClick
                                    className={classes.scrollbar}
                                />
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </MainCard>
    );
}

export default MCodeView;
