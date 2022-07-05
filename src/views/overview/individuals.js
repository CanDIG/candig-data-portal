import React, { useState, useEffect } from 'react';

// material-ui
// import { useTheme, makeStyles } from '@material-ui/styles';
import { Grid, Stack } from '@material-ui/core';
import CountCard from 'ui-component/cards/CountCard';
import SmallCountCard from 'ui-component/cards/SmallCountCard';
import CustomOfflineChart from 'views/overview/CustomOfflineChart';
import TreatingCentreMap from 'views/overview/TreatingCentreMap';

import { groupBy } from 'utils/utils';
// import { schemaFxn } from 'utils/ChordSchemas';
import { trackPromise } from 'react-promise-tracker';

// project imports
import { fetchKatsu } from 'store/api';
import { gridSpacing } from 'store/constant';

// assets
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import PublicIcon from '@material-ui/icons/Public';
import BiotechIcon from '@material-ui/icons/Biotech';
import QueryStatsIcon from '@material-ui/icons/QueryStats';
import PersonIcon from '@material-ui/icons/Person';

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
    const [provinceCounter, setProvinceCount] = useState(0);
    const [hospitalCounter, setHospitalCount] = useState(0);
    const [serverObject, setServerObject] = useState({ '': 0 });
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
                        setProvinceCount('1');
                        setHospitalCount('1');
                        countIndividuals(data);
                        countEthnicity(data);
                        countGender(data);
                        const diseases = countDiseases(data);
                        setDiseasesSum(Object.keys(diseases).length);

                        const SERVER_DATA = {
                            'Known Peers': 3,
                            'Queried Peers': 3,
                            'Successful Communications': 1
                        };

                        setServerObject(SERVER_DATA);

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
        <Grid container>
            <Grid container xs={12} pb={2.5}>
                <Grid item xs={12} sm={6} md={6} lg={6}>
                    <Grid item xs={12} pb={3} pr={2}>
                        <SmallCountCard
                            isLoading={isLoading}
                            title="Provinces"
                            count={provinceCounter}
                            dark={false}
                            icon={<PublicIcon fontSize="inherit" />}
                        />
                    </Grid>
                    <Grid item xs={12} pb={2} pr={2}>
                        <TreatingCentreMap datasetName="" />
                    </Grid>
                </Grid>
                <Grid container spacing={2} xs={12} sm={6} md={6} lg={6}>
                    <Grid item xs={12}>
                        <SmallCountCard
                            title="Hospitals"
                            count={hospitalCounter}
                            dark={false}
                            icon={<AccountBalanceIcon fontSize="inherit" />}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <CustomOfflineChart
                            datasetName=""
                            dataObject={serverObject}
                            chartType="bar"
                            barTitle="Server Status"
                            height="186px; auto"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <SmallCountCard
                            isLoading={isLoading}
                            title="Number of Individuals"
                            count={individualCounter}
                            primary
                            icon={<PersonIcon fontSize="inherit" />}
                        />
                    </Grid>
                    {/* <Grid item lg={4} md={6} sm={6} xs={12}>
                        <CountCard
                            isLoading={isLoading}
                            title="Phenotypic Features in Database"
                            count={featureCount}
                            primary={false}
                            icon={<PersonIcon fontSize="inherit" />}
                        />
                    </Grid> */}
                    {/* <Grid container spacing={gridSpacing}> */}
                    {/* <Grid item sm={6} xs={12} md={6} lg={12}>
                                <SmallCountCard
                                    isLoading={isLoading}
                                    title="Number of Diseases"
                                    count={diseasesSum}
                                    dark
                                    icon={<QueryStatsIcon fontSize="inherit" />}
                                />
                            </Grid> */}
                    <Grid item xs={12}>
                        <SmallCountCard
                            title="Number of Biosamples"
                            count={biosampleCount}
                            dark={false}
                            icon={<BiotechIcon fontSize="inherit" />}
                        />
                        {/* </Grid> */}
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
                            barTitle="Distribution of Ethnicity"
                            height="500px; auto"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <CustomOfflineChart
                            datasetName=""
                            dataObject={genderObject}
                            chartType="pie"
                            barTitle="Distribution of Gender"
                            height="500px; auto"
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default IndividualsOverview;
