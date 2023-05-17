// API Server constant
/* eslint-disable camelcase */
export const katsu = process.env.REACT_APP_KATSU_API_SERVER;
export const federation = process.env.REACT_APP_FEDERATION_API_SERVER;
export const BASE_URL = process.env.REACT_APP_CANDIG_SERVER;
export const htsget = process.env.REACT_APP_HTSGET_SERVER;
export const TYK_URL = process.env.REACT_APP_TYK_SERVER;

// API Calls
/* 
Fetch katsu calls
*/
export function fetchKatsu(URL) {
    return fetch(`${katsu}${URL}`)
        .then((response) => response.json())
        .then((data) =>
            fetch(`${katsu}${URL}?page_size=${data.count}`) // Page size by default is 25 set page size to count to returns all
                .then((response) => response.json())
                .then((data) => data)
        );
}

/*
Fetch the federation service 
*/
const testOverviewData = {
    cohort_count: 2,
    individual_count: 148,
    ethnicity: [
        {
            ethnicity: 'ASKU',
            count: 126
        },
        {
            ethnicity: '',
            count: 22
        }
    ],
    gender: [
        {
            sex: null,
            count: 0
        },
        {
            sex: 'Male',
            count: 56
        },
        {
            sex: 'Female',
            count: 88
        }
    ]
};

export function fetchFederationStat() {
    return new Promise((resolve, reject) => resolve(testOverviewData));
    return fetch(`${federation}/search`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            request_type: 'GET',
            endpoint_path: 'api/moh_overview',
            endpoint_payload: {},
            endpoint_service: 'katsu'
        })
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return {};
        })
        .catch((error) => {
            console.log('Error:', error);
            return 'error';
        });
}

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
                                id: 'UNK:0000',
                                label: 'abcd'
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
                                label: 'abcd'
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

/*
Fetch the federation service for clinical search data
*/
export function fetchFederationClinicalData() {
    return new Promise((resolve, reject) => resolve(testData));
    return fetch(`${federation}/search`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            request_type: 'GET',
            endpoint_path: 'api/mcodepackets',
            endpoint_payload: {},
            endpoint_service: 'katsu'
        })
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return {};
        })
        .catch((error) => {
            console.log('Error:', error);
            return 'error';
        });
}

/*
Fetch peer federation stats from CanDIG federation service 
*/
export function fetchSummaryStats(URL) {
    return federation !== '' ? fetchFederationStat() : fetchKatsu(URL);
}

/*
Fetch peer federation stats from CanDIG federation service 
*/
export function fetchClinicalData(URL) {
    return federation !== '' ? fetchFederationClinicalData() : fetchKatsu(URL);
}

/*
Fetch peer servers from CanDIG federation service 
*/
export function fetchServers() {
    return fetch(`${federation}/servers`, {}).then((response) => {
        if (response.ok) {
            return response.json();
        }
        return {};
    });
}

/*
Fetch variant for a specific Dataset Id; start; and reference name; and returns a promise
 * @param {number}... Start
 * @param {number}... End
 * @param {string}... Reference name
*/
export function searchVariant(chromosome, start, end) {
    const payload = {
        regions: [
            {
                referenceName: chromosome,
                start: parseInt(start, 10),
                end: parseInt(end, 10)
            }
        ]
    };
    return fetch(`${federation}/search`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            request_type: 'POST',
            endpoint_path: 'htsget/v1/variants/search',
            endpoint_payload: payload,
            endpoint_service: 'htsget'
        })
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return {};
        })
        .catch((error) => {
            console.log('Error:', error);
            return 'error';
        });
}
