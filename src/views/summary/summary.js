import { useState, useEffect } from 'react';

// mui
// import { useTheme, makeStyles } from '@mui/styles';
import { Grid } from '@mui/material';
import { useTheme } from '@mui/styles';
import SmallCountCard from 'ui-component/cards/SmallCountCard';
import CustomOfflineChart from 'views/summary/CustomOfflineChart';
import TreatingCentreMap from 'views/summary/TreatingCentreMap';
import { trackPromise } from 'react-promise-tracker';

// project imports
import { fetchFederationStat, fetchServers } from 'store/api';
import { gridSpacing } from 'store/constant';

// assets
import HiveIcon from '@mui/icons-material/Hive';
// import QueryStatsIcon from '@mui/icons-material/QueryStats';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { groupCount } from 'utils/utils';

// Test data
import { AGE, primarySite, cancerType, cohortByNode, fullClinicalData, fullGenomicData } from '../../store/constant';
import { theme } from 'highcharts';

function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function Summary() {
    const theme = useTheme();
    const [isLoading, setLoading] = useState(true);
    const [individualCounter, setIndividualCount] = useState(0);
    const [provinceCounter, setProvinceCount] = useState(0);
    const [hospitalCounter, setHospitalCount] = useState(0);
    const [cohortCounter, setCohortCount] = useState(0);
    const [ethnicityObject, setEthnicityObject] = useState({ '': 0 });
    const [genderObject, setGenderObject] = useState({ '': 0 });
    const [canDigDataSource, setCanDigDataSource] = useState({});
    const [nodeStatus, setNodeStatus] = useState(true);
    /* Aggregated count of federated data */
    function federationStatCount(data) {
        let hospitalCount = 0;
        let provinceCount = 0;
        let individualCount = 0;
        let cohortCount = 0;
        const ethnicitiesCount = {};
        const gendersCount = {};
        const candigDataSouceCollection = {};
        data.results.forEach((stat) => {
            hospitalCount += stat?.location ? 1 : 0;
            provinceCount += stat?.location ? 1 : 0;
            individualCount += stat?.individual_count ? stat?.individual_count : 0;
            cohortCount += stat?.cohort_count ? stat?.cohort_count : 0;
            if (stat.location) {
                candigDataSouceCollection[stat.location[2]] = stat?.individual_count ? stat?.individual_count : 0;
            }
            if (stat.gender) {
                stat.gender.forEach((gender) => {
                    if (gender.count > 0) {
                        const genderSex = gender.sex ? toTitleCase(gender.sex) : 'Unknown';
                        gendersCount[genderSex] = gendersCount[genderSex] ? gender.count + gendersCount[genderSex] : gender.count;
                    }
                });
            }
            if (stat.ethnicity) {
                stat.ethnicity.forEach((ethnicity) => {
                    if (ethnicity.count > 0) {
                        const ethnicityName = ethnicity.ethnicity ? toTitleCase(ethnicity.ethnicity) : 'Unknown';
                        ethnicitiesCount[ethnicityName] = ethnicitiesCount[ethnicityName]
                            ? ethnicity.count + ethnicitiesCount[ethnicityName]
                            : ethnicity.count;
                    }
                });
            }
        });
        setProvinceCount(provinceCount);
        setHospitalCount(hospitalCount);
        setIndividualCount(individualCount);
        setCohortCount(cohortCount);
        setEthnicityObject(ethnicitiesCount);
        setGenderObject(gendersCount);
        setCanDigDataSource(candigDataSouceCollection);
    }

    /* Setting summary page to local site data */
    function summaryStats(data) {
        setProvinceCount(data?.province_count ? data?.province_count : 0);
        setHospitalCount(data?.hospital_count ? data?.hospital_count : 0);
        setIndividualCount(data?.individual_count ? data?.individual_count : 0);
        setCohortCount(data?.cohort_count ? data?.cohort_count : 0);
        setEthnicityObject(groupCount(data.ethnicity, 'ethnicity'));
        setGenderObject(groupCount(data.gender, 'sex'));
    }

    useEffect(() => {
        trackPromise(
            fetchFederationStat()
                .then((data) => {
                    if (data.results) {
                        federationStatCount(data);
                    } else {
                        summaryStats(data);
                    }
                })
                .catch(() => {
                    // pass
                    setProvinceCount('Not Available');
                    setHospitalCount('Not Available');
                    setIndividualCount('Not Available');
                    setCohortCount('Not Available');
                })
        );

        setLoading(false);
    }, []);

    return (
        <Grid container spacing={1}>
            {nodeStatus ? (
                <Grid container xs={12} sm={12} md={6} lg={3} pt={1} pl={1}>
                    <Grid item xs={true} sm={true} md={true} lg={true} pr={1}>
                        <SmallCountCard
                            title="Nodes"
                            count={'1/2'}
                            icon={<CheckCircleOutlineIcon fontSize="inherit" />}
                            color={theme.palette.secondary.main}
                        />
                    </Grid>
                    <Grid item xs={true} sm={true} md={true} lg={true}>
                        <SmallCountCard
                            title="Connection Error"
                            count={'1/2'}
                            icon={<WarningAmberIcon fontSize="inherit" />}
                            color={theme.palette.error.main}
                        />
                    </Grid>
                </Grid>
            ) : (
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <SmallCountCard
                        title="Nodes"
                        count={'2'}
                        icon={<CheckCircleOutlineIcon fontSize="inherit" />}
                        color={theme.palette.secondary.main}
                    />

                </Grid>
            )}
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <SmallCountCard
                    isLoading={isLoading}
                    title="Number of Patients"
                    count={individualCounter}
                    primary
                    icon={<PersonIcon fontSize="inherit" />}
                    color={theme.palette.primary.main}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <SmallCountCard
                    title="Hospitals"
                    count={hospitalCounter}
                    icon={<AccountBalanceIcon fontSize="inherit" />}
                    color={theme.palette.secondary.main}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <SmallCountCard
                    isLoading={isLoading}
                    title="Provinces"
                    count={provinceCounter}
                    icon={<PublicIcon fontSize="inherit" />}
                    color={theme.palette.tertiary.main}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={6} >
                <TreatingCentreMap datasetName="" data={canDigDataSource} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <CustomOfflineChart
                    datasetName=""
                    dataObject={AGE}
                    chartType="bar"
                    barTitle="Age Range Distribution"
                    height="400px; auto"
                    chart="bar"
                    xAxisTitle="Age Ranges"
                    yAxisTitle="Number of Patients"
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <CustomOfflineChart
                    datasetName=""
                    dataObject={primarySite}
                    chartType="bar"
                    barTitle="Treatment Type Distribution"
                    height="400px; auto"
                    chart="bar"
                    xAxisTitle="Treatment Type"
                    yAxisTitle="Number of Patients"
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <CustomOfflineChart
                    datasetName=""
                    dataObject={cancerType}
                    chartType="bar"
                    barTitle="Cancer Type Distribution"
                    height="400px; auto"
                    chart="bar"
                    xAxisTitle="Cancer Type"
                    yAxisTitle="Number of Patients"
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <CustomOfflineChart
                    datasetName=""
                    dataObject={cohortByNode}
                    chartType="bar"
                    barTitle="Distribution of Cohort by Node"
                    height="400px; auto"
                    chart="stackedBarChart"
                    xAxisTitle="Sites"
                    yAxisTitle="Number of Patients per Node"
                />
            </Grid>
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
        </Grid>
    );
}

export default Summary;
