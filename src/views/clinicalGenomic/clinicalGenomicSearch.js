import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { AppBar, Button, Divider, Toolbar, Typography } from '@mui/material';

import { makeStyles } from '@mui/styles';
import MainCard from 'ui-component/cards/MainCard';
import VariantsSearch from '../genomicsData/VariantsSearch';
import PatientCounts from './widgets/patientCounts';
import DataVisualization from './widgets/dataVisualization';
import ClinicalData from './widgets/clinicalData';
import PatientView from './widgets/patientView';
import { useSidebarWriterContext } from '../../layout/MainLayout/Sidebar/SidebarContext';
import Sidebar from './widgets/sidebar';
import { PRIMARY_SITES, COHORTS } from 'store/constant';
import SearchHandler from './search/SearchHandler';
import GenomicData from './widgets/genomicData';

const useStyles = makeStyles((theme) => ({
    stickytop: {
        position: 'static',
        backgroundColor: 'white',
        width: '100%',
        zIndex: 1100,
        top: 110,
        borderRadius: 12
    },
    spaceBetween: {
        height: 30
    },
    anchor: {
        display: 'block',
        position: 'relative',
        top: -82, // Height of the header
        visibility: 'hidden'
    },
    navigationLink: {
        float: 'right',
        textAlign: 'right'
    }
}));

const sections = [
    {
        id: 'counts',
        header: 'Patient Counts',
        component: <PatientCounts />
    },
    {
        id: 'visualization',
        header: 'Data Visualization',
        component: <DataVisualization />
    },
    {
        id: 'clinical',
        header: 'Clinical Data',
        component: <ClinicalData />
    },
    {
        id: 'patient',
        header: 'Patient View',
        component: <PatientView />
    },
    {
        id: 'genomic',
        header: 'Genomic Data',
        component: <GenomicData />
    }
];

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
            <AppBar component="nav" className={classes.stickytop}>
                <Toolbar>
                    <Typography variant="h5" sx={{ flexGrow: 1 }}>
                        Federated Search
                    </Typography>
                    {sections.map((section) => (
                        <Button
                            onClick={() => {
                                window.location.href = `#${section.id}`;
                            }}
                            sx={{ my: 2, display: 'block' }}
                            key={section.id}
                            className={classes.navigationLink}
                            variant="text"
                        >
                            {section.header}
                        </Button>
                    ))}
                </Toolbar>
            </AppBar>
            <SearchHandler />
            <MainCard sx={{ minHeight: 830, position: 'relative', borderRadius: events.customization.borderRadius * 0.25 }}>
                <div>
                    <Divider />
                    {/* Genomic Searchbar */}
                    <div id="searchbar">
                        <VariantsSearch />
                    </div>
                    {/* For now, until I figure out how to make it its own card */}
                    <Divider />
                </div>
                {sections.map((section) => (
                    <div key={section.id}>
                        <a id={section.id} className={classes.anchor} aria-hidden="true">
                            &nbsp;
                        </a>
                        {section.component}
                        <div className={classes.spaceBetween} />
                    </div>
                ))}
            </MainCard>
        </>
    );
}

export default ClinicalGenomicSearch;
