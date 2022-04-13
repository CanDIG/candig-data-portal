import React, { useState, useEffect } from 'react';

// material-ui
// import { useTheme, makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';
import CountCard from 'ui-component/cards/CountCard';
import SmallCountCard from 'ui-component/cards/SmallCountCard';
import CustomOfflineChart from 'views/overview/CustomOfflineChart';

import { groupBy } from 'utils/utils';
// import { schemaFxn } from 'utils/ChordSchemas';
import { trackPromise } from 'react-promise-tracker';

// project imports
import { fetchKatsu } from 'store/api';
import { gridSpacing } from 'store/constant';

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
    return count;
}

function IndividualsOverview() {
    const [isLoading, setLoading] = useState(true);
    const [individualCounter, setIndividualCount] = useState(0);
    const [ethnicityObject, setEthnicityObject] = useState({ '': 0 });
    const [genderObject, setGenderObject] = useState({ '': 0 });
    const [featureCount, setFeatureCount] = useState(0);
    const [biosampleCount, setBiosampleCount] = useState(0);
    const [diseasesSum, setDiseasesSum] = useState(0);
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

    useEffect(() => {
        let isMounted = true;
        trackPromise(
            fetchKatsu('/api/individuals?page_size=1000')
                .then((data) => {
                    if (isMounted) {
                        countIndividuals(data);
                        countEthnicity(data);
                        countGender(data);
                        const diseases = countDiseases(data);
                        setDiseasesSum(Object.keys(diseases).length);

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
                        <CountCard isLoading={isLoading} title="Number of Individuals" count={individualCounter} primary />
                    </Grid>
                    <Grid item lg={4} md={6} sm={6} xs={12}>
                        <CountCard isLoading={isLoading} title="Phenotypic Features in Database" count={featureCount} primary={false} />
                    </Grid>
                    <Grid item lg={4} md={12} sm={12} xs={12}>
                        <Grid container spacing={gridSpacing}>
                            <Grid item sm={6} xs={12} md={6} lg={12}>
                                <SmallCountCard isLoading={isLoading} title="Number of Diseases" count={diseasesSum} dark />
                            </Grid>
                            <Grid item sm={6} xs={12} md={6} lg={12}>
                                <SmallCountCard isLoading={isLoading} title="Number of Biosamples" count={biosampleCount} dark={false} />
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
