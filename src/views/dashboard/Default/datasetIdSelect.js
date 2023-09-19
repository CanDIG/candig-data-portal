import { useState } from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
// import { fetchDatasets } from '../../../store/api';
import AlertComponent from 'ui-component/AlertComponent';

// REDUX
import { useSelector, useDispatch } from 'react-redux';

export default function DatasetIdSelect() {
    const events = useSelector((state) => state);
    const dispatch = useDispatch();

    // STATES
    const [selectedDataset, setSelectedDataset] = useState(events.customization.selectedDataset);
    const [datasets, _setDatasets] = useState(events.customization.datasets);
    const [open, setOpen] = useState(false);
    const [alertMessage, _setAlertMessage] = useState('');
    const [alertSeverity, _setAlertSeverity] = useState('');

    function updateParentState(datasetName, datasetId) {
        dispatch({ type: 'SET_UPDATE_STATE', payload: { datasetName, datasetId } });
    }

    /* 
    function setFirstDataset(datasetsList) {
        const firstDataset = datasetsList[Object.keys(datasetsList)[0]];
        setSelectedDataset(firstDataset.name);
        updateParentState(firstDataset.name, firstDataset.id);
        dispatch({ type: 'SET_SELECTED_DATASET', payload: firstDataset.name });
    }

    function processDatasetJson(datasetJson) {
        const datasetsList = {};
        datasetJson.forEach((dataset) => {
            datasetsList[dataset.id] = dataset;
        });
        return datasetsList;
    }

    useEffect(() => {
        if (!selectedDataset) {
            fetchDatasets()
                .then((data) => {
                    if (data.results) {
                        const datasetsList = processDatasetJson(data.results.datasets);
                        setDatasets(datasetsList);
                        setFirstDataset(datasetsList);
                        dispatch({ type: 'SET_DATASETS', payload: datasetsList });
                    }
                })
                .catch(() => {
                    setOpen(true);
                    setAlertMessage('No datasets are currently available. If this issue persists, contact your sysadmin for assistance');
                    setAlertSeverity('error');
                });
        }
    });
    */

    const handleChange = (id, name) => {
        setSelectedDataset(name);
        updateParentState(name, id); // Suppose tp be id
        dispatch({ type: 'SET_SELECTED_DATASET', payload: name });
    };

    const datasetList = Object.keys(datasets).map((key) => (
        <MenuItem key={datasets[key].id} value={datasets[key].name} onClick={() => handleChange(datasets[key].id, datasets[key].name)}>
            {datasets[key].name}
        </MenuItem>
    ));

    return (
        <Box>
            <Box
                sx={{
                    border: 1,
                    borderRadius: events.customization.borderRadius * 0.25,
                    position: 'absolute',
                    top: 12,
                    right: 10,
                    pr: 1,
                    pl: 1
                }}
            >
                {selectedDataset && (
                    <FormControl sx={{ minWidth: 125 }}>
                        {/* <InputLabel id="demo-simple-select-label">Dataset ID</InputLabel> */}
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={selectedDataset}
                            name="POG"
                            variant="standard"
                            sx={{ fontsize: '0.25rem', height: '1.75rem' }}
                        >
                            {datasetList}
                        </Select>
                    </FormControl>
                )}
            </Box>
            <AlertComponent
                open={open}
                setOpen={setOpen}
                text={alertMessage}
                severity={alertSeverity}
                variant="filled"
                fontColor={alertSeverity === 'error' ? 'white' : 'black'}
            />
        </Box>
    );
}
