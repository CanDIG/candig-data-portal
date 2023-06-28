import { useEffect, useState } from 'react';

import { useSearchResultsReaderContext } from '../SearchResultsContext';
import { Box, Typography, Grid, IconButton } from '@mui/material';
import { makeStyles, useTheme } from '@mui/styles';

import CustomOfflineChart from 'views/summary/CustomOfflineChart';
import { diagnosisAgeCount } from 'store/constant';

// assets
import { IconEdit } from '@tabler/icons';

function DataVisualization(props) {
    const resultsContext = useSearchResultsReaderContext();
    const theme = useTheme();
    // const resultsContext = {sites: ["BCGSC", "UHN"]};

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
            >
                <IconEdit />
            </IconButton>
            <Grid container spacing={1} alignItems="center" justifyContent="center">
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <CustomOfflineChart
                        dataVis={dataVis}
                        dataObject=""
                        data="diagnosis_age_count"
                        chartType="bar"
                        height="400px; auto"
                        dropDown
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <CustomOfflineChart
                        dataObject=""
                        dataVis={dataVis}
                        data="treatment_type_count"
                        chartType="line"
                        height="400px; auto"
                        dropDown
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <CustomOfflineChart
                        dataObject=""
                        dataVis={dataVis}
                        data="cancer_type_count"
                        chartType="column"
                        height="400px; auto"
                        dropDown
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <CustomOfflineChart
                        dataObject=""
                        dataVis={dataVis}
                        data="patients_per_cohort"
                        chartType="bar"
                        height="400px; auto"
                        dropDown
                    />
                </Grid>
            </Grid>
        </Box>
    );
}

export default DataVisualization;
