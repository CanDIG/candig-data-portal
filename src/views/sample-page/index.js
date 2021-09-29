import * as React from 'react';

// material-ui
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Grid, Box } from '@material-ui/core';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { katsu } from 'store/api';
import {
    cancerConditionsColumns,
    cancerRelatedProceduresColumns,
    mainColumns,
    medicationStatementColumns,
    processConditionsData,
    processMedicationStatementData,
    processProceduresData,
    processMCodeMainData
} from 'store/mcode';

function MCodeView() {
    const [mcodeData, setMcodeData] = React.useState([]);
    const [rows, setRows] = React.useState([]);
    const [selectedPatient, setSelectedPatient] = React.useState([]);
    const [value, setValue] = React.useState('1');
    const [cancerConditions, setCancerConditions] = React.useState([]);
    const [procedures, setProcedures] = React.useState([]);
    const [medicationStatement, setMedicationStatement] = React.useState([]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
        console.log(mcodeData);
    };

    const handleRowClick = (row) => {
        const index = mcodeData.results.findIndex((item) => item.id === row.id);
        setSelectedPatient(mcodeData.results[index].id);
        setCancerConditions(processConditionsData(mcodeData.results[index]));
        setProcedures(processProceduresData(mcodeData.results[index]));
        setMedicationStatement(processMedicationStatementData(mcodeData.results[index]));
    };

    React.useEffect(() => {
        fetch(`${katsu}/api/mcodepackets`)
            .then((response) => response.json())
            .then((data) => {
                setMcodeData(data);
                setSelectedPatient(data.results[0].id);
                const tempRows = [];
                for (let i = 0; i < data.results.length; i += 1) {
                    tempRows.push(processMCodeMainData(data.results[i]));
                }
                setRows(tempRows);
                setCancerConditions(processConditionsData(data.results[0]));
                setProcedures(processProceduresData(data.results[0]));
                setMedicationStatement(processMedicationStatementData(data.results[0]));
            });
    }, []);

    return (
        <MainCard title="mCode Data">
            <Grid container direction="row">
                <TabContext value={value}>
                    {selectedPatient && (
                        <Box ml={2} sx={{ position: 'absolute' }}>
                            <p>
                                <b>Patient: </b>
                                {selectedPatient}
                            </p>
                        </Box>
                    )}
                    <Grid container direction="row" justifyContent="flex-end" alignItems="center">
                        <Box sx={{ width: '58%' }} mb={3}>
                            <div className="float-right mb-3">
                                <Tabs
                                    value={value}
                                    onChange={handleChange}
                                    textColor="primary"
                                    indicatorColor="primary"
                                    aria-label="secondary tabs example"
                                >
                                    <Tab value="1" label="Cancer Conditions" />
                                    <Tab value="2" label="Procedures" />
                                    <Tab value="3" label="Medication Statement" />
                                </Tabs>
                            </div>
                        </Box>
                    </Grid>
                    <Grid container justifyContent="center" alignItems="center">
                        <Grid item mr={2} sx={{ height: 600, width: '40%' }}>
                            <DataGrid
                                rows={rows}
                                columns={mainColumns}
                                pageSize={8}
                                rowsPerPageOptions={[8]}
                                components={{ Toolbar: GridToolbar }}
                                onRowClick={(rowData) => handleRowClick(rowData.row)}
                            />
                        </Grid>
                        <TabPanel value="1" sx={{ height: 600, width: '58%', padding: 0 }}>
                            <Grid item sx={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={cancerConditions}
                                    columns={cancerConditionsColumns}
                                    pageSize={8}
                                    rowsPerPageOptions={[8]}
                                    components={{ Toolbar: GridToolbar }}
                                    disableSelectionOnClick
                                />
                            </Grid>
                        </TabPanel>
                        <TabPanel value="2" sx={{ height: 600, width: '58%', padding: 0 }}>
                            <Grid item sx={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={procedures}
                                    columns={cancerRelatedProceduresColumns}
                                    pageSize={8}
                                    rowsPerPageOptions={[8]}
                                    components={{ Toolbar: GridToolbar }}
                                    disableSelectionOnClick
                                />
                            </Grid>
                        </TabPanel>
                        <TabPanel value="3" sx={{ height: 600, width: '58%', padding: 0 }}>
                            <Grid item sx={{ height: 600, width: '100%' }}>
                                <DataGrid
                                    rows={medicationStatement}
                                    columns={medicationStatementColumns}
                                    pageSize={8}
                                    rowsPerPageOptions={[8]}
                                    components={{ Toolbar: GridToolbar }}
                                    disableSelectionOnClick
                                />
                            </Grid>
                        </TabPanel>
                    </Grid>
                </TabContext>
            </Grid>
        </MainCard>
    );
}

export default MCodeView;
