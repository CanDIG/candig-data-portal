import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// import project config
import config from 'config';

// import basename
const { basename } = config;

// Overview routing
const IndividualsOverview = Loadable(lazy(() => import('views/overview/individuals')));

// Clinical
const McodePage = Loadable(lazy(() => import('views/clinical/mcode')));

// Genomic
const VariantsSearchPage = Loadable(lazy(() => import('views/genomicsData/VariantsSearch')));

// Error Pages
const ErrorNotFoundPage = Loadable(lazy(() => import('views/errorPages/ErrorNotFoundPage')));

// ===========================|| MAIN ROUTING ||=========================== //

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: `/`,
            element: <IndividualsOverview />
        },
        {
            path: `${basename}/`,
            element: <IndividualsOverview />
        },
        {
            path: `${basename}/individuals-overview`,
            element: <IndividualsOverview />
        },
        {
            path: `${basename}/mcode`,
            element: <McodePage />
        },
        {
            path: `${basename}/variants-search`,
            element: <VariantsSearchPage />
        },
        {
            path: '*',
            element: <ErrorNotFoundPage />
        }
    ]
};

export default MainRoutes;
