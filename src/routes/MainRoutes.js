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

// Clinical & Genomic Search
const ClinicalGenomicSearch = Loadable(lazy(() => import('views/clinicalGenomic/clinicalGenomicSearch')));

// Ingest Portal
const IngestPortal = Loadable(lazy(() => import('views/ingest/ingest')));

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
            path: `${basename}/clinicalGenomicSearch`,
            element: <ClinicalGenomicSearch />
        },
        {
            path: `${basename}/data-ingest`,
            element: <IngestPortal />
        },
        {
            path: '*',
            element: <ErrorNotFoundPage />
        }
    ]
};

export default MainRoutes;
