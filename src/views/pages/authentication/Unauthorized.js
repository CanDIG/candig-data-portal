import { useRoutes } from 'react-router-dom';

// routes
import MainRoutes from 'routes/MainRoutes';
import AuthenticationRoutes from 'routes/AuthenticationRoutes';

// ===========================|| ROUTING RENDER ||=========================== //

export default function Unauthorized() {
    return useRoutes([MainRoutes, AuthenticationRoutes]);
}
