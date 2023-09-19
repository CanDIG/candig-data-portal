import * as React from 'react';

import { useState, useEffect } from 'react';
import { Grid, Button, FormControl, InputLabel, Input, NativeSelect, Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import VariantsTable from 'ui-component/Tables/VariantsTable';
import { SearchIndicator } from 'ui-component/LoadingIndicator/SearchIndicator';
import AlertComponent from 'ui-component/AlertComponent';
import { ListOfReferenceNames } from 'store/constant';
import { trackPromise } from 'ui-component/LoadingIndicator/LoadingIndicator';
import 'assets/css/VariantsSearch.css';
import { searchVariant, fetchFederationClinicalData, htsget } from 'store/api';
import IGViewer from './IGViewer';
// import DropDown from '../../ui-component/DropDown';
import {
    processMCodeMainData,
    processMedicationListData,
    processCondtionsListData,
    processSexListData,
    processCancerTypeListData,
    processHistologicalTypeListData
} from 'store/mcode';

// mui
import { useTheme } from '@mui/styles';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

// NB: This VariantsSearch is currently unused, but is throwing linter errors
// Disabling it for now
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
function VariantsSearch() {
    const [isLoading, setLoading] = useState(true);
    const theme = useTheme();
    const dispatch = useDispatch();
    const events = useSelector((state) => state);

    const [rowData, setRowData] = useState([]);
    const [displayVariantsTable, setDisplayVariantsTable] = useState(false);
    // const { promiseInProgress } = usePromiseTracker();
    const [open, setOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('warning');
    const [isIGVWindowOpen, setIsIGVWindowOpen] = useState(false);
    const [_showIGVButton, setShowIGVButton] = useState(false);
    const [IGVOptions, setIGVOptions] = useState({});
    const [variantSearchOptions, setVariantSearchOptions] = useState({});
    const [patientList, setPatientList] = useState([]);
    const [IGVBaseUrl, setIGVBaseUrl] = useState(`${htsget}/htsget/v1/variants/`);

    // Clinical Search Filter
    const clinicalSearchPatients = useSelector((state) => state.customization.clinicalSearchResultPatients);
    const clinicalSearch = useSelector((state) => state.customization.clinicalSearch);
    const [cancerType, _setCancerType] = React.useState([]);

    // Dropdown patient table open/closed
    const [isListOpenMedications, setListOpenMedications] = React.useState(false);
    const [isListOpenConditions, setListOpenConditions] = React.useState(false);
    const [isListOpenSex, setListOpenSex] = React.useState(false);
    const [isListOpenCancerType, setListOpenCancerType] = React.useState(false);
    const [isListOpenHistological, setListOpenHistological] = React.useState(false);

    // Dropdown patient table filtering current selection in dropdown
    const [selectedMedications, setSelectedMedications] = React.useState(clinicalSearch.clinicalSearchDropDowns.selectedMedications);
    const [selectedConditions, setSelectedConditions] = React.useState(clinicalSearch.clinicalSearchDropDowns.selectedConditions);
    const [selectedSex, setSelectedSex] = React.useState(clinicalSearch.clinicalSearchDropDowns.selectedSex);
    const [selectedCancerType, setSelectedCancerType] = React.useState(clinicalSearch.clinicalSearchDropDowns.selectedCancerType);
    const [selectedHistologicalType, setSelectedHistologicalType] = React.useState(
        clinicalSearch.clinicalSearchDropDowns.selectedHistologicalType
    );

    // Dropdown patient table list for filtering
    const [medicationList, setMedicationList] = React.useState(clinicalSearch.clinicalSearchDropDowns.medicationList);
    const [conditionList, setConditionList] = React.useState(clinicalSearch.clinicalSearchDropDowns.conditionList);
    const [sexList, setSexList] = React.useState(clinicalSearch.clinicalSearchDropDowns.sexList);
    const [cancerTypeList, setCancerTypeList] = React.useState(clinicalSearch.clinicalSearchDropDowns.cancerTypeList);
    const [HistologicalList, setHistologicalList] = React.useState(clinicalSearch.clinicalSearchDropDowns.HistologicalList);

    /*
    Build the dropdown for chromosome
    * @param {None}
    * Return a list of options with chromosome
    */
    function chrSelectBuilder() {
        const refNameList = [];
        ListOfReferenceNames.forEach((refName) => {
            refNameList.push(
                <option key={refName} value={refName}>
                    {refName}
                </option>
            );
        });
        return refNameList;
    }

    function setClincalSearchPatients(data) {
        dispatch({
            type: 'SET_CLINICAL_SEARCH_PATIENTS',
            payload: {
                data
            }
        });
    }

    function setRedux(rows) {
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

    // Filtering on cache
    useEffect(() => {
        if (Object.keys(clinicalSearchPatients.data).length !== 0) {
            const tempRows = [];
            const response = clinicalSearchPatients.data;

            for (let j = 0; j < response.results.length; j += 1) {
                for (let i = 0; i < response.results[j].count; i += 1) {
                    // Patient table filtering
                    if (
                        selectedConditions === 'All' &&
                        selectedMedications === 'All' &&
                        selectedSex === 'All' &&
                        selectedCancerType === 'All' &&
                        selectedHistologicalType === 'All'
                    ) {
                        // All patients
                        if (processMCodeMainData(response.results[j].results[i], response.results[j].location[0]).id !== null) {
                            tempRows.push(processMCodeMainData(response.results[j].results[i], response.results[j].location[0]));
                        }
                    } else {
                        // Filtered patients
                        let patientCondition = false;
                        response?.results[j]?.results[i]?.cancer_condition?.body_site?.every((bodySite) => {
                            if (selectedConditions === 'All' || selectedConditions === bodySite.label) {
                                patientCondition = true;
                                return false;
                            }
                            return true;
                        });
                        let patientMedication = false;
                        response?.results[j]?.results[i]?.medication_statement.every((medication) => {
                            if (selectedMedications === 'All' || selectedMedications === medication?.medication_code.label) {
                                patientMedication = true;
                                return false;
                            }
                            return true;
                        });
                        let patientSex = false;
                        if (selectedSex === 'All' || selectedSex === response?.results[j]?.results[i]?.subject.sex) {
                            patientSex = true;
                        }
                        let patientCancerType = false;
                        if (selectedCancerType === 'All') {
                            patientCancerType = true;
                        } else {
                            for (let k = 0; k < cancerType.length; k += 1) {
                                if (
                                    response?.results[j]?.results[i]?.cancer_condition?.code?.id !== undefined &&
                                    response?.results[j]?.results[i]?.cancer_condition?.code?.id === cancerType[k]['Cancer type code']
                                ) {
                                    if (
                                        selectedCancerType ===
                                            `${cancerType[k]['Cancer type label']} ${cancerType[k]['Cancer type code']}` ||
                                        selectedCancerType === 'NA'
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
                                    response?.results[j]?.results[i]?.cancer_condition?.histology_morphology_behavior?.id !== undefined &&
                                    response?.results[j]?.results[i]?.cancer_condition?.histology_morphology_behavior?.id ===
                                        cancerType[k]['Tumour histological type code']
                                ) {
                                    if (
                                        selectedHistologicalType ===
                                            `${cancerType[k]['Tumour histological type label']} ${cancerType[k]['Tumour histological type code']}` ||
                                        selectedHistologicalType === 'NA'
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
                            processMCodeMainData(response.results[j].results[i]).id !== null
                        ) {
                            tempRows.push(processMCodeMainData(response.results[j].results[i], response.results[j].location[0]));
                        }
                    }
                }
            }
            const tempClinicalSearchResults = [];
            tempRows.forEach((patient) => {
                tempClinicalSearchResults.push({ id: patient.id, genomicId: patient.genomic_id });
            });

            setPatientList(tempClinicalSearchResults);
            // Dropdown patient table list for filtering
            setMedicationList(processMedicationListData(response.results));
            setConditionList(processCondtionsListData(response.results));
            setSexList(processSexListData(response.results));
            setCancerTypeList(processCancerTypeListData(response.results));
            setHistologicalList(processHistologicalTypeListData(response.results));
            setLoading(false);

            setRedux(tempRows);
        }
    }, [selectedSex, selectedConditions, selectedMedications, selectedCancerType, selectedHistologicalType]);

    useEffect(() => {
        setLoading(true);
        setDisplayVariantsTable(false);
        // get patient data from redux store or fetch it
        if (Object.keys(clinicalSearch.selectedClinicalSearchResults).length !== 0) {
            setPatientList(clinicalSearch.selectedClinicalSearchResults);
        }
        trackPromise(
            fetchFederationClinicalData('/api/mcodepackets').then((response) => {
                const patientData = [];
                setClincalSearchPatients(response);
                response.results.forEach((result) => {
                    result.results.forEach((patient) => {
                        patientData.push({
                            id: patient.id,
                            genomicId: patient.genomics_report?.extra_properties?.genomic_id ?? 'NA'
                        });
                    });
                });

                const tempRows = [];
                for (let j = 0; j < response.results.length; j += 1) {
                    for (let i = 0; i < response.results[j].count; i += 1) {
                        // Patient table filtering
                        if (
                            selectedConditions === 'All' &&
                            selectedMedications === 'All' &&
                            selectedSex === 'All' &&
                            selectedCancerType === 'All' &&
                            selectedHistologicalType === 'All'
                        ) {
                            // All patients
                            if (processMCodeMainData(response.results[j].results[i], response.results[j].location[0]).id !== null) {
                                tempRows.push(processMCodeMainData(response.results[j].results[i], response.results[j].location[0]));
                            }
                        } else {
                            // Filtered patients
                            let patientCondition = false;
                            response?.results[j]?.results[i]?.cancer_condition?.body_site?.every((bodySite) => {
                                if (selectedConditions === 'All' || selectedConditions === bodySite.label) {
                                    patientCondition = true;
                                    return false;
                                }
                                return true;
                            });
                            let patientMedication = false;
                            response?.results[j]?.results[i]?.medication_statement.every((medication) => {
                                if (selectedMedications === 'All' || selectedMedications === medication?.medication_code.label) {
                                    patientMedication = true;
                                    return false;
                                }
                                return true;
                            });
                            let patientSex = false;
                            if (selectedSex === 'All' || selectedSex === response?.results[j]?.results[i]?.subject.sex) {
                                patientSex = true;
                            }
                            let patientCancerType = false;
                            if (selectedCancerType === 'All') {
                                patientCancerType = true;
                            } else {
                                for (let k = 0; k < cancerType.length; k += 1) {
                                    if (
                                        response?.results[j]?.results[i]?.cancer_condition?.code?.id !== undefined &&
                                        response?.results[j]?.results[i]?.cancer_condition?.code?.id === cancerType[k]['Cancer type code']
                                    ) {
                                        if (
                                            selectedCancerType ===
                                                `${cancerType[k]['Cancer type label']} ${cancerType[k]['Cancer type code']}` ||
                                            selectedCancerType === 'NA'
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
                                        response?.results[j]?.results[i]?.cancer_condition?.histology_morphology_behavior?.id !==
                                            undefined &&
                                        response?.results[j]?.results[i]?.cancer_condition?.histology_morphology_behavior?.id ===
                                            cancerType[k]['Tumour histological type code']
                                    ) {
                                        if (
                                            selectedHistologicalType ===
                                                `${cancerType[k]['Tumour histological type label']} ${cancerType[k]['Tumour histological type code']}` ||
                                            selectedHistologicalType === 'NA'
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
                                processMCodeMainData(response.results[j].results[i]).id !== null
                            ) {
                                tempRows.push(processMCodeMainData(response.results[j].results[i], response.results[j].location[0]));
                            }
                        }
                    }
                }
                const tempClinicalSearchResults = [];
                tempRows.forEach((patient) => {
                    tempClinicalSearchResults.push({ id: patient.id, genomicId: patient.genomic_id });
                });

                setPatientList(tempClinicalSearchResults ?? patientData);
                // Dropdown patient table list for filtering
                setMedicationList(processMedicationListData(response.results));
                setConditionList(processCondtionsListData(response.results));
                setSexList(processSexListData(response.results));
                setCancerTypeList(processCancerTypeListData(response.results));
                setHistologicalList(processHistologicalTypeListData(response.results));
                setLoading(false);

                setRedux(tempRows);
            }),
            'patientBox'
        );
    }, []);

    /**
     * This function handles the Search button
     * It calls the searchVariant function from api.js according to the chromosome and position
     * then compares the result with the patientList genomicID to find the matching patient
     */
    const formHandler = (e) => {
        e.preventDefault(); // Prevent form submission
        setDisplayVariantsTable(false);
        const referenceName = e.target.genome.value;
        const chromosome = e.target.chromosome.value;
        const start = e.target.start.value;
        const end = e.target.end.value;
        setVariantSearchOptions({ referenceName, chromosome, start, end });
        trackPromise(
            searchVariant(chromosome, start, end)
                .then((response) => {
                    const locationObjs = response.results;
                    if (Object.keys(locationObjs).length === 0) {
                        setAlertMessage('No variants found');
                        setAlertSeverity('warning');
                        setOpen(true);
                    } else {
                        const variantList = [];
                        locationObjs.forEach((location) => {
                            location.results.forEach((item) =>
                                variantList.push({
                                    id: item.id,
                                    genomicId: item.genomic_id,
                                    locationName: location.location[0],
                                    referenceName: item.reference_genome,
                                    variantCount: item.variantcount,
                                    samples: item.samples,
                                    url: item.urls[0] // only one url unless the requirement changes
                                })
                            );
                        });
                        // Build display table
                        const displayData = [];
                        for (let i = 0; i < variantList.length; i += 1) {
                            for (let j = 0; j < patientList.length; j += 1) {
                                if (variantList[i].genomicId === patientList[j].genomicId) {
                                    displayData.push({
                                        patientId: patientList[j].id,
                                        locationName: variantList[i].locationName,
                                        genomicSampleId: variantList[i].genomicId,
                                        variantCount: variantList[i].variantCount,
                                        samples: variantList[i].samples,
                                        VCFFile: variantList[i].id
                                    });
                                    // get the url part before the file name for IGV
                                    const url = variantList[i].url;
                                    const urlParts = url.substring(0, url.lastIndexOf('/') + 1);
                                    setIGVBaseUrl(urlParts);
                                    break; // should have only 1 match, so we can break here
                                }
                            }
                        }
                        setRowData(displayData);
                        setDisplayVariantsTable(true);
                    }
                })
                .catch((error) => {
                    setAlertMessage(error.message);
                    setAlertSeverity('error');
                    setOpen(true);
                }),
            'table'
        );
    };

    const toggleIGVWindow = () => {
        setIsIGVWindowOpen(!isIGVWindowOpen);
    };

    /**
     * This function keeps track of the selected row in the table
     * then it creates the IGV options to send to the IGV window
     */
    const onCheckboxSelectionChanged = (value) => {
        if (value.length === 0) {
            setShowIGVButton(false);
        } else {
            setShowIGVButton(true);
        }
        const trackList = [];
        for (let i = 0; i < value.length; i += 1) {
            trackList.push({
                name: value[i]['Patient ID'],
                type: 'variant',
                format: 'vcf',
                sourceType: 'htsget',
                url: `${IGVBaseUrl}${value[i]['VCF File']}`
            });
        }
        const options = {
            genome: 'hg38',
            locus: `${variantSearchOptions.chromosome}:${variantSearchOptions.start}-${variantSearchOptions.end}`,
            tracks: trackList
        };
        setIGVOptions(options);
    };

    return (
        <>
            <AlertComponent
                open={open}
                setOpen={setOpen}
                text={alertMessage}
                severity={alertSeverity}
                variant="filled"
                fontColor={alertSeverity === 'error' ? 'white' : 'black'}
            />
            {!isLoading ? (
                <Grid container direction="row">
                    <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2}>
                        <Box mr={2} ml={1} p={1} pr={5} sx={{ border: 1, borderRadius: 2 }}>
                            <span style={{ color: theme.palette.primary.main }}>
                                <b>Total Patients</b>
                            </span>
                            <br />
                            <span>{patientList.length}</span>
                        </Box>
                        <form onSubmit={formHandler} style={{ justifyContent: 'center' }}>
                            <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} spacing={2}>
                                <Box mr={2} ml={1} p={1} pr={5}>
                                    <FormControl fullWidth variant="standard">
                                        <InputLabel id="ref-gene-label">Reference Genome</InputLabel>
                                        <NativeSelect required id="genome">
                                            <option value="gh38">gh38</option>
                                            <option value="gh37">gh37</option>
                                        </NativeSelect>
                                    </FormControl>
                                </Box>
                                <Box mr={2} ml={1} p={1} pr={5}>
                                    <FormControl fullWidth variant="standard">
                                        <InputLabel id="chr-label">Chromosome</InputLabel>
                                        <NativeSelect required id="chromosome">
                                            {chrSelectBuilder()}
                                        </NativeSelect>
                                    </FormControl>
                                </Box>
                                <Box mr={2} ml={1} p={1} pr={5}>
                                    <FormControl variant="standard">
                                        <InputLabel>Start</InputLabel>
                                        <Input required type="number" id="start" />
                                    </FormControl>
                                </Box>
                                <Box mr={2} ml={1} p={1} pr={5}>
                                    <FormControl variant="standard">
                                        <InputLabel>End</InputLabel>
                                        <Input required type="number" id="end" />
                                    </FormControl>
                                </Box>
                                <Box mr={2} ml={1} p={1} pr={5}>
                                    <FormControl variant="standard">
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            sx={{ borderRadius: events.customization.borderRadius * 0.15 }}
                                        >
                                            Search
                                        </Button>
                                    </FormControl>
                                </Box>
                            </Stack>
                        </form>
                    </Stack>
                </Grid>
            ) : (
                <SearchIndicator area="patientBox" />
            )}

            {displayVariantsTable ? (
                <VariantsTable rowData={rowData} onChange={onCheckboxSelectionChanged} />
            ) : (
                <SearchIndicator area="table" />
            )}

            {isIGVWindowOpen && <IGViewer closeWindow={toggleIGVWindow} options={IGVOptions} />}
        </>
    );
}
/* eslint-enable no-unused-vars */
/* eslint-enable react-hooks/exhaustive-deps */

export default VariantsSearch;
