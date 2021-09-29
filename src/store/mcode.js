import React from 'react';
import { Button } from '@material-ui/core';

function moreInfoButton(params) {
    return (
        <strong>
            <Button
                onClick={() => {
                    console.log(params.row.id);
                }}
            >
                More Info
            </Button>
        </strong>
    );
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
        renderCell: moreInfoButton,
        disableClickEventBubbling: true
    }
];

export const subjectColumns = [
    {
        field: 'id',
        headerName: 'ID',
        width: 150
    },
    {
        field: 'date_of_birth',
        headerName: 'Date of Birth',
        width: 150
    },
    {
        field: 'date_of_death',
        headerName: 'Date of Death',
        width: 150
    },
    {
        field: 'ethnicity',
        headerName: 'Ethnicity',
        width: 150
    },
    {
        field: 'race',
        headerName: 'Race',
        width: 150
    },
    {
        field: 'sex',
        headerName: 'Sex',
        width: 150
    },
    {
        field: 'communication_language',
        headerName: 'Language',
        width: 150
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
        field: 'code_id',
        headerName: 'Code ID',
        width: 150
    },
    {
        field: 'code_label',
        headerName: 'Code Label',
        width: 180
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

    row.id = dataObject.id;
    row.sex = dataObject.subject.sex;
    row.ethnicity = dataObject.subject.ethnicity;

    return row;
};

/**
 * Process data for the subject subtable.
 * @param {*} dataObject
 * @returns a list of one row, valid datagrid row definitions.
 */
export const processSubjectData = (dataObject) => {
    const row = {};

    row.id = dataObject.id;
    row.sex = dataObject.subject.sex;
    row.date_of_birth = dataObject.subject.date_of_birth;
    row.date_of_death = dataObject.date_of_death;
    row.ethnicity = dataObject.subject.ethnicity;
    row.race = dataObject.subject.race;
    row.communication_language = dataObject.subject.extra_properties.communication_language;

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
    dataObject.cancer_condition.forEach((cancer_condition) => {
        const row = {};
        row.id = cancer_condition.id;
        row.condition_type = cancer_condition.condition_type;
        row.code_id = cancer_condition.code.id;
        row.code_label = cancer_condition.code.label;
        row.date_of_diagnosis = cancer_condition.date_of_diagnosis;

        rows.push(row);
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
        row.id = cancer_related_procedure.id;
        row.procedure_type = cancer_related_procedure.procedure_type;
        row.procedure_code_id = cancer_related_procedure.code.id;
        row.procedure_code_label = cancer_related_procedure.code.label;
        row.body_site_id = cancer_related_procedure.body_site.id;
        row.body_site_label = cancer_related_procedure.body_site.label;

        rows.push(row);
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
        row.id = medication_statement.id;
        row.medication_code_id = medication_statement.medication_code.id;
        row.medication_code_label = medication_statement.medication_code.label;

        rows.push(row);
    });

    return rows;
};
