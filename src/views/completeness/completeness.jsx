import { useState, useEffect } from 'react';

// mui
// import { useTheme, makeStyles } from '@mui/styles';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/system/useTheme';
import SmallCountCard from 'ui-component/cards/SmallCountCard';
import CustomOfflineChart from 'views/summary/CustomOfflineChart';

// project imports
import { fetchClinicalCompleteness, fetchFederation, fetchGenomicCompleteness } from 'store/api';

// assets
import { CheckCircleOutline, WarningAmber, Person } from '@mui/icons-material';

// Test data
import { useSidebarWriterContext } from 'layout/MainLayout/Sidebar/SidebarContext';
import FieldLevelCompletenessGraph from './fieldLevelCompletenessGraph';

function Completeness() {
    const theme = useTheme();
    const [clinicalComplete, setClinicalComplete] = useState([]);
    const [numNodes, setNumNodes] = useState(0);
    const [numErrorNodes, setNumErrorNodes] = useState(0);
    const [numDonors, setNumDonors] = useState(0);
    const [numCompleteDonors, setNumCompleteDonors] = useState(0);
    const [numProvinces, setNumProvinces] = useState(0);
    const [numClinicalComplete, setNumClinicalComplete] = useState(0);
    const [numGenomicComplete, setNumGenomicComplete] = useState(0);
    const [isLoading, setLoading] = useState(true);

    // Clear the sidebar, if available
    const sidebarWriter = useSidebarWriterContext();
    useEffect(() => {
        sidebarWriter(null);
    }, [sidebarWriter]);

    useEffect(() => {
        const programsQuery = fetchClinicalCompleteness().then((data) => {
            setNumProvinces(data.numProvinces);
            setNumNodes(data.numNodes);
            setNumErrorNodes(data.numErrorNodes);
            setNumDonors(data.numDonors);
            setNumCompleteDonors(data.numCompleteDonors);
            setNumClinicalComplete(data.numClinicalComplete);
            setClinicalComplete(data.data);
        });

        const genomicQuery = fetchGenomicCompleteness().then((data) => {
            setNumGenomicComplete(data);
        });

        Promise.all([programsQuery, genomicQuery]).then(() => {
            setLoading(false);
        });
    }, []);

    return (
        <Grid container spacing={1}>
            {numErrorNodes > 0 ? (
                <Grid item xs={12} sm={12} md={6} lg={3} pt={1} pl={1}>
                    <Grid container>
                        <Grid item xs={3} pr={1}>
                            <SmallCountCard
                                title="Nodes"
                                count={`${numNodes}/${numNodes + numErrorNodes}`}
                                icon={<CheckCircleOutline fontSize="inherit" />}
                                color={theme.palette.secondary.main}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <SmallCountCard
                                title="Connection Error"
                                count={`${numErrorNodes}/${numNodes + numErrorNodes}`}
                                icon={<WarningAmber fontSize="inherit" />}
                                color={theme.palette.error.main}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            ) : (
                <Grid item xs={12} sm={12} md={6} lg={3}>
                    <SmallCountCard
                        isLoading={isLoading}
                        title="Nodes"
                        count={numNodes}
                        icon={<CheckCircleOutline fontSize="inherit" />}
                        color={theme.palette.secondary.main}
                    />
                </Grid>
            )}
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <SmallCountCard
                    isLoading={isLoading}
                    title="Number of Patients"
                    count={numDonors || 0}
                    primary
                    icon={<Person fontSize="inherit" />}
                    color={theme.palette.primary.main}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <SmallCountCard
                    isLoading={isLoading}
                    title="Number of Patients With Complete Data"
                    count={numCompleteDonors || 0}
                    primary
                    icon={<Person fontSize="inherit" />}
                    color={theme.palette.secondary.main}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <SmallCountCard
                    isLoading={isLoading}
                    title="Provinces"
                    count={numProvinces || 0}
                    primary
                    icon={<Person fontSize="inherit" />}
                    color={theme.palette.tertiary.main}
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
                    loading={isLoading}
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
                    loading={isLoading}
                    orderByFrequency
                    cutoff={10}
                />
            </Grid>
            {/* <Grid item xs={12} sm={12} md={6} lg={6}>
                <MainCard>(Percentage complete graph)</MainCard>
            </Grid> */}
            <Grid item xs={12} sm={12} md={6} lg={6}>
                <FieldLevelCompletenessGraph data={clinicalComplete} loading={clinicalComplete.length === 0} title="Field Level" />
            </Grid>
        </Grid>
    );
}

export default Completeness;
