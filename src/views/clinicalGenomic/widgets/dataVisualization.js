import { useState, useEffect } from 'react';
import { useTheme } from '@mui/styles';

// MUI
import { Box, Grid, IconButton } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

// Third-party libraries
import Cookies from 'js-cookie';
import { IconEdit, IconX, IconPlus } from '@tabler/icons';

// Custom Components and context
import CustomOfflineChart from 'views/summary/CustomOfflineChart';
import { useSearchResultsReaderContext } from '../SearchResultsContext';

// Constants
import { validStackedCharts, DataVisualizationChartInfo } from 'store/constant';

function DataVisualization(props) {
    // Hooks
    const resultsContext = useSearchResultsReaderContext();
    // Plan for context below see current dataVis for expected shape
    // const dataVis = context?.dataVis;
    const dataVis = {
        diagnosis_age_count: {
            '0-19 Years': 10,
            '20-29 Years': 20,
            '30-39 Years': 40,
            '40-49 Years': 60,
            '50-59 Years': 50,
            '60-69 Years': 55,
            '70-79 Years': 20,
            '80+ Years': 15
        },
        treatment_type_count: {
            Palate: 1,
            'Rectosigmoid junction': 1,
            Tonsil: 3,
            'Other and unspecified parts of mouth': 1,
            Oropharynx: 1,
            'Parotid gland': 2,
            'Other and unspecified parts of tongue': 1,
            'Other and unspecified parts of biliary tract': 1,
            Gum: 3
        },
        cancer_type_count: {
            'Breast C50.9': 50,
            'Ovary C56.9': 5,
            'Trachea C33': 30,
            'Cardia C16.0': 20,
            'Pancreas C25.9': 40,
            'Colon C18': 60,
            'Tonsil C09': 50
        },
        patients_per_cohort: {
            BCGSC: {
                POG: 50
            },
            UHN: {
                POG: 67,
                Inspire: 30,
                Biocan: 50,
                Biodiva: 30
            },
            C3G: {
                MOCK: 50
            }
        },
        full_clinical_data: {
            BCGSC: {
                POG: 30
            },
            UHN: {
                POG: 14,
                Inspire: 20,
                Biocan: 20,
                Biodiva: 10
            },
            C3G: {
                MOCK: 30
            }
        },
        full_genomic_data: {
            BCGSC: {
                POG: 10
            },
            UHN: {
                POG: 4,
                Inspire: 10,
                Biocan: 12,
                Biodiva: 12
            },
            C3G: {
                MOCK: 3
            }
        }
    };
    const theme = useTheme();

    // State management
    const [edit, setEdit] = useState(false);
    const [open, setOpen] = useState(false);

    // Top 4 keys from dataVis
    const topKeys = Object.keys(dataVis).slice(0, 4);

    // Cookies
    const [dataValue, setDataValue] = useState(
        Cookies.get('dataVisData') ? JSON.parse(Cookies.get('dataVisData'))[0] : 'patients_per_cohort'
    );
    const [chartType, setChartType] = useState(Cookies.get('dataVisChartType') ? JSON.parse(Cookies.get('dataVisChartType'))[0] : 'bar');
    const [dataVisData, setdataVisData] = useState(Cookies.get('dataVisData') ? JSON.parse(Cookies.get('dataVisData')) : topKeys);
    const [dataVisChartType, setDataVisChartType] = useState(
        Cookies.get('dataVisChartType') ? JSON.parse(Cookies.get('dataVisChartType')) : ['bar', 'line', 'column', 'bar']
    );

    // Intial cookie setting if there are none
    useEffect(() => {
        if (!Cookies.get('dataVisData') && !Cookies.get('dataVisChartType')) {
            const charts = topKeys.map(() => 'bar');
            Cookies.set('dataVisChartType', JSON.stringify(charts), { expires: 365 });
            Cookies.set('dataVisData', JSON.stringify(topKeys), { expires: 365 });
        }
    }, []);

    const handleToggleDialog = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    function removeChart(index) {
        const newDataVisChartType = dataVisChartType.slice(0, index).concat(dataVisChartType.slice(index + 1));
        const newdataVisData = dataVisData.slice(0, index).concat(dataVisData.slice(index + 1));
        setDataVisChartType(newDataVisChartType);
        setdataVisData(newdataVisData);
        Cookies.set('dataVisData', JSON.stringify(newdataVisData), { expires: 365 });
        Cookies.set('dataVisChartType', JSON.stringify(newDataVisChartType), { expires: 365 });
    }

    function AddChart(data, chartType) {
        setOpen(false);
        const newdataVisData = [...dataVisData, data];
        const newDataVisChartType = [...dataVisChartType, validStackedCharts.includes(data) ? 'bar' : chartType];
        setDataVisChartType(newDataVisChartType);
        setdataVisData(newdataVisData);
        Cookies.set('dataVisData', JSON.stringify(newdataVisData), { expires: 365 });
        Cookies.set('dataVisChartType', JSON.stringify(newDataVisChartType), { expires: 365 });
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
                        <Button onClick={() => AddChart(dataValue, chartType)}>Confirm</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        );
    }

    const completenessData = ['full_clinical_data', 'full_genomic_data'];
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
                    grayscale={completenessData.includes(item)}
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
                    background: 'white',
                    border: 1,
                    borderRadius: '100%',
                    borderColor: theme.palette.primary.main,
                    boxShadow: theme.shadows[8],
                    position: 'absolute',
                    zIndex: '1000',
                    padding: '0.5em',
                    right: -15,
                    top: -25
                }}
                onClick={() => setEdit(!edit)}
            >
                {!edit ? <IconEdit /> : <IconX />}
            </IconButton>
            <Grid container spacing={1} alignItems="center" justifyContent="center">
                {returndataVisData()}
            </Grid>
            {edit && (
                <IconButton
                    color="primary"
                    size="large"
                    sx={{
                        background: 'white',
                        border: 1,
                        borderRadius: '100%',
                        borderColor: theme.palette.primary.main,
                        boxShadow: theme.shadows[8],
                        position: 'absolute',
                        zIndex: '1000',
                        padding: '0.5em',
                        right: 50,
                        top: -25
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
