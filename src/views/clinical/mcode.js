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
    processCancerTypeListData
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
    const events = useSelector((state) => state);
    const dispatch = useDispatch();

    const [mcodeData, setMcodeData] = React.useState([]);
    const [rows, setRows] = React.useState([]);
    const [clinicalSearchResults, setClinicalSearchResults] = React.useState(events.customization.selectedClinicalSearchResults);
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

    // Dropdown patient table filtering current selection in dropdown
    const [selectedMedications, setSelectedMedications] = React.useState('All');
    const [selectedConditions, setSelectedConditions] = React.useState('All');
    const [selectedSex, setSelectedSex] = React.useState('All');
    const [selectedCancerType, setSelectedCancerType] = React.useState('All');
    const [patientJSON, setPatientJSON] = React.useState([]);

    // Dropdown patient table list for filtering
    const [medicationList, setMedicationList] = React.useState([]);
    const [conditionList, setConditionList] = React.useState([]);
    const [sexList, setSexList] = React.useState([]);
    const [cancerTypeList, setCancerTypeList] = React.useState([]);

    const jsonTheme = {
        base00: 'white',
        base01: '#ddd',
        base02: '#ddd',
        base03: 'black',
        base04: '#1E88E5',
        base05: 'black',
        base06: 'black',
        base07: '#444',
        base08: '#444',
        base09: '#1565C0',
        base0A: '#1565C0',
        base0B: '#1565C0',
        base0C: '#1565C0',
        base0D: '#1565C0',
        base0E: '#1565C0',
        base0F: '#1565C0'
    };

    const testData = {
        message: [],
        results: [
            {
                count: 19,
                location: ['BCGSC', 'British Columbia', 'ca-bc'],
                next: null,
                previous: null,
                results: [
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0002',
                                    label: 'Breast'
                                }
                            ],
                            code: {
                                id: 'C50.9',
                                label: 'Breast'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:13.969316Z',
                            date_of_diagnosis: '2013-07-11T00:00:00Z',
                            id: 'SET3_UBU003-0',
                            updated: '2022-10-11T17:35:13.969330Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:359746009',
                            label: "Patient's condition stable (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:13.977987Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:13.965810Z',
                            extra_properties: {
                                genomic_id: 'HG00097'
                            },
                            id: 'SET3_UBU003',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:13.965826Z'
                        },
                        id: 'SET3_UBU003',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:13.973553Z',
                                end_date: '2020-01-11T00:00:00Z',
                                id: 'SET3_UBU003-med2',
                                medication_code: {
                                    id: 'RXCUI:32592',
                                    label: 'oxaliplatin'
                                },
                                start_date: '2019-10-01T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:13.973566Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:13.936716Z',
                            date_of_birth: '1981-03-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU003',
                            sex: 'female',
                            updated: '2022-10-11T17:35:13.936734Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:13.978003Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'C25.9',
                                label: 'Pancreas'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:13.991215Z',
                            date_of_diagnosis: '2015-02-06T00:00:00Z',
                            id: 'SET3_UBU006-0',
                            updated: '2022-10-11T17:35:13.991229Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:359746009',
                            label: "Patient's condition stable (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:13.999061Z',
                        date_of_death: '2020-07-07',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:13.988421Z',
                            id: 'SET3_UBU006',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:13.988434Z'
                        },
                        id: 'SET3_UBU006',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:13.994798Z',
                                end_date: '2020-02-14T00:00:00Z',
                                id: 'SET3_UBU006-med5',
                                medication_code: {
                                    id: 'RXCUI:4492',
                                    label: 'fluorouracil'
                                },
                                start_date: '2019-10-14T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:13.994811Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:13.985204Z',
                            date_of_birth: '1950-05-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 0',
                                label: 'Fully active, able to carry on all pre-disease performance without restriction'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU006',
                            sex: 'male',
                            updated: '2022-10-11T17:35:13.985218Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:13.999076Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'Ovary'
                                }
                            ],
                            code: {
                                id: 'C56.9',
                                label: 'Ovary'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.010176Z',
                            date_of_diagnosis: '2015-03-01T00:00:00Z',
                            id: 'SET3_UBU009-0',
                            updated: '2022-10-11T17:35:14.010190Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:359746009',
                            label: "Patient's condition stable (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.017284Z',
                        date_of_death: '2020-07-17',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.007362Z',
                            extra_properties: {
                                genomic_id: 'HG00100'
                            },
                            id: 'SET3_UBU009',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.007375Z'
                        },
                        id: 'SET3_UBU009',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.013727Z',
                                end_date: '2020-02-17T00:00:00Z',
                                id: 'SET3_UBU009-med8',
                                medication_code: {
                                    id: 'RXCUI:51499',
                                    label: 'irinotecan'
                                },
                                start_date: '2019-10-14T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.013740Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.004096Z',
                            date_of_birth: '1954-09-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU009',
                            sex: 'female',
                            updated: '2022-10-11T17:35:14.004110Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.017299Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'C56.9',
                                label: 'Ovary'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.028057Z',
                            date_of_diagnosis: '2014-05-22T00:00:00Z',
                            id: 'SET3_UBU012-0',
                            updated: '2022-10-11T17:35:14.028071Z'
                        },
                        cancer_disease_status: {
                            id: 'USCRS-352237',
                            label: 'Cancer in partial remission (finding)'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.035309Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.025446Z',
                            extra_properties: {
                                genomic_id: 'HG00104'
                            },
                            id: 'SET3_UBU012',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.025459Z'
                        },
                        id: 'SET3_UBU012',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.031246Z',
                                end_date: '2020-03-28T00:00:00Z',
                                id: 'SET3_UBU012-med11',
                                medication_code: {
                                    id: 'RXCUI:6313',
                                    label: 'leucovorin'
                                },
                                start_date: '2019-10-28T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.031260Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.022282Z',
                            date_of_birth: '1967-04-01',
                            deceased: true,
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU012',
                            sex: 'female',
                            updated: '2022-10-11T17:35:14.022299Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.035324Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'C50.9',
                                label: 'Breast'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.046078Z',
                            date_of_diagnosis: '2016-01-07T00:00:00Z',
                            id: 'SET3_UBU015-0',
                            updated: '2022-10-11T17:35:14.046092Z'
                        },
                        cancer_disease_status: {
                            id: 'USCRS-352237',
                            label: 'Cancer in partial remission (finding)'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.053873Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.042987Z',
                            extra_properties: {
                                genomic_id: 'HG00123'
                            },
                            id: 'SET3_UBU015',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.043001Z'
                        },
                        id: 'SET3_UBU015',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.049771Z',
                                end_date: '2019-12-18T00:00:00Z',
                                id: 'SET3_UBU015-med14',
                                medication_code: {
                                    id: 'RXCUI:32592',
                                    label: 'oxaliplatin'
                                },
                                start_date: '2019-07-18T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.049785Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.039868Z',
                            date_of_birth: '1963-06-01',
                            deceased: true,
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU015',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.039883Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.053919Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'C56.9',
                                label: 'Ovary'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.066053Z',
                            date_of_diagnosis: '2016-12-31T00:00:00Z',
                            id: 'SET3_UBU018-0',
                            updated: '2022-10-11T17:35:14.066067Z'
                        },
                        cancer_disease_status: {
                            id: 'USCRS-352237',
                            label: 'Cancer in partial remission (finding)'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.072629Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.063272Z',
                            id: 'SET3_UBU018',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.063284Z'
                        },
                        id: 'SET3_UBU018',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.068909Z',
                                id: 'SET3_UBU018-med17',
                                medication_code: {
                                    id: 'RXCUI:4492',
                                    label: 'fluorouracil'
                                },
                                start_date: '2019-08-01T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.068935Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.059804Z',
                            date_of_birth: '1949-06-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU018',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.059833Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.072644Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'C50.9',
                                label: 'Breast'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.083484Z',
                            date_of_diagnosis: '2013-11-14T00:00:00Z',
                            id: 'SET3_UBU021-0',
                            updated: '2022-10-11T17:35:14.083498Z'
                        },
                        cancer_disease_status: {
                            id: 'USCRS-352237',
                            label: 'Cancer in partial remission (finding)'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.090487Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.080764Z',
                            extra_properties: {
                                genomic_id: 'HG00234'
                            },
                            id: 'SET3_UBU021',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.080778Z'
                        },
                        id: 'SET3_UBU021',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.086351Z',
                                id: 'SET3_UBU021-med20',
                                medication_code: {
                                    id: 'RXCUI:6313',
                                    label: 'leucovorin'
                                },
                                start_date: '2019-08-01T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.086363Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.077645Z',
                            date_of_birth: '1946-10-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU021',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.077660Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.090503Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'C25.9',
                                label: 'Pancreas'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.101086Z',
                            date_of_diagnosis: '2013-09-01T00:00:00Z',
                            id: 'SET3_UBU024-0',
                            updated: '2022-10-11T17:35:14.101100Z'
                        },
                        cancer_disease_status: {
                            id: 'USCRS-352237',
                            label: 'Cancer in partial remission (finding)'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.108039Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.098439Z',
                            extra_properties: {
                                genomic_id: 'HG00101'
                            },
                            id: 'SET3_UBU024',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.098456Z'
                        },
                        id: 'SET3_UBU024',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.104119Z',
                                id: 'SET3_UBU024-med23',
                                medication_code: {
                                    id: 'RXCUI:6313',
                                    label: 'leucovorin'
                                },
                                start_date: '2019-07-04T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.104132Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.095225Z',
                            date_of_birth: '1943-01-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 0',
                                label: 'Fully active, able to carry on all pre-disease performance without restriction'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU024',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.095240Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.108054Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.120064Z',
                            date_of_diagnosis: '2014-10-27T00:00:00Z',
                            id: 'SET3_UBU027-0',
                            updated: '2022-10-11T17:35:14.120087Z'
                        },
                        cancer_disease_status: {
                            id: 'USCRS-352237',
                            label: 'Cancer in partial remission (finding)'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.128186Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.116305Z',
                            extra_properties: {
                                genomic_id: 'HG00155'
                            },
                            id: 'SET3_UBU027',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.116319Z'
                        },
                        id: 'SET3_UBU027',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.123688Z',
                                id: 'SET3_UBU027-med26',
                                medication_code: {
                                    id: 'RXCUI:32592',
                                    label: 'oxaliplatin'
                                },
                                start_date: '2019-04-25T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.123701Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.112776Z',
                            date_of_birth: '1939-03-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU027',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.112790Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.128202Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.139691Z',
                            date_of_diagnosis: '2014-11-11T00:00:00Z',
                            id: 'SET3_UBU030-0',
                            updated: '2022-10-11T17:35:14.139707Z'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.146785Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.136659Z',
                            extra_properties: {
                                genomic_id: 'HG00159'
                            },
                            id: 'SET3_UBU030',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.136673Z'
                        },
                        id: 'SET3_UBU030',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.142953Z',
                                id: 'SET3_UBU030-med29',
                                medication_code: {
                                    id: 'RXCUI:4492',
                                    label: 'fluorouracil'
                                },
                                start_date: '2019-05-09T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.142967Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.133161Z',
                            date_of_birth: '1988-05-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 0',
                                label: 'Fully active, able to carry on all pre-disease performance without restriction'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU030',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.133176Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.146800Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.157949Z',
                            date_of_diagnosis: '2013-11-11T00:00:00Z',
                            id: 'SET3_UBU033-0',
                            updated: '2022-10-11T17:35:14.157962Z'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.164724Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.154808Z',
                            extra_properties: {
                                genomic_id: 'HG00109'
                            },
                            id: 'SET3_UBU033',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.154822Z'
                        },
                        id: 'SET3_UBU033',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.161199Z',
                                id: 'SET3_UBU033-med32',
                                medication_code: {
                                    id: 'RXCUI:51499',
                                    label: 'irinotecan'
                                },
                                start_date: '2019-05-09T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.161213Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.151710Z',
                            date_of_birth: '1950-07-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 0',
                                label: 'Fully active, able to carry on all pre-disease performance without restriction'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU033',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.151724Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.164739Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.177258Z',
                            date_of_diagnosis: '2013-09-17T00:00:00Z',
                            id: 'SET3_UBU036-0',
                            updated: '2022-10-11T17:35:14.177273Z'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.193211Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.172767Z',
                            extra_properties: {
                                genomic_id: 'HG00113'
                            },
                            id: 'SET3_UBU036',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.172781Z'
                        },
                        id: 'SET3_UBU036',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.187966Z',
                                id: 'SET3_UBU036-med35',
                                medication_code: {
                                    id: 'RXCUI:6313',
                                    label: 'leucovorin'
                                },
                                start_date: '2019-05-23T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.187980Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.169592Z',
                            date_of_birth: '1934-11-01',
                            deceased: true,
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU036',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.169606Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.193225Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.208668Z',
                            date_of_diagnosis: '2016-12-23T00:00:00Z',
                            id: 'SET3_UBU039-0',
                            updated: '2022-10-11T17:35:14.208682Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:271299001',
                            label: "Patient's condition worsened (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.220410Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.205598Z',
                            id: 'SET3_UBU039',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.205610Z'
                        },
                        id: 'SET3_UBU039',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.214194Z',
                                id: 'SET3_UBU039-med38',
                                medication_code: {
                                    id: 'RXCUI:32592',
                                    label: 'oxaliplatin'
                                },
                                start_date: '2019-06-06T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.214209Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.199994Z',
                            date_of_birth: '1978-07-01',
                            deceased: true,
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU039',
                            sex: 'female',
                            updated: '2022-10-11T17:35:14.200010Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.220426Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.235312Z',
                            date_of_diagnosis: '2013-05-06T00:00:00Z',
                            id: 'SET3_UBU042-0',
                            updated: '2022-10-11T17:35:14.235328Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:271299001',
                            label: "Patient's condition worsened (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.243604Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.231171Z',
                            extra_properties: {
                                genomic_id: 'HG00127'
                            },
                            id: 'SET3_UBU042',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.231184Z'
                        },
                        id: 'SET3_UBU042',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.239470Z',
                                id: 'SET3_UBU042-med41',
                                medication_code: {
                                    id: 'RXCUI:4492',
                                    label: 'fluorouracil'
                                },
                                start_date: '2019-06-20T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.239483Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.225739Z',
                            date_of_birth: '1976-11-01',
                            deceased: true,
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU042',
                            sex: 'female',
                            updated: '2022-10-11T17:35:14.225753Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.243621Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.256258Z',
                            date_of_diagnosis: '2016-12-31T00:00:00Z',
                            id: 'SET3_UBU045-0',
                            updated: '2022-10-11T17:35:14.256271Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:271299001',
                            label: "Patient's condition worsened (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.264052Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.253193Z',
                            id: 'SET3_UBU045',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.253205Z'
                        },
                        id: 'SET3_UBU045',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.260317Z',
                                id: 'SET3_UBU045-med44',
                                medication_code: {
                                    id: 'RXCUI:51499',
                                    label: 'irinotecan'
                                },
                                start_date: '2019-06-20T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.260329Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.249716Z',
                            date_of_birth: '1946-05-01',
                            deceased: true,
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU045',
                            sex: 'female',
                            updated: '2022-10-11T17:35:14.249730Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.264067Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.276466Z',
                            date_of_diagnosis: '2012-07-13T00:00:00Z',
                            id: 'SET3_UBU048-0',
                            updated: '2022-10-11T17:35:14.276479Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:359746009',
                            label: "Patient's condition stable (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.284318Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.273292Z',
                            extra_properties: {
                                genomic_id: 'HG00118'
                            },
                            id: 'SET3_UBU048',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.273306Z'
                        },
                        id: 'SET3_UBU048',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.279587Z',
                                id: 'SET3_UBU048-med47',
                                medication_code: {
                                    id: 'RXCUI:6313',
                                    label: 'leucovorin'
                                },
                                start_date: '2019-02-15T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.279600Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.269543Z',
                            date_of_birth: '1945-04-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 0',
                                label: 'Fully active, able to carry on all pre-disease performance without restriction'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU048',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.269558Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.284335Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.296587Z',
                            date_of_diagnosis: '2017-07-12T00:00:00Z',
                            id: 'SET3_UBU051-0',
                            updated: '2022-10-11T17:35:14.296601Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:359746009',
                            label: "Patient's condition stable (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.303768Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.292955Z',
                            extra_properties: {
                                genomic_id: 'HG00129'
                            },
                            id: 'SET3_UBU051',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.292972Z'
                        },
                        id: 'SET3_UBU051',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.299596Z',
                                id: 'SET3_UBU051-med50',
                                medication_code: {
                                    id: 'RXCUI:12574',
                                    label: 'gemcitabine'
                                },
                                start_date: '2019-04-11T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.299631Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.289629Z',
                            date_of_birth: '1945-12-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU051',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.289644Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.303783Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.315388Z',
                            date_of_diagnosis: '2015-11-03T00:00:00Z',
                            id: 'SET3_UBU054-0',
                            updated: '2022-10-11T17:35:14.315403Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:359746009',
                            label: "Patient's condition stable (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.322945Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.312524Z',
                            extra_properties: {
                                genomic_id: 'HG00139'
                            },
                            id: 'SET3_UBU054',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.312537Z'
                        },
                        id: 'SET3_UBU054',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.318483Z',
                                id: 'SET3_UBU054-med53',
                                medication_code: {
                                    id: 'RXCUI:12574',
                                    label: 'gemcitabine'
                                },
                                start_date: '2019-01-14T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.318496Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.309026Z',
                            date_of_birth: '1951-09-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU054',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.309041Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.322961Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.335928Z',
                            date_of_diagnosis: '2015-09-29T00:00:00Z',
                            id: 'SET3_UBU057-0',
                            updated: '2022-10-11T17:35:14.335943Z'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.343574Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.332946Z',
                            extra_properties: {
                                genomic_id: 'HG00142'
                            },
                            id: 'SET3_UBU057',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.332961Z'
                        },
                        id: 'SET3_UBU057',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.339529Z',
                                id: 'SET3_UBU057-med56',
                                medication_code: {
                                    id: 'RXCUI:589511',
                                    label: 'Abraxane'
                                },
                                start_date: '2019-01-31T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.339544Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.328822Z',
                            date_of_birth: '1951-11-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_UBU057',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.328836Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.343591Z'
                    }
                ]
            },
            {
                count: 19,
                location: ['UHN', 'Ontario', 'ca-on'],
                next: null,
                previous: null,
                results: [
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:13.969316Z',
                            date_of_diagnosis: '2013-07-11T00:00:00Z',
                            id: 'SET3_UBU003-0',
                            updated: '2022-10-11T17:35:13.969330Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:359746009',
                            label: "Patient's condition stable (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:13.977987Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:13.965810Z',
                            extra_properties: {
                                genomic_id: 'HG00097'
                            },
                            id: 'SET3_UBU003',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:13.965826Z'
                        },
                        id: 'SET3_COU003',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:13.973553Z',
                                end_date: '2020-01-11T00:00:00Z',
                                id: 'SET3_UBU003-med2',
                                medication_code: {
                                    id: 'RXCUI:32592',
                                    label: 'oxaliplatin'
                                },
                                start_date: '2019-10-01T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:13.973566Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:13.936716Z',
                            date_of_birth: '1981-03-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU003',
                            sex: 'female',
                            updated: '2022-10-11T17:35:13.936734Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:13.978003Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:13.991215Z',
                            date_of_diagnosis: '2015-02-06T00:00:00Z',
                            id: 'SET3_COU006-0',
                            updated: '2022-10-11T17:35:13.991229Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:359746009',
                            label: "Patient's condition stable (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:13.999061Z',
                        date_of_death: '2020-07-07',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:13.988421Z',
                            id: 'SET3_COU006',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:13.988434Z'
                        },
                        id: 'SET3_COU006',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:13.994798Z',
                                end_date: '2020-02-14T00:00:00Z',
                                id: 'SET3_COU006-med5',
                                medication_code: {
                                    id: 'RXCUI:4492',
                                    label: 'fluorouracil'
                                },
                                start_date: '2019-10-14T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:13.994811Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:13.985204Z',
                            date_of_birth: '1950-05-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 0',
                                label: 'Fully active, able to carry on all pre-disease performance without restriction'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU006',
                            sex: 'male',
                            updated: '2022-10-11T17:35:13.985218Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:13.999076Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.010176Z',
                            date_of_diagnosis: '2015-03-01T00:00:00Z',
                            id: 'SET3_COU009-0',
                            updated: '2022-10-11T17:35:14.010190Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:359746009',
                            label: "Patient's condition stable (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.017284Z',
                        date_of_death: '2020-07-17',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.007362Z',
                            extra_properties: {
                                genomic_id: 'HG00100'
                            },
                            id: 'SET3_COU009',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.007375Z'
                        },
                        id: 'SET3_COU009',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.013727Z',
                                end_date: '2020-02-17T00:00:00Z',
                                id: 'SET3_COU009-med8',
                                medication_code: {
                                    id: 'RXCUI:51499',
                                    label: 'irinotecan'
                                },
                                start_date: '2019-10-14T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.013740Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.004096Z',
                            date_of_birth: '1954-09-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU009',
                            sex: 'female',
                            updated: '2022-10-11T17:35:14.004110Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.017299Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.028057Z',
                            date_of_diagnosis: '2014-05-22T00:00:00Z',
                            id: 'SET3_COU012-0',
                            updated: '2022-10-11T17:35:14.028071Z'
                        },
                        cancer_disease_status: {
                            id: 'USCRS-352237',
                            label: 'Cancer in partial remission (finding)'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.035309Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.025446Z',
                            extra_properties: {
                                genomic_id: 'HG00104'
                            },
                            id: 'SET3_COU012',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.025459Z'
                        },
                        id: 'SET3_COU012',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.031246Z',
                                end_date: '2020-03-28T00:00:00Z',
                                id: 'SET3_COU012-med11',
                                medication_code: {
                                    id: 'RXCUI:6313',
                                    label: 'leucovorin'
                                },
                                start_date: '2019-10-28T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.031260Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.022282Z',
                            date_of_birth: '1967-04-01',
                            deceased: true,
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU012',
                            sex: 'female',
                            updated: '2022-10-11T17:35:14.022299Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.035324Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.046078Z',
                            date_of_diagnosis: '2016-01-07T00:00:00Z',
                            id: 'SET3_COU015-0',
                            updated: '2022-10-11T17:35:14.046092Z'
                        },
                        cancer_disease_status: {
                            id: 'USCRS-352237',
                            label: 'Cancer in partial remission (finding)'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.053873Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.042987Z',
                            extra_properties: {
                                genomic_id: 'HG00123'
                            },
                            id: 'SET3_COU015',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.043001Z'
                        },
                        id: 'SET3_COU015',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.049771Z',
                                end_date: '2019-12-18T00:00:00Z',
                                id: 'SET3_COU015-med14',
                                medication_code: {
                                    id: 'RXCUI:32592',
                                    label: 'oxaliplatin'
                                },
                                start_date: '2019-07-18T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.049785Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.039868Z',
                            date_of_birth: '1963-06-01',
                            deceased: true,
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU015',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.039883Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.053919Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.066053Z',
                            date_of_diagnosis: '2016-12-31T00:00:00Z',
                            id: 'SET3_COU018-0',
                            updated: '2022-10-11T17:35:14.066067Z'
                        },
                        cancer_disease_status: {
                            id: 'USCRS-352237',
                            label: 'Cancer in partial remission (finding)'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.072629Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.063272Z',
                            id: 'SET3_COU018',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.063284Z'
                        },
                        id: 'SET3_COU018',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.068909Z',
                                id: 'SET3_COU018-med17',
                                medication_code: {
                                    id: 'RXCUI:4492',
                                    label: 'fluorouracil'
                                },
                                start_date: '2019-08-01T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.068935Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.059804Z',
                            date_of_birth: '1949-06-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU018',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.059833Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.072644Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.083484Z',
                            date_of_diagnosis: '2013-11-14T00:00:00Z',
                            id: 'SET3_COU021-0',
                            updated: '2022-10-11T17:35:14.083498Z'
                        },
                        cancer_disease_status: {
                            id: 'USCRS-352237',
                            label: 'Cancer in partial remission (finding)'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.090487Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.080764Z',
                            extra_properties: {
                                genomic_id: 'HG00234'
                            },
                            id: 'SET3_COU021',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.080778Z'
                        },
                        id: 'SET3_COU021',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.086351Z',
                                id: 'SET3_COU021-med20',
                                medication_code: {
                                    id: 'RXCUI:6313',
                                    label: 'leucovorin'
                                },
                                start_date: '2019-08-01T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.086363Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.077645Z',
                            date_of_birth: '1946-10-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU021',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.077660Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.090503Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.101086Z',
                            date_of_diagnosis: '2013-09-01T00:00:00Z',
                            id: 'SET3_COU024-0',
                            updated: '2022-10-11T17:35:14.101100Z'
                        },
                        cancer_disease_status: {
                            id: 'USCRS-352237',
                            label: 'Cancer in partial remission (finding)'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.108039Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.098439Z',
                            extra_properties: {
                                genomic_id: 'HG00101'
                            },
                            id: 'SET3_COU024',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.098456Z'
                        },
                        id: 'SET3_COU024',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.104119Z',
                                id: 'SET3_COU024-med23',
                                medication_code: {
                                    id: 'RXCUI:6313',
                                    label: 'leucovorin'
                                },
                                start_date: '2019-07-04T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.104132Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.095225Z',
                            date_of_birth: '1943-01-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 0',
                                label: 'Fully active, able to carry on all pre-disease performance without restriction'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU024',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.095240Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.108054Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.120064Z',
                            date_of_diagnosis: '2014-10-27T00:00:00Z',
                            id: 'SET3_COU027-0',
                            updated: '2022-10-11T17:35:14.120087Z'
                        },
                        cancer_disease_status: {
                            id: 'USCRS-352237',
                            label: 'Cancer in partial remission (finding)'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.128186Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.116305Z',
                            extra_properties: {
                                genomic_id: 'HG00155'
                            },
                            id: 'SET3_COU027',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.116319Z'
                        },
                        id: 'SET3_COU027',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.123688Z',
                                id: 'SET3_COU027-med26',
                                medication_code: {
                                    id: 'RXCUI:32592',
                                    label: 'oxaliplatin'
                                },
                                start_date: '2019-04-25T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.123701Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.112776Z',
                            date_of_birth: '1939-03-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU027',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.112790Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.128202Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.139691Z',
                            date_of_diagnosis: '2014-11-11T00:00:00Z',
                            id: 'SET3_COU030-0',
                            updated: '2022-10-11T17:35:14.139707Z'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.146785Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.136659Z',
                            extra_properties: {
                                genomic_id: 'HG00159'
                            },
                            id: 'SET3_COU030',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.136673Z'
                        },
                        id: 'SET3_COU030',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.142953Z',
                                id: 'SET3_COU030-med29',
                                medication_code: {
                                    id: 'RXCUI:4492',
                                    label: 'fluorouracil'
                                },
                                start_date: '2019-05-09T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.142967Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.133161Z',
                            date_of_birth: '1988-05-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 0',
                                label: 'Fully active, able to carry on all pre-disease performance without restriction'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU030',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.133176Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.146800Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.157949Z',
                            date_of_diagnosis: '2013-11-11T00:00:00Z',
                            id: 'SET3_COU033-0',
                            updated: '2022-10-11T17:35:14.157962Z'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.164724Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.154808Z',
                            extra_properties: {
                                genomic_id: 'HG00109'
                            },
                            id: 'SET3_COU033',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.154822Z'
                        },
                        id: 'SET3_COU033',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.161199Z',
                                id: 'SET3_COU033-med32',
                                medication_code: {
                                    id: 'RXCUI:51499',
                                    label: 'irinotecan'
                                },
                                start_date: '2019-05-09T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.161213Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.151710Z',
                            date_of_birth: '1950-07-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 0',
                                label: 'Fully active, able to carry on all pre-disease performance without restriction'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU033',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.151724Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.164739Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.177258Z',
                            date_of_diagnosis: '2013-09-17T00:00:00Z',
                            id: 'SET3_COU036-0',
                            updated: '2022-10-11T17:35:14.177273Z'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.193211Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.172767Z',
                            extra_properties: {
                                genomic_id: 'HG00113'
                            },
                            id: 'SET3_COU036',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.172781Z'
                        },
                        id: 'SET3_COU036',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.187966Z',
                                id: 'SET3_COU036-med35',
                                medication_code: {
                                    id: 'RXCUI:6313',
                                    label: 'leucovorin'
                                },
                                start_date: '2019-05-23T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.187980Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.169592Z',
                            date_of_birth: '1934-11-01',
                            deceased: true,
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU036',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.169606Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.193225Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.208668Z',
                            date_of_diagnosis: '2016-12-23T00:00:00Z',
                            id: 'SET3_COU039-0',
                            updated: '2022-10-11T17:35:14.208682Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:271299001',
                            label: "Patient's condition worsened (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.220410Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.205598Z',
                            id: 'SET3_COU039',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.205610Z'
                        },
                        id: 'SET3_COU039',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.214194Z',
                                id: 'SET3_COU039-med38',
                                medication_code: {
                                    id: 'RXCUI:32592',
                                    label: 'oxaliplatin'
                                },
                                start_date: '2019-06-06T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.214209Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.199994Z',
                            date_of_birth: '1978-07-01',
                            deceased: true,
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU039',
                            sex: 'female',
                            updated: '2022-10-11T17:35:14.200010Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.220426Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.235312Z',
                            date_of_diagnosis: '2013-05-06T00:00:00Z',
                            id: 'SET3_COU042-0',
                            updated: '2022-10-11T17:35:14.235328Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:271299001',
                            label: "Patient's condition worsened (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.243604Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.231171Z',
                            extra_properties: {
                                genomic_id: 'HG00127'
                            },
                            id: 'SET3_COU042',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.231184Z'
                        },
                        id: 'SET3_COU042',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.239470Z',
                                id: 'SET3_COU042-med41',
                                medication_code: {
                                    id: 'RXCUI:4492',
                                    label: 'fluorouracil'
                                },
                                start_date: '2019-06-20T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.239483Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.225739Z',
                            date_of_birth: '1976-11-01',
                            deceased: true,
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU042',
                            sex: 'female',
                            updated: '2022-10-11T17:35:14.225753Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.243621Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.256258Z',
                            date_of_diagnosis: '2016-12-31T00:00:00Z',
                            id: 'SET3_COU045-0',
                            updated: '2022-10-11T17:35:14.256271Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:271299001',
                            label: "Patient's condition worsened (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.264052Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.253193Z',
                            id: 'SET3_COU045',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.253205Z'
                        },
                        id: 'SET3_COU045',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.260317Z',
                                id: 'SET3_COU045-med44',
                                medication_code: {
                                    id: 'RXCUI:51499',
                                    label: 'irinotecan'
                                },
                                start_date: '2019-06-20T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.260329Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.249716Z',
                            date_of_birth: '1946-05-01',
                            deceased: true,
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU045',
                            sex: 'female',
                            updated: '2022-10-11T17:35:14.249730Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.264067Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.276466Z',
                            date_of_diagnosis: '2012-07-13T00:00:00Z',
                            id: 'SET3_COU048-0',
                            updated: '2022-10-11T17:35:14.276479Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:359746009',
                            label: "Patient's condition stable (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.284318Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.273292Z',
                            extra_properties: {
                                genomic_id: 'HG00118'
                            },
                            id: 'SET3_COU048',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.273306Z'
                        },
                        id: 'SET3_COU048',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.279587Z',
                                id: 'SET3_COU048-med47',
                                medication_code: {
                                    id: 'RXCUI:6313',
                                    label: 'leucovorin'
                                },
                                start_date: '2019-02-15T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.279600Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.269543Z',
                            date_of_birth: '1945-04-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 0',
                                label: 'Fully active, able to carry on all pre-disease performance without restriction'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU048',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.269558Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.284335Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.296587Z',
                            date_of_diagnosis: '2017-07-12T00:00:00Z',
                            id: 'SET3_COU051-0',
                            updated: '2022-10-11T17:35:14.296601Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:359746009',
                            label: "Patient's condition stable (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.303768Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.292955Z',
                            extra_properties: {
                                genomic_id: 'HG00129'
                            },
                            id: 'SET3_COU051',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.292972Z'
                        },
                        id: 'SET3_COU051',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.299596Z',
                                id: 'SET3_COU051-med50',
                                medication_code: {
                                    id: 'RXCUI:12574',
                                    label: 'gemcitabine'
                                },
                                start_date: '2019-04-11T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.299631Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.289629Z',
                            date_of_birth: '1945-12-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU051',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.289644Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.303783Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.315388Z',
                            date_of_diagnosis: '2015-11-03T00:00:00Z',
                            id: 'SET3_COU054-0',
                            updated: '2022-10-11T17:35:14.315403Z'
                        },
                        cancer_disease_status: {
                            id: 'SNOMED:359746009',
                            label: "Patient's condition stable (finding)"
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.322945Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.312524Z',
                            extra_properties: {
                                genomic_id: 'HG00139'
                            },
                            id: 'SET3_COU054',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.312537Z'
                        },
                        id: 'SET3_COU054',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.318483Z',
                                id: 'SET3_COU054-med53',
                                medication_code: {
                                    id: 'RXCUI:12574',
                                    label: 'gemcitabine'
                                },
                                start_date: '2019-01-14T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.318496Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.309026Z',
                            date_of_birth: '1951-09-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU054',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.309041Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.322961Z'
                    },
                    {
                        cancer_condition: {
                            body_site: [
                                {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                }
                            ],
                            code: {
                                id: 'SNOMED:103329007',
                                label: 'Not available'
                            },
                            condition_type: 'primary',
                            created: '2022-10-11T17:35:14.335928Z',
                            date_of_diagnosis: '2015-09-29T00:00:00Z',
                            id: 'SET3_COU057-0',
                            updated: '2022-10-11T17:35:14.335943Z'
                        },
                        cancer_related_procedures: [],
                        created: '2022-10-11T17:35:14.343574Z',
                        genomics_report: {
                            code: {
                                id: 'UNK:0000',
                                label: 'abcd'
                            },
                            created: '2022-10-11T17:35:14.332946Z',
                            extra_properties: {
                                genomic_id: 'HG00142'
                            },
                            id: 'SET3_COU057',
                            issued: '2022-04-05T00:00:00Z',
                            performing_organization_name: 'org',
                            updated: '2022-10-11T17:35:14.332961Z'
                        },
                        id: 'SET3_COU057',
                        medication_statement: [
                            {
                                created: '2022-10-11T17:35:14.339529Z',
                                id: 'SET3_COU057-med56',
                                medication_code: {
                                    id: 'RXCUI:589511',
                                    label: 'Abraxane'
                                },
                                start_date: '2019-01-31T00:00:00Z',
                                termination_reason: {
                                    id: 'UNK:0000',
                                    label: 'abcd'
                                },
                                updated: '2022-10-11T17:35:14.339544Z'
                            }
                        ],
                        subject: {
                            created: '2022-10-11T17:35:14.328822Z',
                            date_of_birth: '1951-11-01',
                            deceased: true,
                            ecog_performance_status: {
                                id: 'ECOG: 1',
                                label: 'Restricted in physically strenuous activity but ambulatory and able to carry out work of a light or sedentary nature, e.g., light house work, office work'
                            },
                            ethnicity: 'Not Hispanic or Latino',
                            extra_properties: {
                                communication_language: 'English'
                            },
                            id: 'SET3_COU057',
                            sex: 'male',
                            updated: '2022-10-11T17:35:14.328836Z'
                        },
                        table: '75ded60b-a44b-467c-96f3-8b118a605206',
                        tumor_marker: [],
                        updated: '2022-10-11T17:35:14.343591Z'
                    }
                ]
            }
        ],
        server: 'http://ga4ghdev01.bcgsc.ca:8861/federation/search',
        service: 'katsu',
        status: 200
    };

    function setRedux(
        rows,
        medicationList,
        conditionList,
        sexList,
        cancerTypeList,
        selectedMedications,
        selectedConditions,
        selectedCancerType
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
                    selectedCancerType
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
        }
    };

    React.useEffect(() => {
        trackPromise(
            fetchFederationClinicalData('/api/mcodepackets').then((data2) => {
                const data = testData;
                setMcodeData(data);
                const tempRows = [];
                for (let j = 0; j < data.results.length; j += 1) {
                    for (let i = 0; i < data.results[j].count; i += 1) {
                        // Patient table filtering
                        if (
                            selectedConditions === 'All' &&
                            selectedMedications === 'All' &&
                            selectedSex === 'All' &&
                            selectedCancerType === 'All'
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
                            if (
                                patientCondition &&
                                patientMedication &&
                                patientSex &&
                                patientCancerType &&
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

                setRedux(
                    tempRows,
                    medicationList,
                    conditionList,
                    sexList,
                    cancerTypeList,
                    selectedMedications,
                    selectedConditions,
                    selectedCancerType
                );
            })
        );

        window.addEventListener('resize', () => setdesktopResolution(window.innerWidth > 1200));
    }, [desktopResolution, setdesktopResolution, selectedSex, selectedConditions, selectedMedications, selectedCancerType]);

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
