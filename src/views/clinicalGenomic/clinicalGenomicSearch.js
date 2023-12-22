import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { AppBar, Button, Toolbar, Typography } from '@mui/material';

import { makeStyles } from '@mui/styles';
import MainCard from 'ui-component/cards/MainCard';
import PatientCounts from './widgets/patientCounts';
import DataVisualization from './widgets/dataVisualization';
import ClinicalData from './widgets/clinicalData';
import PatientView from './widgets/patientView';
import { useSidebarWriterContext } from '../../layout/MainLayout/Sidebar/SidebarContext';
import Sidebar from './widgets/sidebar';
import { COHORTS } from 'store/constant';
import SearchHandler from './search/SearchHandler';
import GenomicData from './widgets/genomicData';
import { DataGrid } from '@mui/x-data-grid';

const useStyles = makeStyles((_) => ({
    stickytop: {
        position: 'fixed',
        backgroundColor: 'white',
        zIndex: 1100,
        top: 95,
        borderRadius: '1px 1px 0 0',
        outline: '20px solid #e3f2fd'
    },
    sidebarOffset: {
        width: 'calc(100% - 320px)',
        left: 280
    },
    noSidebarOffset: {
        width: 'calc(100% - 80px)',
        left: 40
    },
    headerSpacing: {
        height: 50
    },
    anchor: {
        display: 'block',
        position: 'relative',
        visibility: 'hidden',
        top: -150
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
        id: 'genomic',
        header: 'Genomic Data',
        component: <GenomicData />
    }
];

function ClinicalGenomicSearch() {
    const events = useSelector((state) => state);
    const classes = useStyles();
    const sidebarWriter = useSidebarWriterContext();
    const sidebarOpened = useSelector((state) => state.customization.opened);

    // When we load, set the sidebar component
    useEffect(() => {
        sidebarWriter(<Sidebar sites={['BCGSC', 'UHN']} cohorts={COHORTS} />);
    }, [sidebarWriter]);

    return (
        <>
            {/* Top bar */}
            <AppBar
                component="nav"
                className={`${classes.stickytop} ${classes.headerSpacing} ${sidebarOpened ? classes.sidebarOffset : classes.noSidebarOffset
                    }`}
            >
                <Toolbar sx={{ padding: '5px' }}>
                    <Typography variant="h4" sx={{ flexGrow: 1 }}>
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
            {/* Empty div to make sure the header takes up space */}
            <SearchHandler />
            <MainCard
                sx={{ minHeight: 830, position: 'relative', borderRadius: events.customization.borderRadius * 0.25, marginTop: '2.5em' }}
            >
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
