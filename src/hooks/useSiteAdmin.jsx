import useSiteRoles from './useSiteRoles';

// ===========================|| SITE ADMIN HOOK ||=========================== //

/*
 * Convenience wrapper around useSiteRoles for callers that only care whether the
 * current user is a site administrator.
 *
 * @returns {{ loading: boolean, isSiteAdmin: boolean, userId: string|undefined }}
 */
export default function useSiteAdmin() {
    const { loading, isSiteAdmin, userId } = useSiteRoles();
    return { loading, isSiteAdmin, userId };
}
