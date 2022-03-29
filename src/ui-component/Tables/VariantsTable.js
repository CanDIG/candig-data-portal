import React from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import { AgGridReact } from 'ag-grid-react';

import { BASE_URL } from 'store/constant';
import VariantsTableButton from './VariantsTableButton';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'assets/css/VariantsSearch.css';

function VariantsTable({ rowData, datasetId }) {
    let gridOptions = {};

    function getColumnDefs() {
        const columnDefs = [
            { headerName: 'Chromosome', field: 'referenceName' },
            { headerName: 'Start', field: 'start' },
            { headerName: 'End', field: 'end' },
            { headerName: 'Reference Bases', field: 'referenceBases' },
            { headerName: 'Alternate Bases', field: 'alternateBases' }
        ];

        if (rowData[0] !== undefined) {
            // First population is empty
            const { attr } = rowData[0].attributes;
            Object.keys(attr).forEach((key) => {
                columnDefs.push({
                    headerName: key,
                    valueFormatter: (params) => {
                        try {
                            let attributeValue;

                            if (params.value.values[0].stringValue !== undefined) {
                                attributeValue = params.value.values[0].stringValue;
                            } else if (params.value.values[0].doubleValue !== undefined) {
                                attributeValue = params.value.values[0].doubleValue;
                            } else if (params.value.values[0].int32Value !== undefined) {
                                attributeValue = params.value.values[0].int32Value;
                            }

                            return attributeValue;
                        } catch (error) {
                            // console.log(error);
                            /*
                             * This is to handle the case where the attribute value is not available in the select row
                             */
                            return 'N/A';
                        }
                    },
                    field: `attributes.attr.${key}`, // Allows us to work with key without it retroactively changing to the last key
                    editable: true
                });
            });
        }

        return columnDefs;
    }

    function onSelectionChanged() {
        const selectedRows = gridOptions.api.getSelectedRows();

        fetch(`${BASE_URL}/search`, {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                datasetId: gridOptions.context.datasetId,
                logic: {
                    id: 'A'
                },
                components: [
                    {
                        id: 'A',
                        variants: {
                            start: selectedRows[0].start,
                            end: selectedRows[0].end,
                            referenceName: selectedRows[0].referenceName
                        }
                    }
                ],
                results: [
                    {
                        table: 'patients',
                        fields: ['patientId']
                    }
                ]
            })
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.results.patients.length === 0) {
                    throw new Error('The variant you selected does not have associated individuals.');
                }
            })
            .catch((err) => {
                <Alert severity="warning"> err.message,</Alert>;
            });
    }

    gridOptions = {
        defaultColDef: {
            editable: false,
            sortable: true,
            resizable: true,
            filter: true,
            flex: 1,
            minWidth: 150,
            minHeight: 300
        },
        onSelectionChanged,
        rowSelection: 'single',
        rowData: null,
        rowGroupPanelShow: 'always',
        pivotPanelShow: 'always',
        enableRangeSelection: true,
        paginationAutoPageSize: true,
        pagination: true,
        valueCache: true,
        frameworkComponents: {
            VariantsTableButton
        }
    };

    return (
        <>
            <div className="ag-theme-alpine">
                <AgGridReact columnDefs={getColumnDefs()} rowData={rowData} gridOptions={gridOptions} context={{ datasetId }} />
            </div>

            <br />
        </>
    );
}

VariantsTable.propTypes = {
    rowData: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasetId: PropTypes.string.isRequired
};

export default VariantsTable;
