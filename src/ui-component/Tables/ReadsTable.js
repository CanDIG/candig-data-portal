import React from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'assets/css/VariantsSearch.css';

function ReadsTable({ rowData, datasetId }) {
    let gridOptions = {};

    function getColumnDefs() {
        const columnDefs = [
            {
                headerName: 'Alignments',
                children: [
                    { headerName: 'Chromosome', field: 'alignment.position.referenceName' },
                    { headerName: 'Position', field: 'alignment.position.position' },
                    { headerName: 'Aligned Sequence', field: 'alignedSequence' },
                    { headerName: 'Fragment Name', field: 'fragmentName' },
                    { headerName: 'Number Reads', field: 'numberReads' },
                    { headerName: 'Fragment Length', field: 'fragmentLength' },
                    { headerName: 'Read Number', field: 'readNumber' },
                    { headerName: 'Improper Placement', field: 'improperPlacement' }
                ]
            }
        ];
        if (rowData[0] !== undefined) {
            const attributes = [];

            const { attr } = rowData[0].attributes; // Only grabing attributes from first row other rows could have more
            Object.keys(attr).forEach((key) => {
                attributes.push({
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

            columnDefs.push(
                {
                    headerName: 'Alignment',
                    children: [
                        { headerName: 'Strand', field: 'alignment.position.strand' },
                        { headerName: 'Mapping Quality', field: 'alignment.mappingQuality' },
                        {
                            headerName: 'Cigar Operation',
                            field: 'alignment.cigar',
                            valueFormatter: (params) => {
                                try {
                                    return params.value[0].operation;
                                } catch (error) {
                                    // console.log(error);
                                    /*
                                     * This is to handle the case where the operation value is not available in the select row
                                     */
                                    return 'N/A';
                                }
                            }
                        },
                        {
                            headerName: 'Cigar Operation Length',
                            field: 'alignment.cigar',
                            valueFormatter: (params) => {
                                try {
                                    return params.value[0].operationLength;
                                } catch (error) {
                                    // console.log(error);
                                    /*
                                     * This is to handle the case where the operationLength value is not available in the select row
                                     */
                                    return 'N/A';
                                }
                            }
                        }
                    ]
                },
                { headerName: 'Attributes', children: attributes }
            );
            return columnDefs;
        }
        return columnDefs;
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
        rowSelection: 'single',
        rowData: null,
        rowGroupPanelShow: 'always',
        pivotPanelShow: 'always',
        enableRangeSelection: true,
        paginationAutoPageSize: true,
        pagination: true,
        valueCache: true
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

ReadsTable.propTypes = {
    rowData: PropTypes.arrayOf(PropTypes.object).isRequired,
    datasetId: PropTypes.string.isRequired
};

export default ReadsTable;
