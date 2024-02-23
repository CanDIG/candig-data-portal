import { createRef, useState, useEffect } from 'react';

// mui
// import { useTheme, makeStyles } from '@mui/styles';
import Grid from '@mui/material/Grid';
import useTheme from '@mui/system/useTheme';
import SmallCountCard from 'ui-component/cards/SmallCountCard';
import CustomOfflineChart from 'views/summary/CustomOfflineChart';

// project imports
import { fetchFederation } from 'store/api';

// assets
import { CheckCircleOutline, WarningAmber, Person } from '@mui/icons-material';

// Test data
import { useSidebarWriterContext } from 'layout/MainLayout/Sidebar/SidebarContext';
import MainCard from 'ui-component/cards/MainCard';
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
        const programsQuery = fetchFederation('discovery/programs', 'query').then((data) => {
            // Step 1: Determine the number of provinces
            const provinces = data.map((site) => site?.location?.province);
            const uniqueProvinces = [...new Set(provinces)];
            setNumProvinces(uniqueProvinces.length);

            // Step 2: Determine the number of nodes
            setNumNodes(data.length);

            // Step 3: Determine the number of donors
            let totalSites = 0;
            let totalErroredSites = 0;
            let totalCases = 0;
            let completeCases = 0;
            const completeClinical = {};
            console.log(data);
            data.forEach((site) => {
                totalSites += 1;
                totalErroredSites += site.status === 200 ? 0 : 1;
                site?.results?.programs?.forEach((program) => {
                    if (program?.metadata?.summary_cases) {
                        totalCases += program.metadata.summary_cases.total_cases;
                        completeCases += program.metadata.summary_cases.complete_cases;
                        if (!(site.location.name in completeClinical)) {
                            completeClinical[site.location.name] = {};
                        }
                        completeClinical[site.location.name][program.program_id] = program.metadata.summary_cases.total_cases;
                    }
                });
            });
            setNumNodes(totalSites);
            setNumErrorNodes(totalErroredSites);
            setNumDonors(totalCases);
            setNumCompleteDonors(completeCases);
            console.log(completeClinical);
            setNumClinicalComplete(completeClinical);
            setClinicalComplete(data);
        });

        const genomicQuery = fetchFederation('genomic_completeness', 'query').then((data) => {
            const numCompleteGenomic = {};
            data.filter((site) => site.status === 200).forEach((site) => {
                numCompleteGenomic[site.location.name] = 0;
                Object.keys(site.results).forEach((program) => {
                    numCompleteGenomic[site.location.name] += site.results[program].all;
                });
            });
            setNumGenomicComplete(numCompleteGenomic);
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
                    chartType="column"
                    height="400px; auto"
                    dropDown={false}
                    loading={undefined}
                    orderByFrequency
                    cutoff={10}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={3}>
                <CustomOfflineChart
                    dataObject={numGenomicComplete || {}}
                    data="full_genomic_data"
                    dataVis=""
                    chartType="column"
                    height="400px; auto"
                    dropDown={false}
                    loading={undefined}
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
