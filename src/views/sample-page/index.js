import React from 'react';

// material-ui
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { katsu } from 'store/api';
import { mainColumns } from 'store/mcode';

function MCodeView() {
    const [rows, setRows] = React.useState([]);

    function processMCodeMainData(dataObject) {
        const row = {};

        row.id = dataObject.id;
        row.sex = dataObject.subject.sex;
        row.ethnicity = dataObject.subject.ethnicity;

        return row;
    }

    React.useEffect(() => {
        fetch(`${katsu}/api/mcodepackets`)
            .then((response) => response.json())
            .then((data) => {
                const tempRows = [];
                for (let i = 0; i < data.results.length; i += 1) {
                    tempRows.push(processMCodeMainData(data.results[i]));
                }
                setRows(tempRows);
            });
    }, []);

    return (
        <MainCard title="mCode Data">
            <div style={{ height: 600, width: '40%' }}>
                <DataGrid
                    rows={rows}
                    columns={mainColumns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    components={{ Toolbar: GridToolbar }}
                    disableSelectionOnClick
                />
            </div>
        </MainCard>
    );
}

export default MCodeView;
