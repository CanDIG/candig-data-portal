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
import CustomOfflineChart, { VALID_CHART_TYPES, VISUALIZATION_LOCAL_STORAGE_KEY } from 'views/summary/CustomOfflineChart';
import { useSearchResultsReaderContext } from '../SearchResultsContext';

// Constants
import { validStackedCharts, DataVisualizationChartInfo } from 'store/constant';
import { HAS_CENSORED_DATA_MARKER } from 'utils/utils';

const DEFAULT_CHART_DEFINITIONS = [
    {
        data: 'patients_per_program',
        chartType: 'bar',
        trim: false
    },
    {
        data: 'diagnosis_age_count',
        chartType: 'bar',
        trim: false
    },
    {
        data: 'treatment_type_count',
        chartType: 'bar',
        trim: false
    },
    {
        data: 'primary_site_count',
        chartType: 'bar',
        trim: false
    }
];

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

    const removeInvalidCharts = (chartDefinitions) => {
        const retVal = [];
        for (let i = 0; i < chartDefinitions.length; i += 1) {
            if (VALID_CHART_TYPES.includes(chartDefinitions[i].chartType) && typeof chartDefinitions[i].trim === 'boolean') {
                retVal.push(chartDefinitions[i]);
            }
        }

        return retVal;
    };

    const dataVis = {
        patients_per_program: handleCensoring('patients_per_program', (site, _) => site, true) || {},
        diagnosis_age_count: handleCensoring('age_at_diagnosis', (_, age) => age.replace(/ Years$/, '')) || {},
        treatment_type_count: handleCensoring('treatment_type_count') || {},
        primary_site_count: handleCensoring('primary_site_count') || {}
    };
    const theme = useTheme();

    // State management
    const [edit, setEdit] = useState(false);
    const [open, setOpen] = useState(false);

    // LocalStorage
    const [chartDefinitions, setChartDefinitions] = useState(
        localStorage.getItem(VISUALIZATION_LOCAL_STORAGE_KEY)
            ? removeInvalidCharts(JSON.parse(localStorage.getItem(VISUALIZATION_LOCAL_STORAGE_KEY)))
            : DEFAULT_CHART_DEFINITIONS
    );
    const [newDataKey, setNewDataKey] = useState('patients_per_program');
    const [newChartType, setNewChartType] = useState('bar');

    // Validate chart types to remove any that are not supported
    useEffect(() => {
        const invalidChartIndexes = [];
        for (let i = 0; i < chartDefinitions.length; i += 1) {
            // If this is not a valid chart type, remove it
            if (!VALID_CHART_TYPES.includes(chartDefinitions[i].chartType)) {
                invalidChartIndexes.push(i);
            }
            // If the data has loaded, but does not exist, then we also remove it
            else if (!Object.keys(dataVis).includes(chartDefinitions[i].data)) {
                invalidChartIndexes.push(i);
            }
        }

        if (invalidChartIndexes.length > 0) {
            setChartDefinitions((old) => {
                let newChartDefinitions = old.slice();
                invalidChartIndexes.forEach((index, numRemoved) => {
                    const indexToRemove = index - numRemoved;
                    newChartDefinitions = newChartDefinitions.slice(0, indexToRemove).concat(old.slice(indexToRemove + 1));
                });
                localStorage.setItem(VISUALIZATION_LOCAL_STORAGE_KEY, JSON.stringify(newChartDefinitions), { expires: 365 });
                return newChartDefinitions;
            });
        }
    }, [JSON.stringify(chartDefinitions)]); // eslint-disable-line react-hooks/exhaustive-deps

    // Intial localStorage setting if there are none
    useEffect(() => {
        if (!localStorage.getItem(VISUALIZATION_LOCAL_STORAGE_KEY)) {
            localStorage.setItem(VISUALIZATION_LOCAL_STORAGE_KEY, JSON.stringify(chartDefinitions), { expires: 365 });
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleToggleDialog = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    function setDataVisEntry(index, key, newVal) {
        setChartDefinitions((old) => {
            const newChartDefinitions = old.slice();
            newChartDefinitions[index][key] = newVal;
            localStorage.setItem(VISUALIZATION_LOCAL_STORAGE_KEY, JSON.stringify(newChartDefinitions), { expires: 365 });
            return newChartDefinitions;
        });
    }

    function removeChart(index) {
        setChartDefinitions((old) => {
            const newChartDefinitions = old.slice(0, index).concat(old.slice(index + 1));
            localStorage.setItem(VISUALIZATION_LOCAL_STORAGE_KEY, JSON.stringify(newChartDefinitions), { expires: 365 });
            return newChartDefinitions;
        });
    }

    function AddChart(data, chartType) {
        setOpen(false);
        setChartDefinitions((old) => {
            const newDefs = old.slice();
            newDefs.push({
                data,
                chartType: validStackedCharts.includes(data) ? 'bar' : chartType,
                trim: false
            });
            localStorage.setItem(VISUALIZATION_LOCAL_STORAGE_KEY, JSON.stringify(newDefs), { expires: 365 });
            return newDefs;
        });
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
                            <select value={newDataKey} name="types" id="types" onChange={(event) => setNewDataKey(event.target.value)}>
                                {Object.keys(dataVis).map((key) => (
                                    <option key={key} value={key}>
                                        {DataVisualizationChartInfo[key].title}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {validStackedCharts.includes(newDataKey) ? (
                            <label htmlFor="types">
                                Chart Types: &nbsp;
                                <select value="bar" name="types" id="types" onChange={(event) => setNewChartType(event.target.value)}>
                                    <option value="bar">Stacked Bar</option>
                                </select>
                            </label>
                        ) : (
                            <label htmlFor="types">
                                Chart Types: &nbsp;
                                <select
                                    value={newChartType}
                                    name="types"
                                    id="types"
                                    onChange={(event) => setNewChartType(event.target.value)}
                                >
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
                        <Button onClick={() => AddChart(newDataKey, newChartType || 'bar')}>Confirm</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        );
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
                    {chartDefinitions.map((item, index) => (
                        <Grid item xs={12} sm={12} md={6} lg={3} xl={3} key={JSON.stringify(item)}>
                            <CustomOfflineChart
                                dataObject=""
                                dataVis={dataVis}
                                data={item.data}
                                index={index}
                                chartType={item.chartType}
                                height="400px; auto"
                                dropDown
                                onRemoveChart={() => removeChart(index)}
                                edit={edit}
                                orderByFrequency={item.data !== 'diagnosis_age_count'}
                                orderAlphabetically={item.data === 'diagnosis_age_count'}
                                trimByDefault={item.trim}
                                onChangeDataVisChartType={(newType) => setDataVisEntry(index, 'chartType', newType)}
                                onChangeDataVisData={(newData) => setDataVisEntry(index, 'data', newData)}
                                loading={dataVis[item.data] === undefined}
                            />
                        </Grid>
                    ))}
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
