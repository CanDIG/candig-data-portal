import { useState, useEffect } from 'react';

// mui
import Grid from '@mui/material/Grid';
import useTheme from '@mui/system/useTheme';
import SmallCountCard from 'ui-component/cards/SmallCountCard';
import CustomOfflineChart from 'views/summary/CustomOfflineChart';
import TreatingCentreMap from 'views/summary/TreatingCentreMap';

// project imports
import { fetchClinicalCompleteness, fetchFederationStat, fetchGenomicCompleteness } from 'store/api';
import { aggregateObj, aggregateKatsuObj, aggregateObjStack, invertkatsu } from 'utils/utils';

// assets
import { Hive, CheckCircleOutline, WarningAmber, Person, Public } from '@mui/icons-material';

import { useSidebarWriterContext } from 'layout/MainLayout/Sidebar/SidebarContext';

function Summary() {
    const theme = useTheme();
    const [isLoading, setLoading] = useState({
        '/individual_count': true,
        '/primary_site_count': true,
        '/cohort_count': true,
        '/patients_per_cohort': true,
        '/treatment_type_count': true,
        '/diagnosis_age_count': true,
        clinical: true,
        genomic: true
    });

    const [provinceCounter, setProvinceCount] = useState(0);
    const [individualCount, setIndividualCount] = useState(undefined);
    const [primarySiteCount, setPrimarySiteCount] = useState(undefined);
    const [treatmentTypeCount, setTreatmentTypeCount] = useState(undefined);
    const [cohortCount, setCohortCount] = useState(undefined);
    const [patientsPerCohort, setPatientsPerCohort] = useState(undefined);
    const [diagnosisAgeCount, setDiagnosisAgeCount] = useState(undefined);
    const [numClinicalComplete, setNumClinicalComplete] = useState(undefined);
    const [numGenomicComplete, setNumGenomicComplete] = useState(undefined);
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

            data?.forEach((stat) => {
                // Federation aggregate count of stats
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
                            candigDataSouceCollection[stat.location['province-code']] += parseInt(stat.results.individual_count, 10);

                            setCanDigDataSource(candigDataSouceCollection);
                        }

                        break;
                    case '/cohort_count':
                        setCohortCount((oldCohortCount) => aggregateObj(stat.results, oldCohortCount));
                        break;
                    case '/patients_per_cohort':
                        setPatientsPerCohort((oldPatientsPerCohort) =>
                            aggregateObjStack(stat, oldPatientsPerCohort, (stat, _) => invertkatsu(stat.results))
                        );
                        break;
                    case '/primary_site_count':
                        setPrimarySiteCount((oldPrimarySiteCount) => aggregateKatsuObj(stat.results, oldPrimarySiteCount));
                        break;
                    case '/treatment_type_count':
                        setTreatmentTypeCount((oldTreatmentTypeCount) => aggregateKatsuObj(stat.results, oldTreatmentTypeCount));
                        break;
                    case '/diagnosis_age_count':
                        setDiagnosisAgeCount((oldDiagnosisAgeCount) => aggregateKatsuObj(stat.results, oldDiagnosisAgeCount));
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

    function finishEndpoint(endpoint) {
        setLoading((old) => {
            const newObj = { ...old };
            newObj[endpoint] = false;
            return newObj;
        });
    }

    function fetchClinical() {
        fetchClinicalCompleteness()
            .then((data) => {
                setNumClinicalComplete(data.numClinicalComplete);
            })
            .finally(() => {
                finishEndpoint('clinical');
            });
    }

    function fetchGenomic() {
        fetchGenomicCompleteness()
            .then((numCompleteGenomic) => {
                setNumGenomicComplete(numCompleteGenomic);
            })
            .finally(() => {
                finishEndpoint('genomic');
            });
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
                })
                .finally(() => {
                    finishEndpoint(endpoint);
                });
        }

        fetchData('/individual_count');
        fetchData('/primary_site_count');
        fetchData('/cohort_count');
        fetchData('/patients_per_cohort');
        fetchData('/treatment_type_count');
        fetchData('/diagnosis_age_count');
        fetchGenomic();
        fetchClinical();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    isLoading={isLoading['/individual_count']}
                    title="Number of Patients"
                    count={individualCount?.individual_count || 0}
                    primary
                    icon={<Person fontSize="inherit" />}
                    color={theme.palette.primary.main}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <SmallCountCard
                    isLoading={isLoading['/individual_count']}
                    title="Cohorts"
                    count={cohortCount?.cohort_count || 0}
                    icon={<Hive fontSize="inherit" />}
                    color={theme.palette.secondary.main}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <SmallCountCard
                    isLoading={isLoading['/individual_count']}
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
                    loading={isLoading['/diagnosis_age_count']}
                    orderAlphabetically
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
                    loading={isLoading['/treatment_type_count']}
                    orderByFrequency
                    cutoff={10}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <CustomOfflineChart
                    dataObject={primarySiteCount || {}}
                    data="primary_site_count"
                    dataVis=""
                    chartType="bar"
                    height="400px; auto"
                    dropDown={false}
                    loading={isLoading['/primary_site_count']}
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
                    loading={isLoading['/patients_per_cohort']}
                    orderByFrequency
                    cutoff={10}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <CustomOfflineChart
                    dataObject={numClinicalComplete || {}}
                    data="full_clinical_data"
                    dataVis=""
                    chartType="bar"
                    height="400px; auto"
                    dropDown={false}
                    loading={isLoading.clinical}
                    orderByFrequency
                    cutoff={10}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <CustomOfflineChart
                    dataObject={numGenomicComplete || {}}
                    data="full_genomic_data"
                    dataVis=""
                    chartType="bar"
                    height="400px; auto"
                    dropDown={false}
                    loading={isLoading.genomic}
                    orderByFrequency
                    cutoff={10}
                />
            </Grid>
        </Grid>
    );
}

export default Summary;
