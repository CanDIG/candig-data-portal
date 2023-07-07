import { useState } from 'react';

// MUI
import { Box, Grid, IconButton } from '@mui/material';
import { useTheme } from '@mui/styles';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

// Componenets
import CustomOfflineChart from 'views/summary/CustomOfflineChart';
import { useSearchResultsReaderContext } from '../SearchResultsContext';

// assets
import { IconEdit, IconX, IconPlus } from '@tabler/icons';

function DataVisualization(props) {
    const resultsContext = useSearchResultsReaderContext();
    const theme = useTheme();
    const [edit, setEdit] = useState(false);
    const [open, setOpen] = useState(false);
    const [dropDownValue, setDropDownValue] = useState('patients_per_cohort');
    const [dataVisArray, setDataVisArray] = useState([
        'diagnosis_age_count',
        'treatment_type_count',
        'cancer_type_count',
        'patients_per_cohort'
    ]);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    function removeChart(index) {
        const newArray = [...dataVisArray];
        newArray.splice(index, 1);
        setDataVisArray(newArray);
    }

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
        cohort_by_node: {
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

    function AddChart(value) {
        setOpen(false);
        const newArray = [...dataVisArray];
        console.log(value);
        newArray.push(value);
        setDataVisArray(newArray);
    }
    /* eslint-disable jsx-a11y/no-onchange */
    function returnChartDialog() {
        return (
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Create New Chart</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Select chart data for new chart from dropdown below. You can add multiple charts to the page.
                    </DialogContentText>
                    <form>
                        <label htmlFor="types">
                            Data:
                            <select
                                value={dropDownValue}
                                name="types"
                                id="types"
                                onChange={(event) => setDropDownValue(event.target.value)}
                            >
                                <option value="patients_per_cohort">Distribution of Cohort by Node</option>
                                <option value="full_clinical_data">Complete Clinical Data</option>
                                <option value="full_genomic_data">Complete Genomic Data</option>
                                <option value="diagnosis_age_count">Age</option>
                                <option value="treatment_type_count">Treatment</option>
                                <option value="cancer_type_count">Cancer type</option>
                            </select>
                        </label>
                    </form>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={() => AddChart(dropDownValue)}>Confirm</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        );
    }

    function returnDataVisArray() {
        const data = dataVisArray.map((item, index) => (
            <Grid item xs={12} sm={12} md={6} lg={3} key={item}>
                <CustomOfflineChart
                    dataObject=""
                    dataVis={dataVis}
                    data={item}
                    chartType="bar"
                    height="400px; auto"
                    dropDown
                    callBack={() => removeChart(index)}
                    edit={edit}
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
                {returnDataVisArray()}
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
                    onClick={() => handleClickOpen()}
                >
                    <IconPlus />
                </IconButton>
            )}
            {returnChartDialog()}
        </Box>
    );
}

export default DataVisualization;
