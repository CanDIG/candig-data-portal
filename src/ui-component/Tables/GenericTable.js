import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { NotificationAlert } from '../../utils/alert';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

function GenericTable({ rowData, columnDefs }) {
    const notifyEl = useRef(null);

    let gridOptions = {};

    gridOptions = {
        defaultColDef: {
            editable: true,
            sortable: true,
            resizable: true,
            filter: true,
            minWidth: 50,
            minHeight: 300
        },
        rowSelection: 'single',
        rowData: null,
        paginationAutoPageSize: true,
        pagination: true
    };

    return (
        <>
            {/* <NotificationAlert ref={notifyEl} /> */}
            <div className="ag-theme-alpine">
                <AgGridReact columnDefs={columnDefs} rowData={rowData} gridOptions={gridOptions} />
            </div>
        </>
    );
}

GenericTable.propTypes = {
    columnDefs: PropTypes.arrayOf(PropTypes.object).isRequired,
    rowData: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default GenericTable;
