import React, { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// Overview routing
const IndividualsOverview = Loadable(lazy(() => import('views/overview/individuals')));

// Clinical
const McodePage = Loadable(lazy(() => import('views/clinical/mcode')));
const PhenopacketsPage = Loadable(lazy(() => import('views/clinical/phenopackets')));
const FileDirectoryPage = Loadable(lazy(() => import('views/genomicsData/FileDirectory')));
const VariantsSearchPage = Loadable(lazy(() => import('views/genomicsData/VariantsSearch')));
const ReadsSearchPage = Loadable(lazy(() => import('views/genomicsData/ReadsSearch')));
const VcfBrowserPage = Loadable(lazy(() => import('views/genomicsData/VcfBrowser')));
const BamBrowserPage = Loadable(lazy(() => import('views/genomicsData/BamBrowser')));

// ===========================|| MAIN ROUTING ||=========================== //

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: '/',
            element: <IndividualsOverview />
        },
        {
            path: '/individuals-overview',
            element: <IndividualsOverview />
        },
        {
            path: '/mcode',
            element: <McodePage />
        },
        {
            path: '/phenopackets',
            element: <PhenopacketsPage />
        },
        {
            path: '/file-directory',
            element: <FileDirectoryPage />
        },
        {
            path: '/variants-search',
            element: <VariantsSearchPage />
        },
        {
            path: '/reads-search',
            element: <ReadsSearchPage />
        },
        {
            path: '/vcf-browser',
            element: <VcfBrowserPage />
        },
        {
            path: '/bam-browser',
            element: <BamBrowserPage />
        }
    ]
};

export default MainRoutes;
