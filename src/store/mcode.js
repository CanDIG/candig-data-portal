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
        field: 'Language',
        headerName: 'communication_language',
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
        width: 150
    },
    {
        field: 'code_id',
        headerName: 'Code ID',
        width: 150
    },
    {
        field: 'code_label',
        headerName: 'Code Label',
        width: 150
    },
    {
        field: 'date_of_diagnosis',
        headerName: 'Date of Diagnosis',
        width: 150
    }
];

export const cancerRelatedProceduresColumns = [
    {
        field: 'id',
        headerName: 'id',
        width: 150
    },
    {
        field: 'procedure_type',
        headerName: 'Procedure Type',
        width: 150
    },
    {
        field: 'procedure_code_id',
        headerName: 'Code ID',
        width: 150
    },
    {
        field: 'procedure_code_label',
        headerName: 'Code Label',
        width: 150
    },
    {
        field: 'body_site_id',
        headerName: 'Body Site ID',
        width: 150
    },
    {
        field: 'body_site_label',
        headerName: 'Body Site Label',
        width: 150
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
        width: 150
    },
    {
        field: 'medication_code_label',
        headerName: 'Medication Code Label',
        width: 150
    }
];
