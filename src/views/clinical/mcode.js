import * as React from 'react';

// material-ui
import { useTheme, makeStyles } from '@material-ui/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Grid, Box } from '@material-ui/core';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { fetchKatsu } from 'store/api';
import {
    cancerConditionsColumns,
    cancerRelatedProceduresColumns,
    subjectColumns,
    medicationStatementColumns,
    processConditionsData,
    processMedicationStatementData,
    processProceduresData,
    processMCodeMainData,
    processMedicationListData,
    processCondtionsListData,
    processProceduresListData
} from 'store/mcode';
import SingleRowTable from 'ui-component/SingleRowTable';
import Tabs from 'ui-component/Tabs';
import { trackPromise } from 'react-promise-tracker';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import DropDown from '../../ui-component/DropDown';

// Styles
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
    const [selectedPatientMobileInfo, setSelectedPatientMobileInfo] = React.useState({});

    // Sub tables
    const [cancerConditions, setCancerConditions] = React.useState([]);
    const [procedures, setProcedures] = React.useState([]);
    const [medicationStatement, setMedicationStatement] = React.useState([]);

    // Mobile
    const [desktopResolution, setdesktopResolution] = React.useState(window.innerWidth > 1200);
    const [isListOpen, setListOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('CONDITIONS');

    // Dropdown patient table open/closed
    const [isListOpenMedications, setListOpenMedications] = React.useState(false);
    const [isListOpenConditions, setListOpenConditions] = React.useState(false);
    const [isListOpenProcedures, setListOpenProcedures] = React.useState(false);

    // Dropdown patient table filtering current selection in dropdown
    const [selectedMedications, setSelectedMedications] = React.useState('All');
    const [selectedConditions, setSelectedConditions] = React.useState('All');
    const [selectedProcedures, setSelectedProcedures] = React.useState('All');

    // Dropdown patient table list for filtering
    const [medicationList, setMedicationList] = React.useState([]);
    const [conditionList, setConditionList] = React.useState([]);
    const [procedureList, setProcedureList] = React.useState([]);

    // Subtable selection of patient
    const handleRowClick = (row) => {
        const index = mcodeData.results.findIndex((item) => item.id === row.id);
        setSelectedPatient(mcodeData.results[index].id);
        setSelectedPatientMobileInfo({
            Ethnicity: mcodeData.results[index].subject.ethnicity,
            Sex: mcodeData.results[index].subject.sex,
            Birthday: mcodeData.results[index].subject.date_of_birth,
            DeathDate: mcodeData.results[index].date_of_death,
            Language: mcodeData.results[index].subject.extra_properties.communication_language
        });

        // Subtables
        setCancerConditions(processConditionsData(mcodeData.results[index]));
        setProcedures(processProceduresData(mcodeData.results[index]));
        setMedicationStatement(processMedicationStatementData(mcodeData.results[index]));
        setListOpen(false);
    };

    const dropDownSelection = (dropDownGroup, selected) => {
        if (dropDownGroup === 'CONDITIONS') {
            setSelectedConditions(selected);
            setListOpenConditions(false);
        } else if (dropDownGroup === 'PROCEDURES') {
            setSelectedProcedures(selected);
            setListOpenProcedures(false);
        } else if (dropDownGroup === 'MEDICATIONS') {
            setSelectedMedications(selected);
            setListOpenMedications(false);
        }
    };

    React.useEffect(() => {
        trackPromise(
            fetchKatsu('/api/mcodepackets').then((data) => {
                setMcodeData(data);

                const tempRows = [];
                for (let i = 0; i < data.results.length; i += 1) {
                    // Patient table filtering
                    if (selectedConditions === 'All' && selectedProcedures === 'All' && selectedMedications === 'All') {
                        // All patients
                        tempRows.push(processMCodeMainData(data.results[i]));
                    } else {
                        // Filtered patients
                        let patientCondition = false;
                        data.results[i].cancer_condition.every((condition) => {
                            if (selectedConditions === 'All' || selectedConditions === condition.code.label) {
                                patientCondition = true;
                                return false;
                            }
                            return true;
                        });
                        let patientProcedure = false;
                        data.results[i].cancer_related_procedures.every((procedure) => {
                            if (selectedProcedures === 'All' || selectedProcedures === procedure.procedure_type) {
                                patientProcedure = true;
                                return false;
                            }
                            return true;
                        });
                        let patientMedication = false;
                        data.results[i].medication_statement.every((medication) => {
                            if (selectedMedications === 'All' || selectedMedications === medication.medication_code.label) {
                                patientMedication = true;
                                return false;
                            }
                            return true;
                        });

                        if (patientCondition && patientProcedure && patientMedication) {
                            tempRows.push(processMCodeMainData(data.results[i]));
                        }
                    }
                }
                setRows(tempRows);
                setSelectedPatient(tempRows[0].id);
                setSelectedPatientMobileInfo({
                    Ethnicity: tempRows[0].ethnicity,
                    Sex: tempRows[0].sex,
                    Birthday: tempRows[0].date_of_birth,
                    DeathDate: tempRows[0].date_of_death,
                    Language: tempRows[0].communication_language
                });

                // Subtables
                const index = data.results.findIndex((item) => item.id === tempRows[0].id);
                setCancerConditions(processConditionsData(data.results[index]));
                setProcedures(processProceduresData(data.results[index]));
                setMedicationStatement(processMedicationStatementData(data.results[index]));

                // Dropdown patient table list for filtering
                setMedicationList(processMedicationListData(data.results));
                setConditionList(processCondtionsListData(data.results));
                setProcedureList(processProceduresListData(data.results));
            })
        );

        window.addEventListener('resize', () => setdesktopResolution(window.innerWidth > 1200));
    }, [desktopResolution, setdesktopResolution, selectedConditions, selectedProcedures, selectedMedications]);

    const screenWidth = desktopResolution ? '58%' : '100%';
    const headerLabels = {
        Ethnicity: 'Ethnicity',
        Sex: 'Sex',
        Birthday: 'Date of Birth',
        DeathDate: 'Date of Death',
        Language: 'Language'
    };
    const headerWidths = {
        Ethnicity: '85px',
        Sex: '85px',
        Birthday: '100px',
        DeathDate: '110px',
        Language: '110px'
    };

    return (
        <MainCard title="mCode Data">
            <Grid container direction="row">
                {selectedPatient && desktopResolution && (
                    <TableContainer className={[classes.mobileRow, classes.scrollbar]}>
                        <Table>
                            <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
                                <Box mr={2} ml={1} p={1} pr={5} sx={{ border: 1, borderRadius: 2 }}>
                                    <span style={{ color: theme.palette.primary.main }}>
                                        <b>Patient Id</b>
                                    </span>
                                    <br />
                                    <span>{selectedPatient}</span>
                                </Box>
                                <DropDown
                                    setListOpen={setListOpenConditions}
                                    isListOpen={isListOpenConditions}
                                    dropDownLabel="Conditions"
                                    currentSelection={selectedConditions}
                                    dropDownItems={conditionList}
                                    selectOption={dropDownSelection}
                                    dropDownGroup="CONDITIONS"
                                />
                                <DropDown
                                    setListOpen={setListOpenProcedures}
                                    isListOpen={isListOpenProcedures}
                                    dropDownLabel="Procedures"
                                    currentSelection={selectedProcedures}
                                    dropDownItems={procedureList}
                                    selectOption={dropDownSelection}
                                    dropDownGroup="PROCEDURES"
                                />
                                <DropDown
                                    setListOpen={setListOpenMedications}
                                    isListOpen={isListOpenMedications}
                                    dropDownLabel="Medications"
                                    currentSelection={selectedMedications}
                                    dropDownItems={medicationList}
                                    selectOption={dropDownSelection}
                                    dropDownGroup="MEDICATIONS"
                                />
                            </Stack>
                        </Table>
                    </TableContainer>
                )}
                {!desktopResolution && (
                    <SingleRowTable
                        dropDownLabel="Patient Id"
                        dropDownSelection={selectedPatient}
                        headerLabels={headerLabels}
                        headerWidths={headerWidths}
                        stackCells={selectedPatientMobileInfo}
                        handleRowClick={handleRowClick}
                        isListOpen={isListOpen}
                        setListOpen={setListOpen}
                        rows={rows}
                        dropDownGroup="PATIENT"
                    />
                )}

                <Grid container direction="row" justifyContent="flex-end" alignItems="center">
                    <Tabs tabHeaders={['CONDITIONS', 'PROCEDURES', 'MEDICATIONS']} setActiveTab={setActiveTab} activeTab={activeTab} />
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
                                disableSelectionOnClick
                            />
                        </Grid>
                    )}
                    <Grid item sx={{ width: screenWidth }}>
                        {activeTab === 'CONDITIONS' && (
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
                        {activeTab === 'PROCEDURES' && (
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
                        {activeTab === 'MEDICATIONS' && (
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
