import { lazy } from 'react';

// project imports
import MainLayout from '../layout/MainLayout';
import Loadable from '../ui-component/Loadable';

// import project config
import config from '../config';

// import basename
const { basename } = config;

// Summary routing
const Summary = Loadable(lazy(() => import('../views/summary/summary')));

// Clinical & Genomic Search
const ClinicalGenomicSearch = Loadable(lazy(() => import('../views/clinicalGenomic/clinicalGenomicSearch')));
const ClinicalPatientView = Loadable(lazy(() => import('../views/clinicalGenomic/clinicalPatientView')));

// Request data access form
const RequestDataAccessForm = Loadable(lazy(() => import('../views/clinicalGenomic/requestDataAccessForm')));

// Ingest Portal
const IngestPortal = Loadable(lazy(() => import('../views/ingest/ingest')));

// Completeness
const CompletenessStats = Loadable(lazy(() => import('../views/completeness/completeness')));

// Site Admin Dashboard
const SiteAdmin = Loadable(lazy(() => import('../views/siteAdmin/siteAdmin')));

// Site Curator Dashboard
const SiteCurator = Loadable(lazy(() => import('../views/siteCurator/siteCurator')));

// User Dashboard
const UserDashboard = Loadable(lazy(() => import('../views/userDashboard/userDashboard')));

// Error Pages
const ErrorNotFoundPage = Loadable(lazy(() => import('../views/errorPages/ErrorNotFoundPage')));

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
            path: `${basename}/requestAccess`,
            element: <RequestDataAccessForm />
        },
        {
            path: `${basename}/siteAdmin`,
            element: <SiteAdmin />
        },
        {
            path: `${basename}/siteCurator`,
            element: <SiteCurator />
        },
        {
            path: `${basename}/userDashboard`,
            element: <UserDashboard />
        },
        {
            path: '*',
            element: <ErrorNotFoundPage />
        }
    ]
};

export default MainRoutes;
