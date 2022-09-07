import React from 'react';
import { Button } from '@mui/material';

function MoreInfoButton() {
    return (
        <strong>
            <Button className="moreInfoButton" variant="text">
                More Info
            </Button>
        </strong>
    );
}

function getSite() {
    return <strong>UHN</strong>;
}

export const mainColumns = [
    {
        field: 'id',
        headerName: 'ID',
        width: 150
    },
    {
        field: 'ethnicity',
        headerName: 'Ethnicity',
        width: 150
    },
    {
        field: 'sex',
        headerName: 'Sex',
        width: 150
    },
    {
        field: 'more_info',
        headerName: 'Info',
        width: 100,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        renderCell: MoreInfoButton,
        disableClickEventBubbling: true
    }
];

export const subjectColumns = [
    {
        field: 'id',
        headerName: 'ID',
        width: 100
    },
    {
        field: 'more_info',
        headerName: 'Info',
        width: 100,
        sortable: false,
        headerAlign: 'center',
        align: 'center',
        renderCell: MoreInfoButton,
        disableClickEventBubbling: true
    },
    {
        field: 'site',
        headerName: 'Site',
        renderCell: getSite,
        width: 120
    },
    {
        field: 'ethnicity',
        headerName: 'Ethnicity',
        width: 150,
        hide: true
    },
    {
        field: 'race',
        headerName: 'Race',
        width: 130
    },
    {
        field: 'sex',
        headerName: 'Sex',
        width: 130
    },
    {
        field: 'date_of_birth',
        headerName: 'Date of Birth',
        width: 170,
        hide: true
    },
    {
        field: 'date_of_death',
        headerName: 'Date of Death',
        width: 170,
        hide: true
    },
    {
        field: 'communication_language',
        headerName: 'Language',
        width: 150,
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
        width: 180
    },
    {
        field: 'code',
        headerName: 'Code',
        width: 150
    },
    {
        field: 'histology_morphology_behavior',
        headerName: 'Histology morphology behavior',
        width: 300
    },
    {
        field: 'date_of_diagnosis',
        headerName: 'Date of Diagnosis',
        width: 200
    }
];

export const cancerRelatedProceduresColumns = [
    {
        field: 'id',
        headerName: 'id',
        width: 100
    },
    {
        field: 'procedure_type',
        headerName: 'Procedure Type',
        width: 190
    },
    {
        field: 'procedure_code_id',
        headerName: 'Code ID',
        width: 150
    },
    {
        field: 'procedure_code_label',
        headerName: 'Code Label',
        width: 160
    },
    {
        field: 'body_site_id',
        headerName: 'Body Site ID',
        width: 160
    },
    {
        field: 'body_site_label',
        headerName: 'Body Site Label',
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
    }
];

/**
 * @param {*} dataObject
 * @returns an object representing one row for the main table.
 */
export const processMCodeMainData = (dataObject) => {
    const row = {};

    row.id = dataObject?.id ? dataObject?.id : null;
    row.sex = dataObject?.subject?.sex ? dataObject?.subject?.sex : 'NA';
    row.ethnicity = dataObject?.subject?.ethnicity ? dataObject?.subject?.ethnicity : 'NA';
    row.date_of_birth = dataObject?.subject?.date_of_birth ? dataObject?.subject?.date_of_birth : 'NA';
    row.date_of_death = dataObject?.date_of_death ? dataObject?.date_of_death : 'NA';
    row.race = dataObject?.subject?.race ? dataObject?.subject?.race : 'NA';
    row.communication_language = dataObject?.subject?.extra_properties?.communication_language
        ? dataObject?.subject?.extra_properties?.communication_language
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
    row.communication_language = dataObject?.subject?.extra_properties?.communication_language
        ? dataObject?.subject?.extra_properties?.communication_language
        : 'NA';

    return [row];
};

/**
 * Process data for cancer conditions subtable.
 * @param {*} dataObject
 * @returns a list of multiple rows, valid datagrid row definitions.
 */
export const processConditionsData = (dataObject) => {
    const rows = [];
    console.log(dataObject);

    // eslint-disable-next-line camelcase
    dataObject?.cancer_condition.forEach((cancer_condition) => {
        const row = {};
        row.id = cancer_condition?.id || null;
        if (row.id !== null) {
            row.condition_type = cancer_condition?.condition_type ? cancer_condition?.condition_type : 'NA';
            row.body_site = cancer_condition?.body_site ? cancer_condition?.body_site : 'NA';
            row.code = cancer_condition?.code ? cancer_condition?.code : 'NA';
            row.histology_morphology_behavior = cancer_condition?.histology_morphology_behavior
                ? cancer_condition?.histology_morphology_behavior
                : 'NA';
            row.date_of_diagnosis = cancer_condition?.date_of_diagnosis ? cancer_condition?.date_of_diagnosis : 'NA';

            rows.push(row);
        }
    });

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
    dataObject.cancer_related_procedures.forEach((cancer_related_procedure) => {
        const row = {};
        row.id = cancer_related_procedure.id || null;
        if (row.id !== null) {
            row.procedure_type = cancer_related_procedure?.procedure_type ? cancer_related_procedure?.procedure_type : 'NA';
            row.procedure_code_id = cancer_related_procedure?.code?.id ? cancer_related_procedure?.code?.id : 'NA';
            row.procedure_code_label = cancer_related_procedure?.code?.label ? cancer_related_procedure?.code?.label : 'NA';
            row.body_site_id = cancer_related_procedure?.body_site?.id ? cancer_related_procedure?.body_site?.id : 'NA';
            row.body_site_label = cancer_related_procedure?.body_site?.label ? cancer_related_procedure?.body_site?.label : 'NA';

            rows.push(row);
        }
    });

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
    dataObject.medication_statement.forEach((medication_statement) => {
        const row = {};
        row.id = medication_statement.id || null;
        if (row.id !== null) {
            row.medication_code_id = medication_statement?.medication_code?.id ? medication_statement?.medication_code?.id : 'NA';
            row.medication_code_label = medication_statement?.medication_code?.label ? medication_statement?.medication_code?.label : 'NA';

            rows.push(row);
        }
    });

    return rows;
};

/**
 * Process data for medication list
 * @param {*} dataObject
 * @returns a list of medications valid for dropdown
 */
export const processMedicationListData = (dataObject) => {
    const list = {};
    dataObject.forEach((patient) => {
        patient?.medication_statement.forEach((medication) => {
            const key = medication?.medication_code?.id;
            if (!(key in list)) {
                list[key] = medication?.medication_code?.label;
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
    dataObject.forEach((patient) => {
        patient?.cancer_condition.forEach((condition) => {
            const key = condition?.code?.id;
            if (!(key in list)) {
                list[key] = condition?.code?.label;
            }
        });
    });
    list.ALL = 'All';
    return list;
};

/**
 * Process data for Procedures list
 * @param {*} dataObject
 * @returns a list of Procedures valid for dropdown
 */
export const processProceduresListData = (dataObject) => {
    const list = {};
    dataObject.forEach((patient) => {
        patient?.cancer_related_procedures.forEach((procedure) => {
            const key = procedure?.code?.id;
            if (!(key in list)) {
                list[key] = procedure?.procedure_type;
            }
        });
    });
    list.ALL = 'All';
    return list;
};
