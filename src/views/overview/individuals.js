import React, { useState, useEffect, useRef } from 'react';

// material-ui
import { useTheme, makeStyles } from '@material-ui/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Grid, Box } from '@material-ui/core';
import { Card, CardContent } from '@mui/material';
import CountCardPrimary from './CountCardPrimary';
import CountCardSecondary from './CountCardSecondary';
import SmallCountCardDark from './SmallCountCardDark';
import SmallCountCardLight from './SmallCountCardLight';
import CustomOfflineChart from './CustomOfflineChart';

import { groupBy } from '../../utils/utils';
import { schemaFxn } from '../../utils/ChordSchemas';
import { trackPromise } from 'react-promise-tracker';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { fetchKatsu } from 'store/api';
import { gridSpacing } from 'store/constant';

// Styles
const useStyles = makeStyles({
    dropdownItem: {
        background: 'white',
        paddingRight: '1.25em',
        paddingLeft: '1.25em',
        border: 'none',
        width: 'fit-content(5em)',
        '&:hover': {
            background: '#2196f3',
            color: 'white'
        }
    },
    mobileRow: {
        width: '700px'
    },
    scrollbar: {
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
            height: '0.4em',
            width: '0.4em'
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 4px rgba(0,0,0,0.00)'
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)'
        }
    }
});

/*
 * Return a specific extra property grouped by gender
 * @param {data}... Object
 * @param {property}... Property to be grouped by
 */
function groupExtraPropertieByGender(data, property) {
    const extraPropertieList = {};
    for (let i = 0; i < data.length; i += 1) {
        const key = data[i].sex.charAt(0).toUpperCase() + data[i].sex.slice(1).toLowerCase().replace('_', ' ');
        if (!extraPropertieList[key]) {
            extraPropertieList[key] = [];
        }
        extraPropertieList[key].push(parseFloat(schemaFxn(() => data[i].extra_properties[property])));
    }
    return extraPropertieList;
}

/*
 * Return the aggregation of diseases
 * @param {data}... Object
 */
function countDiseases(data) {
    const diseases = {};
    for (let i = 0; i < data.results.length; i += 1) {
        if (data.results[i].phenopackets !== undefined) {
            for (let j = 0; j < data.results[i].phenopackets.length; j += 1) {
                for (let k = 0; k < data.results[i].phenopackets[j].diseases.length; k += 1) {
                    const key = data.results[i].phenopackets[j].diseases[k].term.label;
                    if (!diseases[key]) {
                        diseases[key] = 0;
                    }
                    diseases[key] += 1;
                }
            }
        }
    }
    return diseases;
}

/*
 * Return the aggregation of phenotype datatypes
 * @param {data}... Object
 */
function countPhenotypeDatatype(data, type) {
    let count = 0;
    for (let i = 0; i < data.results.length; i += 1) {
        if (data.results[i].phenopackets !== undefined) {
            count += data.results[i].phenopackets[0][type].length;
        }
    }
    console.log(count);
    return count;
}

/*
 * Return the aggregation of a especific property under extra_property
 * @param {data}... Object
 * @param {property}... Property to be grouped by
 */
function getCounterUnderExtraProperties(data, property) {
    const education = {};
    for (let i = 0; i < data.length; i += 1) {
        const key = schemaFxn(() => data[i].extra_properties[property]);
        if (!education[key]) {
            education[key] = 0;
        }
        education[key] += 1;
    }

    return education;
}

function IndividualsOverview() {
    const theme = useTheme();
    const classes = useStyles();
    const [isLoading, setLoading] = useState(true);
    const [individualCounter, setIndividualCount] = useState(0);
    const [ethnicityObject, setEthnicityObject] = useState({ '': 0 });
    const [genderObject, setGenderObject] = useState({ '': 0 });
    const [doBObject, setDoBObject] = useState({ '': 0 });
    const [featureCount, setFeatureCount] = useState(0);
    const [biosampleCount, setBiosampleCount] = useState(0);
    const [diseasesObject, setDiseasesObject] = useState({ '': 0 });
    const [diseasesSum, setDiseasesSum] = useState(0);
    const [educationObject, setEducationObject] = useState({ '': 0 });
    const [boxPlotObject, setBoxPlotObject] = useState({ '': [] });
    const [didFetch, setDidFetch] = useState(false);

    const countIndividuals = (data) => {
        setIndividualCount(data.results.length);
    };

    const countEthnicity = (data) => {
        setEthnicityObject(groupBy(data.results, 'ethnicity'));
    };

    const countGender = (data) => {
        setGenderObject(groupBy(data.results, 'sex'));
    };

    const countDateOfBirth = (data) => {
        setDoBObject(groupBy(data.results, 'date_of_birth'));
    };

    useEffect(() => {
        let isMounted = true;
        trackPromise(
            fetchKatsu('/api/individuals?page_size=1000')
                .then((data) => {
                    if (isMounted) {
                        countIndividuals(data);
                        countEthnicity(data);
                        countGender(data);
                        countDateOfBirth(data);
                        const diseases = countDiseases(data);
                        setDiseasesObject(diseases);
                        setDiseasesSum(Object.keys(diseases).length);
                        setEducationObject(getCounterUnderExtraProperties(data, 'education'));

                        console.log(countPhenotypeDatatype(data, 'phenotypic_features'));
                        setFeatureCount(countPhenotypeDatatype(data, 'phenotypic_features'));
                        setBiosampleCount(countPhenotypeDatatype(data, 'biosamples'));
                        setDidFetch(true);
                    }
                })
                .catch(() => {
                    // pass
                    // setIndividualCount('Not available');
                    // setDiseasesSum('Not available');
                })
        );
        setLoading(false);

        return () => {
            isMounted = false;
        };
    }, [didFetch]);

    return (
        <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item lg={4} md={6} sm={6} xs={12}>
                        <CountCardPrimary isLoading={isLoading} title="Number of Individuals" count={individualCounter} />
                    </Grid>
                    <Grid item lg={4} md={6} sm={6} xs={12}>
                        <CountCardSecondary isLoading={isLoading} title="Phenotypic Features in Database" count={featureCount} />
                    </Grid>
                    <Grid item lg={4} md={12} sm={12} xs={12}>
                        <Grid container spacing={gridSpacing}>
                            <Grid item sm={6} xs={12} md={6} lg={12}>
                                <SmallCountCardDark isLoading={isLoading} title="Number of Diseases" count={diseasesSum} />
                            </Grid>
                            <Grid item sm={6} xs={12} md={6} lg={12}>
                                <SmallCountCardLight isLoading={isLoading} title="Number of Biosamples" count={biosampleCount} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Grid container spacing={gridSpacing}>
                    <Grid item xs={12} md={8}>
                        <CustomOfflineChart
                            datasetName=""
                            dataObject={ethnicityObject}
                            chartType="bar"
                            barTitle="Ethnicity"
                            height="500px; auto"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <CustomOfflineChart
                            datasetName=""
                            dataObject={genderObject}
                            chartType="pie"
                            barTitle="Gender"
                            height="500px; auto"
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default IndividualsOverview;
