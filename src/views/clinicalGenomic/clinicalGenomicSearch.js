import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Divider, Link } from '@mui/material';

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

const useStyles = makeStyles((theme) => ({
    stickytop: {
        position: 'sticky',
        backgroundColor: 'white',
        width: '100%',
        zIndex: 101
    },
    spaceBetween: {
        height: 30
    }
}));

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
                {/* Patient Counts */}
                <div id="counts">
                    <h3>Patient Counts</h3>
                    <PatientCounts />
                </div>
                <div className={classes.spaceBetween} />
                {/* Data visualization */}
                <div id="visualization">
                    <h3>Data Visualization</h3>
                    <DataVisualization />
                </div>
                <div className={classes.spaceBetween} />
                {/* Clinical Data */}
                <div id="clinical">
                    <h3>Clinical Data</h3>
                    <ClinicalData />
                </div>
                <div className={classes.spaceBetween} />
                {/* Pivot Table */}
                <div id="pivot">
                    <h3>Pivot Table</h3>
                    <PivotTable />
                </div>
                <div className={classes.spaceBetween} />
                {/* Genomic Data (JSON view) */}
                <div id="genomic">
                    <h3>Genomic Data</h3>
                </div>
            </MainCard>
        </>
    );
}

export default ClinicalGenomicSearch;
