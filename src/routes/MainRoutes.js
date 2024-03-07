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
const ClinicalPatientView = Loadable(lazy(() => import('views/clinicalGenomic/clinicalPatientView')));

// Ingest Portal
const IngestPortal = Loadable(lazy(() => import('views/ingest/ingest')));

// Ingest Portal
// const IngestPortal = Loadable(lazy(() => import('views/ingest/ingest')));

// Completeness
const CompletenessStats = Loadable(lazy(() => import('views/completeness/completeness')));

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
            path: `${basename}/completeness`,
            element: <CompletenessStats />
        },
        /* {
            path: `${basename}/data-ingest`,
            element: <IngestPortal />
        }, */
        {
            path: `${basename}/patientView`,
            element: <ClinicalPatientView />
        },
        {
            path: `${basename}/frontendIngest`,
            element: <IngestPortal />
        },
        {
            path: '*',
            element: <ErrorNotFoundPage />
        }
    ]
};

export default MainRoutes;
