/* eslint-disable camelcase */
import cancerTypeCSV from '../assets/data_files/cancer_histological_codes_labels.csv';
import papa from 'papaparse';

export const subjectColumns = [
    {
        field: 'id',
        headerName: 'ID',
        width: 150
    },
    {
        field: 'site',
        headerName: 'Site',
        width: 150
    },
    {
        field: 'genomic_id',
        headerName: 'Genome ID',
        width: 200
    },
    {
        field: 'ethnicity',
        headerName: 'Ethnicity',
        width: 200,
        hide: true
    },
    {
        field: 'sex',
        headerName: 'Sex',
        width: 150
    },
    {
        field: 'deceased',
        headerName: 'Deceased',
        width: 150
    },
    {
        field: 'date_of_birth',
        headerName: 'Date of Birth',
        hide: true,
        width: 200
    },
    {
        field: 'date_of_death',
        headerName: 'Date of Death',
        width: 200,
        hide: true
    }
];

export const cancerConditionsColumns = [
    {
        field: 'id',
        headerName: 'id',
        width: 150
    },
    {
        field: 'condition_type',
        headerName: 'Condition Type',
        width: 180
    },
    {
        field: 'body_site',
        headerName: 'Body Site',
        width: 250
    },
    {
        field: 'code',
        headerName: 'Code',
        width: 350
    },
    {
        field: 'date_of_diagnosis',
        headerName: 'Date of Diagnosis',
        width: 200
    }
];

export const medicationStatementColumns = [
    {
        field: 'id',
        headerName: 'id',
        width: 150
    },
    {
        field: 'medication_code_id',
        headerName: 'Medication Code ID',
        width: 250
    },
    {
        field: 'medication_code_label',
        headerName: 'Medication Code Label',
        width: 250
    },
    {
        field: 'start_date',
        headerName: 'Medication Start Date',
        width: 250
    },
    {
        field: 'end_date',
        headerName: 'Medication End Date',
        width: 250
    }
];

/**
 * @param {*} dataObject
 * @returns an object representing one row for the main table.
 */
export const processMCodeMainData = (dataObject, site) => {
    const row = {};
    row.id = dataObject?.id ? dataObject?.id : null;
    row.site = site;
    row.sex = dataObject?.subject?.sex ? dataObject?.subject?.sex : 'NA';
    row.deceased = dataObject?.subject?.deceased ? dataObject?.subject?.deceased : 'NA';
    row.ethnicity = dataObject?.subject?.ethnicity ? dataObject?.subject?.ethnicity : 'NA';
    row.date_of_birth = dataObject?.subject?.date_of_birth ? dataObject?.subject?.date_of_birth : 'NA';
    row.date_of_death = dataObject?.date_of_death ? dataObject?.date_of_death : 'NA';
    row.genomic_id = dataObject?.genomics_report?.extra_properties?.genomic_id
        ? dataObject?.genomics_report?.extra_properties?.genomic_id
        : 'NA';
    return row;
};

/**
 * Process data for the subject subtable.
 * @param {*} dataObject
 * @returns a list of one row, valid datagrid row definitions.
 */
export const processSubjectData = (dataObject) => {
    const row = {};
    row.id = dataObject?.id ? dataObject?.id : null;
    row.sex = dataObject?.subject?.sex ? dataObject?.subject?.sex : 'NA';
    row.date_of_birth = dataObject?.subject?.date_of_birth ? dataObject?.subject?.date_of_birth : 'NA';
    row.date_of_death = dataObject?.date_of_death ? dataObject?.date_of_death : 'NA';
    row.ethnicity = dataObject?.subject?.ethnicity ? dataObject?.subject?.ethnicity : 'NA';
    row.race = dataObject?.subject?.race ? dataObject?.subject?.race : 'NA';

    return [row];
};

/**
 * Process data for cancer conditions subtable.
 * @param {*} dataObject
 * @returns a list of multiple rows, valid datagrid row definitions.
 */
export const processConditionsData = (dataObject) => {
    const rows = [];
    // eslint-disable-next-line camelcase
    const row = {};
    row.id = dataObject?.cancer_condition?.id || null;
    if (row.id !== null) {
        row.condition_type = dataObject?.cancer_condition?.condition_type ? dataObject?.cancer_condition?.condition_type : 'NA';
        row.body_site = dataObject?.cancer_condition?.body_site ? JSON.stringify(dataObject?.cancer_condition?.body_site) : 'NA';
        row.code = dataObject?.cancer_condition?.code ? JSON.stringify(dataObject?.cancer_condition?.code) : 'NA';
        row.date_of_diagnosis = dataObject?.cancer_condition?.date_of_diagnosis ? dataObject?.cancer_condition?.date_of_diagnosis : 'NA';

        rows.push(row);
    }

    return rows;
};

/**
 * Process data for cancer related procedures subtable.
 * @param {*} dataObject
 * @returns a list of multiple rows, valid datagrid row definitions.
 */
export const processProceduresData = (dataObject) => {
    const rows = [];

    // eslint-disable-next-line camelcase
    const row = {};
    row.id = dataObject?.cancer_related_procedure?.id || null;
    if (row.id !== null) {
        row.procedure_type = dataObject?.cancer_related_procedure?.procedure_type
            ? dataObject?.cancer_related_procedure?.procedure_type
            : 'NA';
        row.procedure_code_id = dataObject?.cancer_related_procedure?.code?.id ? dataObject?.cancer_related_procedure?.code?.id : 'NA';
        row.procedure_code_label = dataObject?.cancer_related_procedure?.code?.label
            ? dataObject?.cancer_related_procedure?.code?.label
            : 'NA';
        row.body_site_id = dataObject?.cancer_related_procedure?.body_site?.id ? dataObject?.cancer_related_procedure?.body_site?.id : 'NA';
        row.body_site_label = dataObject?.cancer_related_procedure?.body_site?.label
            ? dataObject?.cancer_related_procedure?.body_site?.label
            : 'NA';

        rows.push(row);
    }

    return rows;
};

/**
 * Process data for medication statements subtable.
 * @param {*} dataObject
 * @returns a list of multiple rows, valid datagrid row definitions.
 */
export const processMedicationStatementData = (dataObject) => {
    const rows = [];

    // eslint-disable-next-line camelcase
    const row = {};
    row.id = dataObject?.medication_statement[0]?.id || null;
    if (row.id !== null) {
        row.medication_code_id = dataObject?.medication_statement[0]?.medication_code?.id
            ? dataObject?.medication_statement[0]?.medication_code?.id
            : 'NA';
        row.medication_code_label = dataObject?.medication_statement[0]?.medication_code?.label
            ? dataObject?.medication_statement[0]?.medication_code?.label
            : 'NA';
        row.start_date = dataObject?.medication_statement[0]?.start_date ? dataObject?.medication_statement[0]?.start_date : 'NA';
        row.end_date = dataObject?.medication_statement[0]?.end_date ? dataObject?.medication_statement[0]?.end_date : 'NA';
        rows.push(row);
    }

    return rows;
};

/**
 * Process data for medication list
 * @param {*} dataObject
 * @returns a list of medications valid for dropdown
 */
export const processMedicationListData = (dataObject) => {
    const list = {};
    dataObject.forEach((federatedResult) => {
        federatedResult.results.forEach((patient) => {
            patient?.medication_statement.forEach((medication) => {
                const key = medication?.medication_code?.id;
                if (!(key in list)) {
                    list[key] = medication?.medication_code?.label;
                }
            });
        });
    });
    list.ALL = 'All';
    return list;
};

/**
 * Process data for condition list
 * @param {*} dataObject
 * @returns a list of sexs valid for dropdown
 */
export const processSexListData = (dataObject) => {
    const list = {};
    dataObject.forEach((federatedResult) => {
        federatedResult.results.forEach((patient) => {
            const key = patient?.subject?.sex;
            if (!(key in list)) {
                list[key] = patient?.subject?.sex;
            }
        });
    });
    list.ALL = 'All';
    return list;
};

/**
 * Process data for condition list
 * @param {*} dataObject
 * @returns a list of conditions valid for dropdown
 */
export const processCondtionsListData = (dataObject) => {
    const list = {};
    dataObject.forEach((federatedResult) => {
        federatedResult.results.forEach((patient) => {
            patient?.cancer_condition?.body_site?.forEach((bodySite) => {
                const key = bodySite?.id;
                if (!(key in list)) {
                    list[key] = bodySite?.label;
                }
            });
        });
    });
    list.ALL = 'All';
    return list;
};

/**
 * Process data for cancerType list
 * @param {*} dataObject
 * @returns a list of cancerType valid for dropdown
 */
export const processCancerTypeListData = (dataObject) => {
    const list = {};
    // Parsing CancerType CSV into Dictionary
    papa.parse(cancerTypeCSV, {
        header: true,
        download: true,
        skipEmptyLines: true,
        // eslint-disable-next-line
        complete: function (results) {
            const cancerType = results.data;
            dataObject.forEach((federatedResult) => {
                federatedResult.results.forEach((patient) => {
                    const key = patient?.cancer_condition?.code?.id;
                    if (!(key in list)) {
                        for (let i = 0; i < cancerType.length; i += 1) {
                            if (key === cancerType[i]['Cancer type code']) {
                                list[key] = `${cancerType[i]['Cancer type label']} ${cancerType[i]['Cancer type code']}`;
                                // list[key] = patient?.code?.label;
                            }
                        }
                    }
                });
            });
            list.ALL = 'All';
        }
    });
    return list;
};

/**
 * Process data for Histological list
 * @param {*} dataObject
 * @returns a list of Histological valid for dropdown
 */
export const processHistologicalTypeListData = (dataObject) => {
    const list = {};
    // Parsing CancerType CSV into Dictionary
    papa.parse(cancerTypeCSV, {
        header: true,
        download: true,
        skipEmptyLines: true,
        // eslint-disable-next-line
        complete: function (results) {
            const HistologicalType = results.data;
            dataObject.forEach((federatedResult) => {
                federatedResult.results.forEach((patient) => {
                    if (patient?.cancer_condition?.histology_morphology_behavior?.id !== undefined) {
                        const key = patient?.cancer_condition?.histology_morphology_behavior?.id;
                        if (!(key in list)) {
                            for (let i = 0; i < HistologicalType.length; i += 1) {
                                if (key === HistologicalType[i]['Tumour histological type code']) {
                                    // eslint-disable-next-line
                                    list[key] = `${HistologicalType[i]['Tumour histological type label']} ${HistologicalType[i]['Tumour histological type code']}`;
                                    // list[key] = patient?.code?.label;
                                }
                            }
                        }
                    }
                });
            });
            list.ALL = 'All';
        }
    });
    return list;
};
