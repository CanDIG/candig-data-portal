import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { AppBar, Button, Divider, Link, Toolbar } from '@mui/material';

import { makeStyles } from '@mui/styles';
import MainCard from 'ui-component/cards/MainCard';
import VariantsSearch from '../genomicsData/VariantsSearch.js';
import PatientCounts from './widgets/patientCounts.js';
import DataVisualization from './widgets/dataVisualization';
import ClinicalData from './widgets/clinicalData';
import PivotTable from './widgets/pivotTable';
import { useSidebarWriterContext } from '../../layout/MainLayout/Sidebar/SidebarContext';
import Sidebar from './widgets/sidebar.js';
import { PRIMARY_SITES, COHORTS } from 'store/constant';
import SearchHandler from './search/SearchHandler.js';
import GenomicData from './widgets/genomicData.js';

const useStyles = makeStyles((theme) => ({
    stickytop: {
        position: 'sticky',
        backgroundColor: 'white',
        width: '100%',
        zIndex: 101
    },
    spaceBetween: {
        height: 30
    },
    anchor: {
        display: "block",
        position: "relative",
        top: -82,   // Height of the header
        visibility: "hidden"
    }
}));

const sections = [
    {
        id: "counts",
        header: "Patient Counts",
        component: <PatientCounts />
    },
    {
        id: "visualization",
        header: "Data Visualization",
        component: <DataVisualization />
    },
    {
        id: "clinical",
        header: "Patient Counts",
        component: <ClinicalData />
    },
    {
        id: "pivot",
        header: "Pivot Table",
        component: <PivotTable />
    },
    {
        id: "genomic",
        header: "Genomic Data",
        component: <GenomicData />
    },
]

function ClinicalGenomicSearch() {
    const events = useSelector((state) => state);
    const classes = useStyles();
    const sidebarWriter = useSidebarWriterContext();

    // When we load, set the sidebar component
    useEffect(() => {
        sidebarWriter(<Sidebar sites={['BCGSC', 'UHN']} cohorts={COHORTS} />);
    }, []);

    return (
        <>
            {/* Top bar */}
            <AppBar position="static">
                <Toolbar>
                    {sections.map((section) =>
                        <Button
                            onClick={() => {window.location.href = "#" + section.id;}}
                            sx={{ my: 2, color: 'white', display: 'block' }}
                            key={section.id}
                        >
                            {section.header}
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
            <SearchHandler />
            <MainCard
                title="Federated Search"
                sx={{ minHeight: 830, position: 'relative', borderRadius: events.customization.borderRadius * 0.25 }}
            >
                <div id="stickytop" className={classes.stickytop}>
                    <Divider />
                    {/* Genomic Searchbar */}
                    <div id="searchbar">
                        <VariantsSearch />
                    </div>
                    {/* For now, until I figure out how to make it its own card */}
                    <Divider />
                </div>
                {sections.map((section) =>
                    <div>
                        <a class="anchor" id={section.id} className={classes.anchor}></a>
                        <h3>{section.header}</h3>
                        {section.component}
                        <div className={classes.spaceBetween} />
                    </div>
                )}
            </MainCard>
        </>
    );
}

export default ClinicalGenomicSearch;
