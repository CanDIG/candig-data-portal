import { useState, useEffect } from 'react';

// mui
// import { useTheme, makeStyles } from '@mui/styles';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/styles/useTheme';
import SmallCountCard from 'ui-component/cards/SmallCountCard';
import CustomOfflineChart from 'views/summary/CustomOfflineChart';
import TreatingCentreMap from 'views/summary/TreatingCentreMap';

// project imports
import { fetchFederationStat } from 'store/api';
import { aggregateObj, aggregateObjStack } from 'utils/utils';

// assets
import {
    Hive,
    CheckCircleOutline,
    WarningAmber,
    Person,
    Public
} from '@mui/icons-material';

// Test data
import { fullClinicalData, fullGenomicData } from '../../store/constant';

function Summary() {
    const theme = useTheme();
    const [isLoading, setLoading] = useState(true);

    const [provinceCounter, setProvinceCount] = useState(0);
    const [individual_count, setIndividualCount] = useState({});
    const [cancer_type_count, setCancerTypeCount] = useState({});
    const [treatment_type_count, setTreatmentTypeCount] = useState({});
    const [cohort_count, setCohortCount] = useState({});
    const [patients_per_cohort, setPatientsPerCohort] = useState({});
    const [diagnosis_age_count, setDiagnosisAgeCount] = useState({});
    // const [fullClinicalData, setFullClinicalData] = useState({});
    // const [fullGenomicData, setFullGenomicData] = useState({});
    const [connectionError, setConnectionError] = useState(0);
    const [sites, setSites] = useState(0);
    const [totalSites, setTotalSites] = useState(0);

    const [canDigDataSource, setCanDigDataSource] = useState({});
    const [nodeStatus, setNodeStatus] = useState(true);

    /* Aggregated count of federated data */
    function federationStatCount(data, endpoint) {
        const candigDataSouceCollection = {};


        if (data.results) {
            // Fake Server with same URL
            data.results[0].location[0] = "UHN";
            data.results[0].location[1] = "Ontario";
            data.results[0].location[2] = "ca-on";

            let count = [];
            data.results.forEach((stat) => {

                count++;
                switch (endpoint) {
                    case '/individual_count':
                        setIndividualCount(aggregateObj(stat, individual_count));
                        if (stat.location) {
                            candigDataSouceCollection[stat.location[2]] = stat.individual_count;

                            if (count === data.results.length) {
                                setCanDigDataSource(candigDataSouceCollection);
                            }
                        }
                        break;
                    case '/cohort_count':
                        setCohortCount(aggregateObj(stat, cohort_count));
                        break;
                    case '/patients_per_cohort':
                        // Different aggregation must be used to stack the bar chart
                        setPatientsPerCohort(aggregateObjStack(stat, patients_per_cohort));
                        break;
                    case '/cancer_type_count':
                        setCancerTypeCount(aggregateObj(stat, cancer_type_count));
                        break;
                    case '/treatment_type_count':
                        setTreatmentTypeCount(aggregateObj(stat, treatment_type_count));
                        break;
                    case '/diagnosis_age_count':
                        setDiagnosisAgeCount(aggregateObj(stat, diagnosis_age_count));
                        break;
                }
            });
        }
    }

    function federationNode(data) {
        const nodeMap = new Map();

        if (data.message) {
            setProvinceCount((data.message).length);
        }

        data.message.forEach((message) => {
            const msg = message.split(" ");
            if (msg[0] === "Success!") {
                nodeMap.set("Active", nodeMap.get("Active") ? nodeMap.get("Active") + 1 : 1);
            } else {
                nodeMap.set("Error", nodeMap.get("Error") ? nodeMap.get("Error") + 1 : 1);
            }
        });

        setSites(nodeMap.get("Active"));
        setConnectionError(nodeMap.get("Error"));
        setTotalSites(nodeMap.get("Active") + nodeMap.get("Error"));

        if (nodeMap.get("Error") >= 1) {
            setNodeStatus(true);
        } else {
            setNodeStatus(false);
        }
    }


    useEffect(() => {
        function fetchData(endpoint) {
            fetchFederationStat(endpoint)
                .then((data) => {
                    federationStatCount(data, endpoint);
                    if (endpoint === "/individual_count") {
                        federationNode(data);
                    }
                }).catch((error) => {
                    // pass
                    console.log('Error fetching data : ', error);

                    setLoading(false);
                }).finally(() => setLoading(false));
        };

        fetchData('/individual_count')
        setTimeout(() => {
            fetchData('/cancer_type_count');
        }, 250);
        setTimeout(() => {
            fetchData('/cohort_count');
        }, 3000);
        setTimeout(() => {
            fetchData('/patients_per_cohort');
        }, 3750);
        setTimeout(() => {
            fetchData('/treatment_type_count');
        }, 6500);
        setTimeout(() => {
            fetchData('/diagnosis_age_count');
        }, 9250)

    }, []);

    return (
        <Grid container spacing={1}>
            {nodeStatus ? (
                <Grid container xs={12} sm={12} md={6} lg={3} pt={1} pl={1}>
                    <Grid item xs={true} sm={true} md={true} lg={true} pr={1}>
                        <SmallCountCard
                            title="Nodes"
                            count={`${sites}/${totalSites}`}
                            icon={<CheckCircleOutline fontSize="inherit" />}
                            color={theme.palette.secondary.main}
                        />
                    </Grid>
                    <Grid item xs={true} sm={true} md={true} lg={true}>
                        <SmallCountCard
                            title="Connection Error"
                            count={`${connectionError}/${totalSites}`}
                            icon={<WarningAmber fontSize="inherit" />}
                            color={theme.palette.error.main}
                        />
                    </Grid>
                </Grid>
            ) : (
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <SmallCountCard
                        title="Nodes"
                        count={sites}
                        icon={<CheckCircleOutline fontSize="inherit" />}
                        color={theme.palette.secondary.main}
                    />

                </Grid>
            )}
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <SmallCountCard
                    isLoading={isLoading}
                    title="Number of Patients"
                    count={individual_count.individual_count}
                    primary
                    icon={<Person fontSize="inherit" />}
                    color={theme.palette.primary.main}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <SmallCountCard
                    title="Cohorts"
                    count={cohort_count.cohort_count}
                    icon={<Hive fontSize="inherit" />}
                    color={theme.palette.secondary.main}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <SmallCountCard
                    isLoading={isLoading}
                    title="Provinces"
                    count={provinceCounter}
                    icon={<Public fontSize="inherit" />}
                    color={theme.palette.tertiary.main}
                />
            </Grid>
            {(Object.keys(canDigDataSource).length !== 0 && cohort_count) &&
                <Grid item xs={12} sm={12} md={12} lg={6} >
                    <TreatingCentreMap datasetName="" data={canDigDataSource} />
                </Grid>
            }
            {Object.keys(diagnosis_age_count).length !== 0 &&
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <CustomOfflineChart
                        datasetName=""
                        dataObject={diagnosis_age_count}
                        chartType="bar"
                        barTitle="Age Range Distribution"
                        height="400px; auto"
                        chart="bar"
                        xAxisTitle="Age Ranges"
                        yAxisTitle="Number of Patients"
                    />
                </Grid>
            }
            {Object.keys(treatment_type_count).length !== 0 &&
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <CustomOfflineChart
                        datasetName=""
                        dataObject={treatment_type_count}
                        chartType="bar"
                        barTitle="Treatment Type Distribution"
                        height="400px; auto"
                        chart="bar"
                        xAxisTitle="Treatment Type"
                        yAxisTitle="Number of Patients"
                    />
                </Grid>
            }
            {Object.keys(cancer_type_count).length !== 0 &&
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <CustomOfflineChart
                        datasetName=""
                        dataObject={cancer_type_count}
                        chartType="bar"
                        barTitle="Cancer Type Distribution"
                        height="400px; auto"
                        chart="bar"
                        xAxisTitle="Cancer Type"
                        yAxisTitle="Number of Patients"
                    />
                </Grid>
            }
            {Object.keys(patients_per_cohort).length !== 0 &&
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <CustomOfflineChart
                        datasetName=""
                        dataObject={patients_per_cohort}
                        chartType="bar"
                        barTitle="Distribution of Cohort by Node"
                        height="400px; auto"
                        chart="stackedBarChart"
                        xAxisTitle="Sites"
                        yAxisTitle="Number of Patients per Node"
                    />
                </Grid>
            }
            {Object.keys(fullClinicalData).length !== 0 &&
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <CustomOfflineChart
                        datasetName=""
                        dataObject={fullClinicalData}
                        chartType="bar"
                        barTitle="Cases with Complete Clinical Data"
                        height="400px; auto"
                        chart="stackedBarChart"
                        xAxisTitle="Sites"
                        yAxisTitle="Cases with Complete Clinical Data"
                    />
                </Grid>
            }
            {Object.keys(fullGenomicData).length !== 0 &&
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <CustomOfflineChart
                        datasetName=""
                        dataObject={fullGenomicData}
                        chartType="bar"
                        barTitle="Cases with Complete Genomic Data"
                        height="400px; auto"
                        chart="stackedBarChart"
                        xAxisTitle="Sites"
                        yAxisTitle="Cases with Complete Genomic Data"
                    />
                </Grid>
            }
        </Grid >
    );
}

export default Summary;
