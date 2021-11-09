import * as React from 'react';

// material-ui
import { useTheme, makeStyles } from '@material-ui/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Grid, Box } from '@material-ui/core';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { fetchKatsu } from 'store/api';
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
import { trackPromise } from 'react-promise-tracker';

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
    const [selectedPatientMobileInfo, setSelectedPatientMobileInfo] = React.useState({});

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
        setSelectedPatientMobileInfo({
            Ethnicity: phenopacketsData.results[index].subject.ethnicity,
            Sex: phenopacketsData.results[index].subject.sex,
            Birthday: phenopacketsData.results[index].subject.date_of_birth,
            Height: phenopacketsData.results[index].subject.extra_properties.height,
            Weight: phenopacketsData.results[index].subject.extra_properties.weight,
            BloodType: phenopacketsData.results[index].subject.extra_properties.abo_type,
            Education: phenopacketsData.results[index].subject.extra_properties.education,
            Household: phenopacketsData.results[index].subject.extra_properties.household,
            Pregnancy: phenopacketsData.results[index].subject.extra_properties.pregnancy,
            Employment: phenopacketsData.results[index].subject.extra_properties.employment,
            Asymptomatic: phenopacketsData.results[index].subject.extra_properties.asymptomatic,
            Covid19_test: phenopacketsData.results[index].subject.extra_properties.covid19_test,
            Hospitalized: phenopacketsData.results[index].subject.extra_properties.hospitalized,
            Birth_country: phenopacketsData.results[index].subject.extra_properties.birth_country,
            Host_hospital: phenopacketsData.results[index].subject.extra_properties.host_hospital,
            Residence_type: phenopacketsData.results[index].subject.extra_properties.residence_type,
            Enrollment_date: phenopacketsData.results[index].subject.extra_properties.enrollment_date,
            Covid19_test_date: phenopacketsData.results[index].subject.extra_properties.Covid19_test_date,
            Covid19_diagnosis_date: phenopacketsData.results[index].subject.extra_properties.covid19_diagnosis_date
        });

        setPhenotypicFeatures(processPhenotypicFeaturesData(phenopacketsData.results[index]));
        setDiseases(processDiseaseData(phenopacketsData.results[index]));
        setResources(processResourcesData(phenopacketsData.results[index]));

        setListOpen(false);

        console.log(phenopacketsData.results[index]);
    };

    React.useEffect(() => {
        trackPromise(
            fetchKatsu('/api/phenopackets').then((data) => {
                setPhenopacketsData(data);
                const tempRows = [];
                for (let i = 0; i < data.results.length; i += 1) {
                    tempRows.push(processPhenopacketMainData(data.results[i]));
                }
                setRows(tempRows);
                setSelectedPatient(tempRows[0].id);
                setSelectedPatientMobileInfo({
                    Ethnicity: tempRows[0].ethnicity,
                    Sex: tempRows[0].sex,
                    Birthday: tempRows[0].date_of_birth,
                    Height: tempRows[0].height,
                    Weight: tempRows[0].weight,
                    BloodType: tempRows[0].abo_type,
                    Education: tempRows[0].education,
                    Household: tempRows[0].household,
                    Pregnancy: tempRows[0].pregnancy,
                    Employment: tempRows[0].employment,
                    Asymptomatic: tempRows[0].asymptomatic,
                    Covid19_test: tempRows[0].covid19_test,
                    Hospitalized: tempRows[0].hospitalized,
                    Birth_country: tempRows[0].birth_country,
                    Host_hospital: tempRows[0].host_hospital,
                    Residence_type: tempRows[0].residence_type,
                    Enrollment_date: tempRows[0].enrollment_date,
                    Covid19_test_date: tempRows[0].Covid19_test_date,
                    Covid19_diagnosis_date: tempRows[0].covid19_diagnosis_date
                });

                // Subtables
                setPhenotypicFeatures(processPhenotypicFeaturesData(data.results[0]));
                setDiseases(processDiseaseData(data.results[0]));
                setResources(processResourcesData(data.results[0]));
            })
        );

        window.addEventListener('resize', () => setdesktopResolution(window.innerWidth > 1200));
    }, [desktopResolution, setdesktopResolution]);

    const screenWidth = desktopResolution ? '58%' : '100%';
    const headerLabels = {
        Ethnicity: 'Ethnicity',
        Sex: 'Sex',
        Birthday: 'Date of Birth',
        Height: 'Height',
        Weight: 'Weight',
        BloodType: 'Blood Type',
        Education: 'Education',
        Household: 'Household',
        Pregnancy: 'Pregnancy',
        Employment: 'Employment',
        Asymptomatic: 'Asymptomatic',
        Covid19_test: 'Covid 19 Test',
        Hospitalized: 'Hospitalized',
        Birth_country: 'Birth Country',
        Host_hospital: 'Host Hospital',
        Residence_type: 'Residence Type',
        Enrollment_date: 'Enrollment Date',
        Covid19_test_date: 'Covid19 Test Date',
        Covid19_diagnosis_date: 'Covid19 Diagnosis'
    };
    const headerWidths = {
        Ethnicity: '85px',
        Sex: '110px',
        Birthday: '100px',
        Height: '85px',
        Weight: '85px',
        BloodType: '95px',
        Education: '220px',
        Household: '95px',
        Pregnancy: '95px',
        Employment: '175px',
        Asymptomatic: '110px',
        Covid19_test: '120px',
        Hospitalized: '120px',
        Birth_country: '130px',
        Host_hospital: '175px',
        Residence_type: '155px',
        Enrollment_date: '130px',
        Covid19_test_date: '155px',
        Covid19_diagnosis_date: '155px'
    };

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
                        stackCells={selectedPatientMobileInfo}
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
