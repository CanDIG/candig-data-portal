import { useState } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';

import 'assets/css/VariantsSearch.css';

function VariantsTable({ rowData, onChange }) {
    let gridOptions = {};
    const [columnDefs] = useState([
        { field: 'Patient ID' },
        { field: 'Location' },
        { field: 'Genomic Sample ID' },
        { field: 'Number of Variants' },
        { field: 'Samples' },
        { field: 'VCF File' },
        { field: 'Select file(s)', headerCheckboxSelection: true, checkboxSelection: true, showDisabledCheckboxes: true }
    ]);
    // parse rowData contains id, location, reference_genome, htsget, samples, variantcount to fit the table
    const displayRowData = rowData.map((row) => {
        const { patientId, locationName, genomicSampleId, variantCount, samples, VCFFile } = row;
        return {
            'Patient ID': patientId,
            Location: locationName,
            'Genomic Sample ID': genomicSampleId,
            'Number of Variants': variantCount,
            Samples: samples,
            'VCF File': VCFFile
        };
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
