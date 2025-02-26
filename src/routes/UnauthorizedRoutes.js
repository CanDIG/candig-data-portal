import { lazy } from 'react';
import { useRoutes } from 'react-router-dom';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// import project config
import config from 'config';

// import basename
const { basename } = config;

// Unauthorized page
const AuthDisplay = Loadable(lazy(() => import('views/pages/authentication/AuthDisplay')));

// ===========================|| MAIN ROUTING ||=========================== //

const UnauthorizedRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: `/`,
            element: <AuthDisplay />
        },
        {
            path: `${basename}/unauthorized`,
            element: <AuthDisplay />
        },
        {
            path: '*',
            element: <AuthDisplay />
        }
    ]
};

export default UnauthorizedRoutes;

export function UseUnauthorizedRoutes() {
    return useRoutes([UnauthorizedRoutes]);
}
