import { useState, useEffect } from 'react';
import { useTheme } from '@mui/system';

// MUI
import { Box, Grid, IconButton, Typography } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

// Third-party libraries
import { IconEdit, IconX, IconPlus } from '@tabler/icons-react';

// Custom Components and context
import CustomOfflineChart from 'views/summary/CustomOfflineChart';
import { useSearchResultsReaderContext } from '../SearchResultsContext';

// Constants
import { validStackedCharts, DataVisualizationChartInfo } from 'store/constant';
import { HAS_CENSORED_DATA_MARKER } from 'utils/utils';

function DataVisualization() {
    // Hooks
    const resultsContext = useSearchResultsReaderContext();
    const counts = resultsContext.counts;
    const clinical = resultsContext.clinical;
    // Plan for context below see current dataVis for expected shape
    // const dataVis = counts || {};
    const isCensored = (datum) => typeof datum === 'string' && datum.startsWith('<');
    const handleCensoring = (dataKey, transformer = (site, input) => input, isObject = false) => {
        const dataObj = counts?.[dataKey];
        if (dataObj === null || typeof dataObj === 'undefined') {
            return {};
        }

        let hasCensoredData = false;
        const newDataObj = {};
        // Copy over the data into a new object, substituting 0 instead of any censored data
        Object.keys(dataObj).forEach((key) => {
            newDataObj[key] = 0;
            if (isCensored(dataObj[key])) {
                newDataObj[key] = 0;
                hasCensoredData = true;
            } else {
                newDataObj[key] = dataObj[key];
            }
        });

        // If clinical data hasn't returned yet, exit here
        if (!clinical) {
            return newDataObj;
        }

        // Check the clinical results to see if we can fill in any censored data with real ones
        Object.entries(clinical).forEach(([siteName, site]) => {
            Object.keys(site.summary?.[dataKey]).forEach((key) => {
                if (isObject) {
                    Object.keys(site.summary[dataKey]).forEach((innerKey) => {
                        if (isCensored(dataObj[transformer(siteName, key)][innerKey])) {
                            newDataObj[transformer(siteName, key)][innerKey] = site.summary[dataKey][innerKey];
                        }
                    });
                } else if (isCensored(dataObj[transformer(siteName, key)])) {
                    newDataObj[transformer(site, key)] += site.summary[dataKey][key];
                }
            });
        });

        if (hasCensoredData) {
            newDataObj[HAS_CENSORED_DATA_MARKER] = true;
        }
        return newDataObj;
    };

    const dataVis = {
        patients_per_cohort: handleCensoring('patients_per_cohort', (site, _) => site, true) || {},
        diagnosis_age_count: handleCensoring('age_at_diagnosis', (_, age) => age.replace(/ Years$/, '')) || {},
        treatment_type_count: handleCensoring('treatment_type_count') || {},
        primary_site_count: handleCensoring('primary_site_count') || {}
    };
    const theme = useTheme();

    // State management
    const [edit, setEdit] = useState(false);
    const [open, setOpen] = useState(false);

    // Top 4 keys from dataVis
    const topKeys = Object.keys(dataVis).slice(0, 4);

    // LocalStorage
    const [dataValue, setDataValue] = useState(
        localStorage.getItem('dataVisData') && JSON.parse(localStorage.getItem('dataVisData'))?.[0]
            ? JSON.parse(localStorage.getItem('dataVisData'))[0]
            : 'patients_per_cohort'
    );
    const [chartType, setChartType] = useState(
        localStorage.getItem('dataVisChartType') && JSON.parse(localStorage.getItem('dataVisChartType'))?.[0]
            ? JSON.parse(localStorage.getItem('dataVisChartType'))[0]
            : 'bar'
    );
    const [dataVisData, setdataVisData] = useState(
        localStorage.getItem('dataVisData') ? JSON.parse(localStorage.getItem('dataVisData')) : topKeys
    );
    const [dataVisChartType, setDataVisChartType] = useState(
        localStorage.getItem('dataVisChartType') ? JSON.parse(localStorage.getItem('dataVisChartType')) : ['bar', 'bar', 'bar', 'bar']
    );
    const [dataVisTrim, setDataVisTrim] = useState(
        localStorage.getItem('dataVisTrim') ? JSON.parse(localStorage.getItem('dataVisTrim')) : [false, false, false, false]
    );

    // Intial localStorage setting if there are none
    useEffect(() => {
        if (!localStorage.getItem('dataVisData') && !localStorage.getItem('dataVisChartType')) {
            const charts = topKeys.map(() => 'bar');
            localStorage.setItem('dataVisChartType', JSON.stringify(charts), { expires: 365 });
            localStorage.setItem('dataVisData', JSON.stringify(topKeys), { expires: 365 });
            localStorage.setItem('dataVisTrim', JSON.stringify([false, false, false, false]), { expires: 365 });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleToggleDialog = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    function setDataVisChartTypeSingle(index, newVal) {
        const newDataVisChartType = dataVisChartType.slice();
        newDataVisChartType[index] = newVal;
        setDataVisChartType(newDataVisChartType);
        localStorage.setItem('dataVisChartType', JSON.stringify(newDataVisChartType), { expires: 365 });
    }

    function setDataVisDataTypeSingle(index, newVal) {
        const newDataVisData = dataVisData.slice();
        newDataVisData[index] = newVal;
        setdataVisData(newDataVisData);
        localStorage.setItem('dataVisData', JSON.stringify(newDataVisData), { expires: 365 });
    }

    function removeChart(index) {
        const newDataVisChartType = dataVisChartType.slice(0, index).concat(dataVisChartType.slice(index + 1));
        const newdataVisData = dataVisData.slice(0, index).concat(dataVisData.slice(index + 1));
        const newDataVisTrim = dataVisTrim.slice(0, index).concat(dataVisTrim.slice(index + 1));
        setDataVisChartType(newDataVisChartType);
        setdataVisData(newdataVisData);
        setDataVisTrim(newDataVisTrim);
        localStorage.setItem('dataVisData', JSON.stringify(newdataVisData), { expires: 365 });
        localStorage.setItem('dataVisChartType', JSON.stringify(newDataVisChartType), { expires: 365 });
        localStorage.setItem('dataVisTrim', JSON.stringify(newDataVisTrim), { expires: 365 });
    }

    function AddChart(data, chartType) {
        setOpen(false);
        const newdataVisData = [...dataVisData, data];
        const newDataVisChartType = [...dataVisChartType, validStackedCharts.includes(data) ? 'bar' : chartType];
        const newDataVisTrim = [...dataVisTrim, false];
        setDataVisChartType(newDataVisChartType);
        setdataVisData(newdataVisData);
        setDataVisTrim(newDataVisTrim);
        localStorage.setItem('dataVisChartType', JSON.stringify(newDataVisChartType), { expires: 365 });
        localStorage.setItem('dataVisTrim', JSON.stringify(newDataVisTrim), { expires: 365 });
        localStorage.setItem('dataVisData', JSON.stringify(newdataVisData), { expires: 365 });
    }
    /* eslint-disable jsx-a11y/no-onchange */
    function returnChartDialog() {
        return (
            <Dialog open={open} onClose={handleToggleDialog}>
                <DialogTitle>Create New Chart</DialogTitle>
                <DialogContent>
                    <DialogContentText pb={1}>Please select the data and chart type from the dropdowns below</DialogContentText>
                    <form>
                        <label htmlFor="types" style={{ paddingRight: '1em' }}>
                            Data: &nbsp;
                            <select value={dataValue} name="types" id="types" onChange={(event) => setDataValue(event.target.value)}>
                                {Object.keys(dataVis).map((key) => (
                                    <option key={key} value={key}>
                                        {DataVisualizationChartInfo[key].title}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {validStackedCharts.includes(dataValue) ? (
                            <label htmlFor="types">
                                Chart Types: &nbsp;
                                <select value="bar" name="types" id="types" onChange={(event) => setChartType(event.target.value)}>
                                    <option value="bar">Stacked Bar</option>
                                </select>
                            </label>
                        ) : (
                            <label htmlFor="types">
                                Chart Types: &nbsp;
                                <select value={chartType} name="types" id="types" onChange={(event) => setChartType(event.target.value)}>
                                    <option value="bar">Bar</option>
                                    <option value="line">Line</option>
                                    <option value="column">Column</option>
                                    <option value="scatter">Scatter</option>
                                    <option value="pie">Pie</option>
                                </select>
                            </label>
                        )}
                    </form>
                    <DialogActions>
                        <Button onClick={handleToggleDialog}>Cancel</Button>
                        <Button onClick={() => AddChart(dataValue, chartType || 'bar')}>Confirm</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        );
    }

    function returndataVisData() {
        const data = dataVisData.map((item, index) => (
            <Grid item xs={12} sm={12} md={6} lg={3} key={item + index}>
                <CustomOfflineChart
                    dataObject=""
                    dataVis={dataVis}
                    data={item}
                    index={index}
                    chartType={dataVisChartType[index]}
                    height="400px; auto"
                    dropDown
                    onRemoveChart={() => removeChart(index)}
                    edit={edit}
                    orderByFrequency={item !== 'diagnosis_age_count'}
                    orderAlphabetically={item === 'diagnosis_age_count'}
                    trimByDefault={dataVisTrim[index]}
                    onChangeDataVisChartType={(newType) => setDataVisChartTypeSingle(index, newType)}
                    onChangeDataVisData={(newData) => setDataVisDataTypeSingle(index, newData)}
                    loading={dataVis[item] === undefined}
                />
            </Grid>
        ));

        return data;
    }

    return (
        <Box
            mr={1}
            ml={1}
            p={2}
            sx={{
                position: 'relative',
                background: 'white',
                border: 1,
                borderRadius: 2,
                boxShadow: 2,
                borderColor: theme.palette.primary[200] + 75
            }}
        >
            <IconButton
                color="primary"
                size="large"
                sx={{
                    position: 'absolute',
                    zIndex: '1000',
                    right: -5,
                    top: -5
                }}
                onClick={() => setEdit(!edit)}
            >
                {!edit ? <IconEdit /> : <IconX />}
            </IconButton>
            <Grid container spacing={1} direction="column">
                <Typography pb={1} variant="h4">
                    Data Visualization
                </Typography>
                <Grid container spacing={1} alignItems="center" justifyContent="center">
                    {returndataVisData()}
                </Grid>
            </Grid>
            {edit && (
                <IconButton
                    color="primary"
                    size="small"
                    sx={{
                        position: 'absolute',
                        zIndex: '1000',
                        right: 40,
                        top: 5,
                        borderRadius: '100%',
                        border: 1,
                        borderColor: theme.palette.primary.main,
                        padding: '0.01em'
                    }}
                    onClick={() => handleToggleDialog()}
                >
                    <IconPlus />
                </IconButton>
            )}
            {returnChartDialog()}
        </Box>
    );
}

export default DataVisualization;
