import React, { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// dashboard routing
// const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
// const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
// const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
// const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));
// const UtilsMaterialIcons = Loadable(lazy(() => import('views/utilities/MaterialIcons')));
// const UtilsTablerIcons = Loadable(lazy(() => import('views/utilities/TablerIcons')));

// Overview routing
const IndividualsOverview = Loadable(lazy(() => import('views/overview/individuals')));

// Clinical
const McodePage = Loadable(lazy(() => import('views/clinical/mcode')));
const PhenopacketsPage = Loadable(lazy(() => import('views/clinical/phenopackets')));
const VariantsSearchPage = Loadable(lazy(() => import('views/genomicsData/variantsSearch')));

// ===========================|| MAIN ROUTING ||=========================== //

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: '/',
            element: <McodePage />
        },
        {
            path: '/individuals-overview',
            element: <IndividualsOverview />
        },
        // {
        //     path: '/dashboard/default',
        //     element: <DashboardDefault />
        // },
        // {
        //     path: '/utils/util-typography',
        //     element: <UtilsTypography />
        // },
        // {
        //     path: '/utils/util-color',
        //     element: <UtilsColor />
        // },
        // {
        //     path: '/utils/util-shadow',
        //     element: <UtilsShadow />
        // },
        // {
        //     path: '/icons/tabler-icons',
        //     element: <UtilsTablerIcons />
        // },
        // {
        //     path: '/icons/material-icons',
        //     element: <UtilsMaterialIcons />
        // },
        {
            path: '/mcode',
            element: <McodePage />
        },
        {
            path: '/phenopackets',
            element: <PhenopacketsPage />
        },
        {
            path: '/variantssearch',
            element: <VariantsSearchPage />
        }
        // {
        //     path: '/dashboard',
        //     element: <DashboardDefault />
        // },
        // {
        //     path: '/MaterialIcons',
        //     element: <UtilsMaterialIcons />
        // },
        // {
        //     path: '/TablerIcons',
        //     element: <UtilsTablerIcons />
        // }
    ]
};

export default MainRoutes;
