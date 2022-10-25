import { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';

import { BASE_URL } from 'store/constant';
import VariantsTableButton from './VariantsTableButton';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import 'assets/css/VariantsSearch.css';

function VariantsTable({ rowData, onChange }) {
    let gridOptions = {};
    const [columnDefs] = useState([
        { field: 'Patient ID' },
        { field: 'Genomic Sample ID' },
        { field: 'Number of Variants' },
        { field: 'VCF File' },
        { field: 'Select file(s)', headerCheckboxSelection: true, checkboxSelection: true, showDisabledCheckboxes: true }
    ]);
    // parse rowData contains id, reference_genome, htsget, samples, variantcount to fit the table
    const displayRowData = rowData.map((row) => {
        const { patientId, genomicSampleId, variantCount, VCFFile } = row;
        return { 'Patient ID': patientId, 'Genomic Sample ID': genomicSampleId, 'Number of Variants': variantCount, 'VCF File': VCFFile };
    });

    function onSelectionChanged() {
        const selectedRows = gridOptions.api.getSelectedRows();
        onChange(selectedRows);
    }

    gridOptions = {
        defaultColDef: {
            editable: false,
            sortable: true,
            resizable: true,
            filter: true,
            flex: 1,
            minWidth: 100,
            minHeight: 300
        },
        onSelectionChanged,
        rowSelection: 'multiple',
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
                <AgGridReact columnDefs={columnDefs} rowData={displayRowData} gridOptions={gridOptions} />
            </div>

            <br />
        </>
    );
}

VariantsTable.propTypes = {
    rowData: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func.isRequired
};

export default VariantsTable;
