import React from 'react';

// material-ui
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { katsu } from 'store/api';
import { mainColumns } from 'store/mcode';

function MCodeView() {
    const [rows, setRows] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [selectedIndividual, setSelectedIndividual] = React.useState(null);

    const handleClickOpen = () => {
        setOpen(true);
    };

    function moreInfoButton(params) {
        return (
            <strong>
                <Button
                    onClick={() => {
                        handleClickOpen();
                        setSelectedIndividual(params.row.id);
                    }}
                >
                    More Info
                </Button>
            </strong>
        );
    }
    const handleClose = () => {
        setOpen(false);
    };

    const updatedMainColumn = [
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

    // const Transition = React.forwardRef(function Transition(props, ref) {
    //     return <Slide direction="up" ref={ref} {...props} />;
    // });

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
                    columns={updatedMainColumn}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    components={{ Toolbar: GridToolbar }}
                    disableSelectionOnClick
                />
            </div>

            <Dialog fullScreen open={open} onClose={handleClose}>
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <Typography sx={{ ml: 2, flex: 1 }} component="div">
                            Details
                        </Typography>
                        <Button autoFocus color="inherit" onClick={handleClose}>
                            Close
                        </Button>
                    </Toolbar>
                </AppBar>

                <h1>Details for {selectedIndividual}</h1>
            </Dialog>
        </MainCard>
    );
}

export default MCodeView;
