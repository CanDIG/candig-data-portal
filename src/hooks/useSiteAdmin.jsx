import useSiteRoles from './useSiteRoles';

// ===========================|| SITE ADMIN HOOK ||=========================== //

/*
 * Convenience wrapper around useSiteRoles for callers that only care whether the
 * current user is a site administrator. Shares the same cached /user/me request.
 *
 * @returns {{ loading: boolean, error: string|null, isSiteAdmin: boolean, userId: string|undefined }}
 */
export default function useSiteAdmin() {
    const { loading, error, isSiteAdmin, userId } = useSiteRoles();
    return { loading, error, isSiteAdmin, userId };
}
