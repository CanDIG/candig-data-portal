import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// import project config
import config from 'config';

// import basename
const { basename } = config;

// Summary routing
const Summary = Loadable(lazy(() => import('views/summary/summary')));

// Clinical
const McodePage = Loadable(lazy(() => import('views/clinical/mcode')));

// Genomic
const VariantsSearchPage = Loadable(lazy(() => import('views/genomicsData/VariantsSearch')));

// Clinical & Genomic Search
const ClinicalGenomicSearch = Loadable(lazy(() => import('views/clinicalGenomic/clinicalGenomicSearch')));

// Error Pages
const ErrorNotFoundPage = Loadable(lazy(() => import('views/errorPages/ErrorNotFoundPage')));

// ===========================|| MAIN ROUTING ||=========================== //

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: `/`,
            element: <Summary />
        },
        {
            path: `${basename}/`,
            element: <Summary />
        },
        {
            path: `${basename}/summary`,
            element: <Summary />
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
            path: `${basename}/clinicalGenomicSearch`,
            element: <ClinicalGenomicSearch />
        },
        {
            path: '*',
            element: <ErrorNotFoundPage />
        }
    ]
};

export default MainRoutes;
