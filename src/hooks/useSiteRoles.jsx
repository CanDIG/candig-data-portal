import { useEffect, useState } from 'react';

import { fetchCurrentUserAuthorization } from '../store/api';

// Default site role names, as defined in the OPA site_roles store.
const SITE_ADMIN_ROLE = 'admin';
const SITE_CURATOR_ROLE = 'curator';

// ===========================|| SITE ROLES HOOK ||=========================== //

/*
 * Fetch the currently logged-in user's site roles from the ingest service's
 * /user/me endpoint and expose convenient booleans. Used to gate the site
 * admin / site curator dashboards and their menu entries.
 *
 * @returns {{ loading: boolean, roles: string[], isSiteAdmin: boolean, isSiteCurator: boolean, userId: string|undefined }}
 */
export default function useSiteRoles() {
    const [state, setState] = useState({ loading: true, roles: [], userId: undefined });

    useEffect(() => {
        let active = true;
        fetchCurrentUserAuthorization()
            .then((authorization) => {
                if (!active) {
                    return;
                }
                setState({
                    loading: false,
                    roles: authorization?.site_roles || [],
                    userId: authorization?.userinfo?.user_name
                });
            })
            .catch((error) => {
                console.log(`Could not determine site roles: ${error}`);
                if (active) {
                    setState({ loading: false, roles: [], userId: undefined });
                }
            });
        return () => {
            active = false;
        };
    }, []);

    return {
        ...state,
        isSiteAdmin: state.roles.includes(SITE_ADMIN_ROLE),
        isSiteCurator: state.roles.includes(SITE_CURATOR_ROLE)
    };
}
