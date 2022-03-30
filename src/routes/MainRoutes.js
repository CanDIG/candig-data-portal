import React, { lazy } from 'react';

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
const PhenopacketsPage = Loadable(lazy(() => import('views/clinical/phenopackets')));

// Genomic
const FileDirectoryPage = Loadable(lazy(() => import('views/genomicsData/FileDirectory')));
const VariantsSearchPage = Loadable(lazy(() => import('views/genomicsData/VariantsSearch')));
const ReadsSearchPage = Loadable(lazy(() => import('views/genomicsData/ReadsSearch')));
const VcfBrowserPage = Loadable(lazy(() => import('views/genomicsData/VcfBrowser')));
const BamBrowserPage = Loadable(lazy(() => import('views/genomicsData/BamBrowser')));

// Error Pages
const ErrorNotFoundPage = Loadable(lazy(() => import('views/errorPages/ErrorNotFoundPage')));

// ===========================|| MAIN ROUTING ||=========================== //

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
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
            path: `${basename}/phenopackets`,
            element: <PhenopacketsPage />
        },
        {
            path: `${basename}/file-directory`,
            element: <FileDirectoryPage />
        },
        {
            path: `${basename}/variants-search`,
            element: <VariantsSearchPage />
        },
        {
            path: `${basename}/reads-search`,
            element: <ReadsSearchPage />
        },
        {
            path: `${basename}/vcf-browser`,
            element: <VcfBrowserPage />
        },
        {
            path: `${basename}/bam-browser`,
            element: <BamBrowserPage />
        },
        {
            path: '*',
            element: <ErrorNotFoundPage />
        }
    ]
};

export default MainRoutes;
