import * as React from 'react';

// material-ui
import { useTheme, makeStyles } from '@material-ui/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Grid, Box } from '@material-ui/core';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { katsu } from 'store/api';
import {
    processPhenopacketMainData,
    mainColumns,
    phenotypicFeatureColumns,
    processPhenotypicFeaturesData,
    processDiseaseData,
    diseasesColumns,
    processResourcesData,
    resourcesColumns
} from 'store/phenopackets';
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

function Phenopackets() {
    const theme = useTheme();
    const classes = useStyles();

    const [phenopacketsData, setPhenopacketsData] = React.useState([]);
    const [rows, setRows] = React.useState([]);

    const [selectedPatient, setSelectedPatient] = React.useState('');
    const [selectedPatientEthnicity, setSelectedPatientEthnicity] = React.useState('');
    const [selectedPatientSex, setSelectedPatientSex] = React.useState('');
    const [selectedPatientBirthDate, setSelectedPatientBirthDate] = React.useState('');
    const [selectedPatientHeight, setSelectedPatientHeight] = React.useState('');
    const [selectedPatientWeight, setSelectedPatientWeight] = React.useState('');
    const [selectedPatientABOType, setSelectedPatientABOType] = React.useState('');
    const [selectedPatientEducation, setSelectedPatientEducation] = React.useState('');
    const [selectedPatientHousehold, setSelectedPatientHousehold] = React.useState('');
    const [selectedPatientPregnancy, setSelectedPatientPregnancy] = React.useState('');
    const [seletedPatientEmployment, setSelectedPatientEmployment] = React.useState('');
    const [selectedPatientAsymptomatic, setSelectedPatientAsymptomatic] = React.useState('');
    const [selectedPatientCovid19Test, setSelectedPatientCovid19Test] = React.useState('');
    const [selectedPatientHospitalized, setSelectedPatientHospitalized] = React.useState('');
    const [selectedPatientBirthCountry, setSelectedPatientBrithCountry] = React.useState('');
    const [selectedPatientHostHospital, setSelectedPatientHostHospital] = React.useState('');
    const [selectedPatientResidenceType, setSelectedPatientResidenceType] = React.useState('');
    const [selectedPatientEnrollmentType, setSelectedPatientEnrolledmentType] = React.useState('');
    const [selectedPatientCovid19TestDate, setSelectedPatientCovid19TestDate] = React.useState('');
    const [selectedPatientCovid19DiagnosisDate, setSelectedPatientCovid19DiagnosisDate] = React.useState('');

    // Subtables
    const [phenotypicFeatures, setPhenotypicFeatures] = React.useState([]);
    const [diseases, setDiseases] = React.useState([]);
    const [resources, setResources] = React.useState([]);

    const [desktopResolution, setdesktopResolution] = React.useState(window.innerWidth > 1200);
    const [isListOpen, setListOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('PHENOTYPIC FEATURES');

    const handleRowClick = (row) => {
        const index = phenopacketsData.results.findIndex((item) => item.id === row.id);
        setSelectedPatient(phenopacketsData.results[index].id);
        setSelectedPatientEthnicity(phenopacketsData.results[index].subject.ethnicity);
        setSelectedPatientSex(phenopacketsData.results[index].subject.sex);
        setSelectedPatientBirthDate(phenopacketsData.results[index].subject.date_of_birth);

        setPhenotypicFeatures(processPhenotypicFeaturesData(phenopacketsData.results[index]));
        setDiseases(processDiseaseData(phenopacketsData.results[index]));
        setResources(processResourcesData(phenopacketsData.results[index]));

        setListOpen(false);
    };

    React.useEffect(() => {
        fetch(`${katsu}/api/phenopackets`)
            .then((response) => response.json())
            .then((data) => {
                setPhenopacketsData(data);
                const tempRows = [];
                for (let i = 0; i < data.results.length; i += 1) {
                    tempRows.push(processPhenopacketMainData(data.results[i]));
                }
                setRows(tempRows);
                setSelectedPatient(tempRows[0].id);
                setSelectedPatientEthnicity(tempRows[0].ethnicity);
                setSelectedPatientSex(tempRows[0].sex);
                setSelectedPatientBirthDate(tempRows[0].date_of_birth);
                setSelectedPatientHeight(tempRows[0].height);
                setSelectedPatientWeight(tempRows[0].weight);
                setSelectedPatientABOType(tempRows[0].abo_type);
                setSelectedPatientEducation(tempRows[0].education);
                setSelectedPatientHousehold(tempRows[0].household);
                setSelectedPatientPregnancy(tempRows[0].pregnancy);
                setSelectedPatientEmployment(tempRows[0].employment);
                setSelectedPatientAsymptomatic(tempRows[0].asymptomatic);
                setSelectedPatientCovid19Test(tempRows[0].covid19_test);
                setSelectedPatientHospitalized(tempRows[0].hospitalized);
                setSelectedPatientBrithCountry(tempRows[0].birth_country);
                setSelectedPatientHostHospital(tempRows[0].host_hospital);
                setSelectedPatientResidenceType(tempRows[0].residence_type);
                setSelectedPatientEnrolledmentType(tempRows[0].enrollment_date);
                setSelectedPatientCovid19TestDate(tempRows[0].covid19_test_date);
                setSelectedPatientCovid19DiagnosisDate(tempRows[0].covid19_diagnosis_date);

                // Subtables
                setPhenotypicFeatures(processPhenotypicFeaturesData(data.results[0]));
                setDiseases(processDiseaseData(data.results[0]));
                setResources(processResourcesData(data.results[0]));
            });

        window.addEventListener('resize', () => setdesktopResolution(window.innerWidth > 1200));
    }, [desktopResolution, setdesktopResolution]);

    const screenWidth = desktopResolution ? '58%' : '100%';
    const headerLabels = [
        'Ethnicity',
        'Sex',
        'Date of Birth',
        'Height',
        'Weight',
        'Blood Type',
        'Education',
        'Household',
        'Pregnancy',
        'Employment',
        'Asymptomatic',
        'Covid 19 Test',
        'Hospitalized',
        'Birth Country',
        'Host Hospital',
        'Residence Type',
        'Enrollment Date',
        'Covid19 Test Date',
        'Covid19 Diagnosis'
    ];
    const headerWidths = [
        '85px',
        '85px',
        '100px',
        '85px',
        '85px',
        '95px',
        '220px',
        '95px',
        '95px',
        '175px',
        '110px',
        '120px',
        '120px',
        '130px',
        '175px',
        '155px',
        '130px',
        '155px',
        '155px'
    ];
    const stackCells = [
        selectedPatientEthnicity,
        selectedPatientSex,
        selectedPatientBirthDate,
        selectedPatientHeight,
        selectedPatientWeight,
        selectedPatientABOType,
        selectedPatientEducation,
        selectedPatientHousehold,
        selectedPatientPregnancy,
        seletedPatientEmployment,
        selectedPatientAsymptomatic,
        selectedPatientCovid19Test,
        selectedPatientHospitalized,
        selectedPatientBirthCountry,
        selectedPatientHostHospital,
        selectedPatientResidenceType,
        selectedPatientEnrollmentType,
        selectedPatientCovid19TestDate,
        selectedPatientCovid19DiagnosisDate
    ];

    return (
        <MainCard title="Phenopackets Data">
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
                    <Tabs tabHeaders={['PHENOTYPIC FEATURES', 'DISEASES', 'RESOURCES']} setActiveTab={setActiveTab} activeTab={activeTab} />
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
                                className={classes.scrollbar}
                                disableSelectionOnClick
                            />
                        </Grid>
                    )}
                    <Grid item sx={{ width: screenWidth }}>
                        {activeTab === 'PHENOTYPIC FEATURES' && (
                            <Grid item sx={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={phenotypicFeatures}
                                    columns={phenotypicFeatureColumns}
                                    pageSize={8}
                                    rowsPerPageOptions={[8]}
                                    components={{ Toolbar: GridToolbar }}
                                    disableSelectionOnClick
                                    className={classes.scrollbar}
                                />
                            </Grid>
                        )}
                        {activeTab === 'DISEASES' && (
                            <Grid item sx={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={diseases}
                                    columns={diseasesColumns}
                                    pageSize={8}
                                    rowsPerPageOptions={[8]}
                                    components={{ Toolbar: GridToolbar }}
                                    disableSelectionOnClick
                                    className={classes.scrollbar}
                                />
                            </Grid>
                        )}
                        {activeTab === 'RESOURCES' && (
                            <Grid item sx={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={resources}
                                    columns={resourcesColumns}
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

export default Phenopackets;
