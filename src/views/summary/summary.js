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
import { Hive, CheckCircleOutline, WarningAmber, Person, Public } from '@mui/icons-material';

// Test data
import { fullClinicalData, fullGenomicData } from '../../store/constant';

import { useSidebarWriterContext } from 'layout/MainLayout/Sidebar/SidebarContext';

function Summary() {
    const theme = useTheme();
    const [isLoading, setLoading] = useState(true);

    const [provinceCounter, setProvinceCount] = useState(0);
    const [individualCount, setIndividualCount] = useState(undefined);
    const [cancerTypeCount, setCancerTypeCount] = useState(undefined);
    const [treatmentTypeCount, setTreatmentTypeCount] = useState(undefined);
    const [cohortCount, setCohortCount] = useState(undefined);
    const [patientsPerCohort, setPatientsPerCohort] = useState(undefined);
    const [diagnosisAgeCount, setDiagnosisAgeCount] = useState(undefined);
    // const [fullClinicalData, setFullClinicalData] = useState({});
    // const [fullGenomicData, setFullGenomicData] = useState({});
    const [connectionError, setConnectionError] = useState(0);
    const [sites, setSites] = useState(0);
    const [totalSites, setTotalSites] = useState(0);

    const [canDigDataSource, setCanDigDataSource] = useState({});
    const [nodeStatus, setNodeStatus] = useState(true);

    // Clear the sidebar, if available
    const sidebarWriter = useSidebarWriterContext();
    useEffect(() => {
        sidebarWriter(null);
    }, [sidebarWriter]);

    /* Aggregated count of federated data */
    function federationStatCount(data, endpoint) {
        const candigDataSouceCollection = {};

        if (data && Array.isArray(data)) {
            // Fake Server with same URL
            // data[0].location[0] = 'UHN';
            // data[0].location[1] = 'Ontario';
            // data[0].location[2] = 'ca-on';

            let count = 0;
            data?.forEach((stat) => {
                // Federation aggregate count of stats
                count += 1;
                if (!stat.results) {
                    // Something went wrong
                    return;
                }

                switch (endpoint) {
                    case '/individual_count':
                        setIndividualCount((oldIndividualCount) => aggregateObj(stat.results, oldIndividualCount));
                        if (stat.location) {
                            if (!(stat.location['province-code'] in candigDataSouceCollection)) {
                                candigDataSouceCollection[stat.location['province-code']] = 0;
                            }
                            candigDataSouceCollection[stat.location['province-code']] += stat.results.individual_count;

                            if (count === data.length) {
                                setCanDigDataSource(candigDataSouceCollection);
                            }
                        }

                        break;
                    case '/cohort_count':
                        setCohortCount((oldCohortCount) => aggregateObj(stat.results, oldCohortCount));
                        break;
                    case '/patients_per_cohort':
                        setPatientsPerCohort((oldPatientsPerCohort) =>
                            aggregateObjStack(stat, oldPatientsPerCohort, (stat, _) => stat.results)
                        );
                        break;
                    case '/cancer_type_count':
                        setCancerTypeCount((oldCancerTypeCount) => aggregateObj(stat.results, oldCancerTypeCount));
                        break;
                    case '/treatment_type_count':
                        setTreatmentTypeCount((oldTreatmentTypeCount) => aggregateObj(stat.results, oldTreatmentTypeCount));
                        break;
                    case '/diagnosis_age_count':
                        setDiagnosisAgeCount((oldDiagnosisAgeCount) => aggregateObj(stat.results, oldDiagnosisAgeCount));
                        break;
                    default:
                        console.log(`Unknown endpoint: ${endpoint}`);
                        break;
                }
            });
        }
    }

    function federationNode(data) {
        const nodeMap = new Map();

        // Set Site Count/Provinces
        if (data) {
            setProvinceCount(new Set(data.map((loc) => loc.location.province)).size);
        }

        // Count Node Status
        data?.forEach((status) => {
            if (status.status === 200) {
                nodeMap.set('Active', nodeMap.get('Active') ? nodeMap.get('Active') + 1 : 1);
            } else {
                nodeMap.set('Error', nodeMap.get('Error') ? nodeMap.get('Error') + 1 : 1);
            }
        });

        // Set node status information
        setSites(nodeMap.get('Active'));
        setConnectionError(nodeMap.get('Error'));
        setTotalSites(nodeMap.get('Active') + nodeMap.get('Error'));

        // Set rendering of node status
        if (nodeMap.get('Error') >= 1) {
            setNodeStatus(true);
        } else {
            setNodeStatus(false);
        }
    }

    useEffect(() => {
        function fetchData(endpoint) {
            return fetchFederationStat(endpoint)
                .then((data) => {
                    federationStatCount(data, endpoint);
                    if (endpoint === '/individual_count') {
                        federationNode(data);
                    }
                })
                .catch((error) => {
                    // pass
                    console.log('Error fetching data : ', error);
                });
        }

        fetchData('/individual_count')
            .then(() => fetchData('/cancer_type_count'))
            .then(() => fetchData('/cohort_count'))
            .then(() => fetchData('/patients_per_cohort'))
            .then(() => fetchData('/treatment_type_count'))
            .then(() => fetchData('/diagnosis_age_count'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Grid container spacing={1}>
            {nodeStatus ? (
                <Grid item xs={12} sm={12} md={6} lg={3} pt={1} pl={1}>
                    <Grid container>
                        <Grid item xs={6} pr={1}>
                            <SmallCountCard
                                title="Nodes"
                                count={`${sites}/${totalSites}`}
                                icon={<CheckCircleOutline fontSize="inherit" />}
                                color={theme.palette.secondary.main}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <SmallCountCard
                                title="Connection Error"
                                count={`${connectionError}/${totalSites}`}
                                icon={<WarningAmber fontSize="inherit" />}
                                color={theme.palette.error.main}
                            />
                        </Grid>
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
                    count={individualCount?.individual_count || 0}
                    primary
                    icon={<Person fontSize="inherit" />}
                    color={theme.palette.primary.main}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <SmallCountCard
                    title="Cohorts"
                    count={cohortCount?.cohort_count || 0}
                    icon={<Hive fontSize="inherit" />}
                    color={theme.palette.secondary.main}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <SmallCountCard
                    isLoading={isLoading}
                    title="Provinces"
                    count={provinceCounter || 0}
                    icon={<Public fontSize="inherit" />}
                    color={theme.palette.tertiary.main}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={6}>
                <TreatingCentreMap datasetName="" data={canDigDataSource} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <CustomOfflineChart
                    data="diagnosis_age_count"
                    dataObject={diagnosisAgeCount || {}}
                    dataVis=""
                    height="400px; auto"
                    loading={diagnosisAgeCount === undefined}
                    chartType="bar"
                    dropDown={false}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <CustomOfflineChart
                    dataObject={treatmentTypeCount || {}}
                    data="treatment_type_count"
                    dataVis=""
                    chartType="bar"
                    height="400px; auto"
                    loading={treatmentTypeCount === undefined}
                    orderByFrequency
                    cutoff={10}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <CustomOfflineChart
                    dataObject={cancerTypeCount || {}}
                    data="cancer_type_count"
                    dataVis=""
                    chartType="bar"
                    height="400px; auto"
                    dropDown={false}
                    loading={cancerTypeCount === undefined}
                    orderByFrequency
                    cutoff={10}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <CustomOfflineChart
                    dataObject={patientsPerCohort || {}}
                    data="patients_per_cohort"
                    dataVis=""
                    chartType="bar"
                    height="400px; auto"
                    dropDown={false}
                    loading={patientsPerCohort === undefined}
                    orderByFrequency
                    cutoff={10}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <CustomOfflineChart
                    dataObject={fullClinicalData || {}}
                    data="full_clinical_data"
                    dataVis=""
                    chartType="bar"
                    height="400px; auto"
                    dropDown={false}
                    loading={fullClinicalData === undefined}
                    grayscale
                    orderByFrequency
                    cutoff={10}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <CustomOfflineChart
                    dataObject={fullGenomicData || {}}
                    data="full_genomic_data"
                    dataVis=""
                    chartType="bar"
                    height="400px; auto"
                    dropDown={false}
                    loading={fullGenomicData === undefined}
                    grayscale
                    orderByFrequency
                    cutoff={10}
                />
            </Grid>
        </Grid>
    );
}

export default Summary;
