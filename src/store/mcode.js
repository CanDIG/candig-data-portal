import React from 'react';
import { Button } from '@material-ui/core';

function MoreInfoButton() {
    return (
        <strong>
            <Button className="moreInfoButton" variant="text">
                More Info
            </Button>
        </strong>
    );
}

function getStrAttrSafe(obj, attr) {
    if (Object.prototype.hasOwnProperty.call(obj, attr)) {
        return obj[attr];
    } else {
        return '';
    }
}

function getObjAttrSafe(obj, attr) {
    if (Object.prototype.hasOwnProperty.call(obj, attr)) {
        return obj[attr];
    } else {
        return {};
    }
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
        field: 'ethnicity',
        headerName: 'Ethnicity',
        width: 150
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

    row.id = getStrAttrSafe(dataObject, 'id');
    row.sex = getStrAttrSafe(dataObject, 'sex');
    row.ethnicity = getStrAttrSafe(dataObject.subject, 'ethnicity');
    row.date_of_birth = getStrAttrSafe(dataObject.subject, 'date_of_birth');
    row.date_of_death = getStrAttrSafe(dataObject, 'date_of_death');
    row.ethnicity = getStrAttrSafe(dataObject.subject, 'ethnicity');
    row.race = getStrAttrSafe(dataObject.subject, 'race');
    row.communication_language = getStrAttrSafe(dataObject.subject.extra_properties, 'communication_language');

    return row;
};

/**
 * Process data for the subject subtable.
 * @param {*} dataObject
 * @returns a list of one row, valid datagrid row definitions.
 */
export const processSubjectData = (dataObject) => {
    const row = {};
    row.id = getStrAttrSafe(dataObject, 'id');
    row.sex = getStrAttrSafe(dataObject, 'sex');
    row.date_of_birth = getStrAttrSafe(dataObject.subject, 'date_of_birth');
    row.date_of_death = getStrAttrSafe(dataObject, 'date_of_death');
    row.ethnicity = getStrAttrSafe(dataObject.subject, 'ethnicity');
    row.race = getStrAttrSafe(dataObject.subject, 'race');
    row.communication_language = getStrAttrSafe(dataObject.subject.extra_properties, 'communication_language');

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
        rows.push(row);
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
        patient.medication_statement.forEach((medication) => {
            const key = medication.medication_code.id;
            if (!(key in list)) {
                list[key] = medication.medication_code.label;
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
        patient.cancer_condition.forEach((condition) => {
            const key = condition.code.id;
            if (!(key in list)) {
                list[key] = condition.code.label;
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
        patient.cancer_related_procedures.forEach((procedure) => {
            const key = procedure.code.id;
            if (!(key in list)) {
                list[key] = procedure.procedure_type;
            }
        });
    });
    list.ALL = 'All';
    return list;
};
