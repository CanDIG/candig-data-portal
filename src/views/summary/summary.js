import { useState, useEffect } from 'react';

// mui
// import { useTheme, makeStyles } from '@mui/styles';
import { Grid } from '@mui/material';
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
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { groupCount } from 'utils/utils';
import { useSidebarWriterContext } from 'layout/MainLayout/Sidebar/SidebarContext';

function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function Summary() {
    const [isLoading, setLoading] = useState(true);
    const [individualCounter, setIndividualCount] = useState(0);
    const [provinceCounter, setProvinceCount] = useState(0);
    const [hospitalCounter, setHospitalCount] = useState(0);
    const [cohortCounter, setCohortCount] = useState(0);
    const [serverObject, setServerObject] = useState({ '': 0 });
    const [ethnicityObject, setEthnicityObject] = useState({ '': 0 });
    const [genderObject, setGenderObject] = useState({ '': 0 });
    const [canDigDataSource, setCanDigDataSource] = useState({});
    const [didFetch, setDidFetch] = useState(false);

    // Clear the sidebar, if available
    const sidebarWriter = useSidebarWriterContext();
    useEffect(() => {
        sidebarWriter(<></>);
    }, []);

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
                    setDidFetch(true);
                })
                .catch(() => {
                    // pass
                    setProvinceCount('Not Available');
                    setHospitalCount('Not Available');
                    setIndividualCount('Not Available');
                    setCohortCount('Not Available');
                })
        );

        trackPromise(
            fetchServers()
                .then((data) => {
                    /* Aggregated federated server data */
                    const SERVER_DATA = {
                        'Known Peers': Object.keys(data).length,
                        'Queried Peers': 2,
                        'Successful Communications': 1
                    };
                    setServerObject(SERVER_DATA);
                })
                .catch(() => {
                    // pass
                    /* Local site data in the event of no federated URL */
                    const SERVER_DATA = {
                        'Known Peers': 1,
                        'Queried Peers': 1,
                        'Successful Communications': 1
                    };
                    setServerObject(SERVER_DATA);
                })
        );

        setLoading(false);
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
                        <TreatingCentreMap datasetName="" data={canDigDataSource} />
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
                        <SmallCountCard title="Cohorts" count={cohortCounter} dark={false} icon={<HiveIcon fontSize="inherit" />} />
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
                            height="520px; auto"
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

export default Summary;
