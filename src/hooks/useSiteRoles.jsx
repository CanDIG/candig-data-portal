import { useEffect, useState } from 'react';

import { fetchCurrentUserAuthorization } from '../store/api';
import { SITE_ROLES } from '../store/constant';

// ===========================|| SITE ROLES HOOK ||=========================== //

/*
 * Fetch the currently logged-in user's authorization from the ingest service's
 * /user/me endpoint (shared/cached — see fetchCurrentUserAuthorization) and
 * expose convenient role booleans. Used to gate the site admin / site curator
 * dashboards and their menu entries.
 *
 * Distinguishes a genuine "not authorized" (roles resolved, but empty) from a
 * fetch failure via the `error` field, so callers can show an error state
 * separate from the unauthorized state.
 *
 * @returns {{ loading, error, roles, userinfo, userId, isSiteAdmin, isSiteCurator }}
 */
export default function useSiteRoles() {
    const [state, setState] = useState({ loading: true, error: null, roles: [], userinfo: undefined });

    useEffect(() => {
        let active = true;
        fetchCurrentUserAuthorization()
            .then((authorization) => {
                if (!active) {
                    return;
                }
                setState({
                    loading: false,
                    error: null,
                    roles: authorization?.site_roles || [],
                    userinfo: authorization?.userinfo
                });
            })
            .catch((error) => {
                console.log(`Could not determine site roles: ${error}`);
                if (active) {
                    setState({ loading: false, error: `${error}`, roles: [], userinfo: undefined });
                }
            });
        return () => {
            active = false;
        };
    }, []);

    return {
        ...state,
        userId: state.userinfo?.user_name,
        isSiteAdmin: state.roles.includes(SITE_ROLES.ADMIN),
        isSiteCurator: state.roles.includes(SITE_ROLES.CURATOR)
    };
}
