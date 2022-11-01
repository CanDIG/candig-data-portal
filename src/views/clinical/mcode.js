import * as React from 'react';

// npm installs
import ReactJson from 'react-json-view';
import cancerTypeCSV from '../../assets/data_files/cancer_histological_codes_labels.csv';
import papa from 'papaparse';

// mui
import { useTheme, makeStyles } from '@mui/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Grid, Box } from '@mui/material';

// REDUX
import { useSelector, useDispatch } from 'react-redux';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { fetchFederationClinicalData } from 'store/api';
import {
    subjectColumns,
    processMCodeMainData,
    processMedicationListData,
    processCondtionsListData,
    processSexListData,
    processCancerTypeListData,
    processHistologicalTypeListData
} from 'store/mcode';
import SingleRowTable from 'ui-component/SingleRowTable';
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
        width: '800px'
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
    const events = useSelector((state) => state);
    const dispatch = useDispatch();

    const [mcodeData, setMcodeData] = React.useState([]);
    const [rows, setRows] = React.useState([]);
    const [selectedPatient, setSelectedPatient] = React.useState('');
    const [selectedPatientMobileInfo, setSelectedPatientMobileInfo] = React.useState({});
    const [cancerType, setCancerType] = React.useState([]);
    // Mobile
    const [desktopResolution, setdesktopResolution] = React.useState(window.innerWidth > 1200);
    const [isListOpen, setListOpen] = React.useState(false);

    // Dropdown patient table open/closed
    const [isListOpenMedications, setListOpenMedications] = React.useState(false);
    const [isListOpenConditions, setListOpenConditions] = React.useState(false);
    const [isListOpenSex, setListOpenSex] = React.useState(false);
    const [isListOpenCancerType, setListOpenCancerType] = React.useState(false);
    const [isListOpenHistological, setListOpenHistological] = React.useState(false);

    // Dropdown patient table filtering current selection in dropdown
    const [selectedMedications, setSelectedMedications] = React.useState('All');
    const [selectedConditions, setSelectedConditions] = React.useState('All');
    const [selectedSex, setSelectedSex] = React.useState('All');
    const [selectedCancerType, setSelectedCancerType] = React.useState('All');
    const [selectedHistologicalType, setSelectedHistologicalType] = React.useState('All');
    const [patientJSON, setPatientJSON] = React.useState([]);

    // Dropdown patient table list for filtering
    const [medicationList, setMedicationList] = React.useState([]);
    const [conditionList, setConditionList] = React.useState([]);
    const [sexList, setSexList] = React.useState([]);
    const [cancerTypeList, setCancerTypeList] = React.useState([]);
    const [HistologicalList, setHistologicalList] = React.useState([]);

    const jsonTheme = {
        base00: 'white',
        base01: '#ddd',
        base02: '#ddd',
        base03: 'black',
        base04: '#0E3E17',
        base05: 'black',
        base06: 'black',
        base07: '#252525',
        base08: '#252525',
        base09: '#00418A',
        base0A: '#00418A',
        base0B: '#00418A',
        base0C: '#00418A',
        base0D: '#00418A',
        base0E: '#00418A',
        base0F: '#00418A'
    };

    function setRedux(
        rows,
        medicationList,
        conditionList,
        sexList,
        cancerTypeList,
        selectedMedications,
        selectedConditions,
        selectedCancerType,
        HistologicalList,
        selectedHistologicalType
    ) {
        const tempClinicalSearchResults = [];
        rows.forEach((patient) => {
            tempClinicalSearchResults.push({ id: patient.id, genomicId: patient.genomic_id });
        });
        dispatch({
            type: 'SET_SELECTED_CLINICAL_SEARCH_RESULTS',
            payload: {
                selectedClinicalSearchResults: tempClinicalSearchResults,
                clinicalSearchDropDowns: {
                    medicationList,
                    selectedMedications,
                    conditionList,
                    selectedConditions,
                    sexList,
                    selectedSex,
                    cancerTypeList,
                    selectedCancerType,
                    HistologicalList,
                    selectedHistologicalType
                }
            }
        });
    }
    // Parsing CancerType CSV into Dictionary
    papa.parse(cancerTypeCSV, {
        header: true,
        download: true,
        skipEmptyLines: true,
        // eslint-disable-next-line
        complete: function (results) {
            setCancerType(results.data);
        }
    });
    // Subtable selection of patient
    const handleRowClick = (row) => {
        let index;
        mcodeData.results.forEach((federatedResults) => {
            index = federatedResults.results.findIndex((item) => item.id === row.id);
            if (index !== -1) {
                setSelectedPatient(federatedResults.results[index].id);
                setSelectedPatientMobileInfo({
                    Ethnicity: federatedResults?.results[index]?.subject?.ethnicity
                        ? federatedResults?.results[index]?.subject?.ethnicity
                        : 'NA',
                    Sex: federatedResults?.results[index]?.subject?.sex ? federatedResults?.results[index]?.subject?.sex : 'NA',
                    Deceased: federatedResults?.results[index]?.subject?.deceased
                        ? federatedResults?.results[index]?.subject?.deceased
                        : 'NA',
                    Birthday: federatedResults?.results[index]?.subject?.date_of_birth
                        ? federatedResults?.results[index]?.subject?.date_of_birth
                        : 'NA',
                    DeathDate: federatedResults?.results[index]?.date_of_death ? federatedResults?.results[index]?.date_of_death : 'NA'
                });

                // Set patient JSON
                setPatientJSON(federatedResults?.results[index], selectedPatient);
            }
        });

        setListOpen(false);
    };

    const dropDownSelection = (dropDownGroup, selected) => {
        if (dropDownGroup === 'CONDITIONS') {
            setSelectedConditions(selected);
            setListOpenConditions(false);
        } else if (dropDownGroup === 'MEDICATIONS') {
            setSelectedMedications(selected);
            setListOpenMedications(false);
        } else if (dropDownGroup === 'SEX') {
            setSelectedSex(selected);
            setListOpenSex(false);
        } else if (dropDownGroup === 'CANCER TYPE') {
            setSelectedCancerType(selected);
            setListOpenCancerType(false);
        } else if (dropDownGroup === 'HISTOLOGICAL') {
            setSelectedHistologicalType(selected);
            setListOpenHistological(false);
        }
    };

    React.useEffect(() => {
        trackPromise(
            fetchFederationClinicalData('/api/mcodepackets').then((data) => {
                setMcodeData(data);
                const tempRows = [];
                for (let j = 0; j < data.results.length; j += 1) {
                    for (let i = 0; i < data.results[j].count; i += 1) {
                        // Patient table filtering
                        if (
                            selectedConditions === 'All' &&
                            selectedMedications === 'All' &&
                            selectedSex === 'All' &&
                            selectedCancerType === 'All' &&
                            selectedHistologicalType === 'All'
                        ) {
                            // All patients
                            if (processMCodeMainData(data.results[j].results[i], data.results[j].location[0]).id !== null) {
                                tempRows.push(processMCodeMainData(data.results[j].results[i], data.results[j].location[0]));
                            }
                        } else {
                            // Filtered patients
                            let patientCondition = false;
                            data?.results[j]?.results[i]?.cancer_condition?.body_site?.every((bodySite) => {
                                if (selectedConditions === 'All' || selectedConditions === bodySite.label) {
                                    patientCondition = true;
                                    return false;
                                }
                                return true;
                            });
                            let patientMedication = false;
                            data?.results[j]?.results[i]?.medication_statement.every((medication) => {
                                if (selectedMedications === 'All' || selectedMedications === medication?.medication_code.label) {
                                    patientMedication = true;
                                    return false;
                                }
                                return true;
                            });
                            let patientSex = false;
                            if (selectedSex === 'All' || selectedSex === data?.results[j]?.results[i]?.subject.sex) {
                                patientSex = true;
                            }
                            let patientCancerType = false;
                            if (selectedCancerType === 'All') {
                                patientCancerType = true;
                            } else {
                                for (let k = 0; k < cancerType.length; k += 1) {
                                    if (data?.results[j]?.results[i]?.cancer_condition?.code?.id === cancerType[k]['Cancer type code']) {
                                        if (
                                            selectedCancerType ===
                                            (`${cancerType[k]['Cancer type label']} ${cancerType[k]['Cancer type code']}`
                                                ? `${cancerType[k]['Cancer type label']} ${cancerType[k]['Cancer type code']}`
                                                : 'NA')
                                        ) {
                                            patientCancerType = true;
                                        }
                                    }
                                }
                            }
                            let patientHistologicalType = false;
                            if (selectedHistologicalType === 'All') {
                                patientHistologicalType = true;
                            } else {
                                for (let k = 0; k < cancerType.length; k += 1) {
                                    if (
                                        data?.results[j]?.results[i]?.cancer_condition?.histology_morphology_behavior?.id !== undefined &&
                                        data?.results[j]?.results[i]?.cancer_condition?.histology_morphology_behavior?.id ===
                                            cancerType[k]['Tumour histological type code']
                                    ) {
                                        if (
                                            selectedHistologicalType ===
                                            (`${cancerType[k]['Tumour histological type label']} ${cancerType[k]['Tumour histological type code']}`
                                                ? `${cancerType[k]['Tumour histological type label']} ${cancerType[k]['Tumour histological type code']}`
                                                : 'NA')
                                        ) {
                                            patientHistologicalType = true;
                                        }
                                    }
                                }
                            }
                            if (
                                patientCondition &&
                                patientMedication &&
                                patientSex &&
                                patientCancerType &&
                                patientHistologicalType &&
                                processMCodeMainData(data.results[j].results[i]).id !== null
                            ) {
                                tempRows.push(processMCodeMainData(data.results[j].results[i], data.results[j].location[0]));
                            }
                        }
                    }
                }
                setRows(tempRows);
                // Subtables
                if (tempRows.length !== 0) {
                    let index;
                    data.results.forEach((federatedResults) => {
                        index = federatedResults.results.findIndex((item) => item.id === tempRows[0].id);
                        if (index !== -1) {
                            setSelectedPatient(federatedResults.results[index].id);
                            setPatientJSON(federatedResults.results[index], selectedPatient);
                            if (tempRows[0].id !== null) {
                                setSelectedPatientMobileInfo({
                                    Ethnicity: tempRows[0]?.ethnicity ? tempRows[0]?.ethnicity : 'NA',
                                    Sex: tempRows[0]?.sex ? tempRows[0]?.sex : 'NA',
                                    Deceased: tempRows[0]?.deceased ? tempRows[0]?.deceased : 'NA',
                                    Birthday: tempRows[0]?.date_of_birth ? tempRows[0]?.date_of_birth : 'NA',
                                    DeathDate: tempRows[0]?.date_of_death ? tempRows[0]?.date_of_death : 'NA'
                                });
                            }
                        }
                    });
                } else {
                    setSelectedPatient('None');
                    setPatientJSON({});
                }

                setListOpen(false);
                // Dropdown patient table list for filtering
                setMedicationList(processMedicationListData(data.results));
                setConditionList(processCondtionsListData(data.results));
                setSexList(processSexListData(data.results));
                setCancerTypeList(processCancerTypeListData(data.results));
                setHistologicalList(processHistologicalTypeListData(data.results));

                setRedux(
                    tempRows,
                    medicationList,
                    conditionList,
                    sexList,
                    cancerTypeList,
                    selectedMedications,
                    selectedConditions,
                    selectedCancerType,
                    HistologicalList,
                    selectedHistologicalType
                );
            })
        );

        window.addEventListener('resize', () => setdesktopResolution(window.innerWidth > 1200));
    }, [
        desktopResolution,
        setdesktopResolution,
        selectedSex,
        selectedConditions,
        selectedMedications,
        selectedCancerType,
        selectedHistologicalType
    ]);

    const screenWidth = desktopResolution ? '48%' : '100%';
    const headerLabels = {
        Ethnicity: 'Ethnicity',
        Sex: 'Sex',
        Deceased: 'Deceased',
        Birthday: 'Date of Birth',
        DeathDate: 'Date of Death'
    };
    const headerWidths = {
        Ethnicity: '85px',
        Sex: '85px',
        Deceased: '85px',
        Birthday: '100px',
        DeathDate: '110px'
    };

    return (
        <MainCard title="mCode Data" sx={{ borderRadius: events.customization.borderRadius * 0.25 }}>
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
                                    setListOpen={setListOpenSex}
                                    isListOpen={isListOpenSex}
                                    dropDownLabel="Sex"
                                    currentSelection={selectedSex}
                                    dropDownItems={sexList}
                                    selectOption={dropDownSelection}
                                    dropDownGroup="SEX"
                                />
                                <DropDown
                                    setListOpen={setListOpenCancerType}
                                    isListOpen={isListOpenCancerType}
                                    dropDownLabel="Cancer Type"
                                    currentSelection={selectedCancerType}
                                    dropDownItems={cancerTypeList}
                                    selectOption={dropDownSelection}
                                    dropDownGroup="CANCER TYPE"
                                />
                                <DropDown
                                    setListOpen={setListOpenConditions}
                                    isListOpen={isListOpenConditions}
                                    dropDownLabel="Body Site"
                                    currentSelection={selectedConditions}
                                    dropDownItems={conditionList}
                                    selectOption={dropDownSelection}
                                    dropDownGroup="CONDITIONS"
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
                                <DropDown
                                    setListOpen={setListOpenHistological}
                                    isListOpen={isListOpenHistological}
                                    dropDownLabel="Histological Type"
                                    currentSelection={selectedHistologicalType}
                                    dropDownItems={HistologicalList}
                                    selectOption={dropDownSelection}
                                    dropDownGroup="HISTOLOGICAL"
                                />
                            </Stack>
                        </Table>
                    </TableContainer>
                )}
                {!desktopResolution && selectedPatient && (
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

                <Grid container pt={6} justifyContent="center" alignItems="center">
                    {desktopResolution && (
                        <Grid item mr={2} sx={{ height: 600, width: '50%' }}>
                            <DataGrid
                                rows={rows}
                                columns={subjectColumns}
                                pageSize={7}
                                rowsPerPageOptions={[7]}
                                components={{ Toolbar: GridToolbar }}
                                onRowClick={(rowData) => handleRowClick(rowData.row)}
                                className={classes.scrollbar}
                                disableSelectionOnClick
                            />
                        </Grid>
                    )}
                    <Grid item sx={{ width: screenWidth }}>
                        <Box
                            sx={{
                                border: 1,
                                borderColor: '#D3D3D3',
                                height: 600,
                                width: '100% ',
                                overflow: 'auto'
                            }}
                            p={2}
                        >
                            <ReactJson src={patientJSON} theme={jsonTheme} onDelete={false} onAdd={false} onEdit={false} />
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
        </MainCard>
    );
}

export default MCodeView;
