import * as React from 'react';

// material-ui
import { useTheme, makeStyles } from '@material-ui/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Grid, Box } from '@material-ui/core';

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
import SingleRowTable from 'ui-component/SingleRowTable';
import Tabs from 'ui-component/Tabs';

const useStyles = makeStyles({
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
    const [activeTab, setActiveTab] = React.useState('CONDITIONS');

    const handleRowClick = (row) => {
        const index = mcodeData.results.findIndex((item) => item.id === row.id);
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
    const headerLabels = ['Ethnicity', 'Sex', 'Date of Birth', 'Date of Death', 'Language'];
    const headerWidths = ['85px', '85px', '100px', '110px', '110px'];
    const stackCells = [
        selectedPatientEthnicity,
        selectedPatientSex,
        selectedPatientBirthDate,
        selectedPatientDeathDate,
        selectedPatientLanguage
    ];

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
                    <SingleRowTable
                        dropDownLabel="Patient Id"
                        dropDownSelection={selectedPatient}
                        headerLabels={headerLabels}
                        headerWidths={headerWidths}
                        stackCells={stackCells}
                        handleRowClick={handleRowClick}
                        isListOpen={isListOpen}
                        setListOpen={setListOpen}
                        rows={rows}
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
