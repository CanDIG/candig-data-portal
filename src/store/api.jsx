// API Server constant
/* eslint-disable camelcase */
export const federation = `${import.meta.env.VITE_FEDERATION_API_SERVER}/v1`;
export const htsget = import.meta.env.VITE_HTSGET_SERVER;
export const INGEST_URL = import.meta.env.VITE_INGEST_SERVER;

export function reloginCheck() {
    return fetch('/portal/favicon.ico')
        .then((response) => {
            if (response.status === 401) {
                // The user's token has expired, and they need to refresh the page
                window.location.reload();
                throw new Error("User's token has expired, they must refresh");
            } else {
                // Wasn't a permission denied -- continue processing
                return true;
            }
        })
        .catch((error) => {
            console.log(error);
            window.location.reload();
        });
}

export function fetchOrRelogin(...args) {
    return fetch(...args).then((response) => {
        if (response.status === 401) {
            // The user's token has expired, and they need to refresh the page
            window.location.reload();
            throw new Error("User's token has expired, they must refresh");
        } else {
            // Wasn't a permission denied -- continue processing
            return response;
        }
    });
}

/*
Generic querying for federation
*/
export function fetchFederation(path, service, payload = {}, fetchMethod = fetchOrRelogin, extraBody = {}) {
    return fetchMethod(`${federation}/fanout`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'GET',
            path,
            payload: payload || {},
            service,
            // Extra top-level fanout options (e.g. { unsafe: true }).
            ...extraBody
        })
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`Error while accessing ${service}/${path} ${response.status}: ${response.statusText}`);
            }
        });
}

/**
 * Fetch federated sub-services by querying the Query microservice.
 *
 * @param {string} targetPath - The specific path within the target service to request data from
 * @param {string} [targetService='katsu'] - The target service being queried (default: 'katsu')
 * @param {string} [endpoint='discovery] - The endpoint used for the federation request (default: 'query/discovery')
 * @param {string} [service='query'] - The service handling the request (default: 'query')
 * @returns {Promise<Object|string>} A promise that resolves to the response data or 'error' if the request fails
 */
export function fetchFederatedSubServices(targetPath, targetService = 'katsu', endpoint = 'query/discovery', service = 'query') {
    const payload = {
        targetService,
        targetPath
    };

    return fetchFederation(endpoint, service, payload)
        .then((data) => data);
}

/*
    Query the Query microservice for a page of results
    * @param {parameters} passed onto Query as URL parameters
    * @param {abort} Abort Controller used to cancel the query
    * @param {path} Query API path used to send the request to, assumed to be /query but
    * can be used for e.g. /genomic_completeness if need be
*/
export function query(parameters, abort, path = 'query/query') {
    const payload = {
        ...parameters
    };
    return fetchOrRelogin(`${federation}/fanout`, {
        method: 'post',
        signal: abort,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'GET',
            path,
            service: 'query',
            payload
        })
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(`Error during ${path}: ${response.status} ${response.statusText}`);
        })
        .catch((error) => {
            // Abort errors should halt execution, so we throw it along
            // Otherwise, an error fro the backend means something's up, so we return nothing
            if (error === 'New request started') {
                throw error;
            }
            console.log(error);
            return [];
        });
}

/* The following two functions are both used for the ingest page,
which at this time is unimplemented.
*/

/*
Post a clinical data JSON to Katsu
*/
export function ingestClinicalData(data) {
    return fetchOrRelogin(`${INGEST_URL}/ingest/clinical_donors`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: data
    })
        .then((response) => response.json())
        .catch((error) => {
            console.log('Error:', error);
            return error;
        });
}
/*
Post a clinical data JSON to Katsu
*/
export function ingestGenomicData(data, program_id) {
    return fetchOrRelogin(`${INGEST_URL}/ingest/moh_variants/${program_id}`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: data
    }).catch((error) => {
        console.log('Error:', error);
        return error;
    });
}

/*
 * Fetch the genomic completeness stats from Query, returning the results
 * as a dictionary of {site: {program (type)} = #}
 */
export function fetchGenomicCompleteness() {
    return fetchFederation('query/genomic_completeness', 'query').then((data) => {
        const numCompleteGenomic = {};
        data.filter((site) => site.status === 200).forEach((site) => {
            numCompleteGenomic[site.location.name] = {};
            Object.keys(site?.results || {}).forEach((program) => {
                Object.keys(site?.results[program] || {}).forEach((type) => {
                    numCompleteGenomic[site.location.name][`${program} (${type})`] = site?.results?.[program]?.[type];
                });
            });
        });
        return numCompleteGenomic;
    });
}

/*
 * Fetch the clinical completeness stats from Query, returning a dictionary
 * with: numNodes, numErrorNodes, numDonors, numCompleteDonors, numClinicalComplete, data
 */
export function fetchClinicalCompleteness() {
    return fetchFederation('query/discovery/programs', 'query').then((data) => {
        // Step 1: Determine the number of provinces
        const provinces = data?.map((site) => site?.location?.province);
        const uniqueProvinces = [...new Set(provinces)];
        const retVal = {};
        retVal.numProvinces = uniqueProvinces.length;

        // Step 3: Determine the number of donors
        let totalSites = 0;
        let totalErroredSites = 0;
        let totalCases = 0;
        let completeCases = 0;
        const completeClinical = {};
        data.forEach((site) => {
            totalSites += 1;
            totalErroredSites += site.status === 200 ? 0 : 1;
            site?.results?.programs?.forEach((program) => {
                if (program?.metadata?.summary_cases) {
                    totalCases += program.metadata.summary_cases.total_cases;
                    completeCases += program.metadata.summary_cases.complete_cases;
                    if (!(site.location.name in completeClinical)) {
                        completeClinical[site.location.name] = {};
                    }
                    completeClinical[site.location.name][program.program_id] = program.metadata.summary_cases.complete_cases;
                }
            });
        });
        retVal.numNodes = totalSites;
        retVal.numErrorNodes = totalErroredSites;
        retVal.numDonors = totalCases;
        retVal.numCompleteDonors = completeCases;
        retVal.numClinicalComplete = completeClinical;
        retVal.data = data;
        return retVal;
    });
}

/*
 * Directly query Query for the /get-token endpoint, which reflects our refresh token.
 */
export function fetchRefreshToken() {
    return fetchOrRelogin(`${INGEST_URL}/get-token`)
        .then((response) => response.json())
        .catch((error) => {
            console.log('Error:', error);
            return error;
        });
}

/* ============================================================================
 * Site administration (ingest service)
 *
 * All of the endpoints below are served by the ingest service and are only
 * accessible to site administrators. They are consumed by the Site Admin
 * Dashboard (src/views/siteAdmin). Authentication is handled by the Tyk
 * gateway via the session cookie, exactly as with the other ingest calls
 * above, so no Authorization header is set here.
 * ========================================================================== */

/*
 * Small helper that unwraps an ingest or federation response as JSON and throws
 * a useful error (including the server-supplied message when present) on
 * failure. Shared by every admin helper below.
 */
async function unwrapJson(response) {
    let body;
    try {
        body = await response.json();
    } catch (e) {
        body = undefined;
    }
    if (!response.ok) {
        const detail = body?.error || body?.message || body?.result || response.statusText;
        throw new Error(`${response.status}: ${detail}`);
    }
    return body;
}

/*
 * Return authorization information for the currently logged-in user, including
 * their site_roles (e.g. "admin", "curator"). Used to gate the dashboards.
 *
 * The result is cached at module scope: the user's authorization does not change
 * within a page load (a re-login reloads the page), and several independent
 * consumers (useSiteRoles, useSiteAdmin, ProfileSection, the notification badge,
 * the user dashboard) request it. Caching the promise means they all share a
 * single /user/me request. A failed request clears the cache so it can be
 * retried, and `force` bypasses the cache when a fresh read is required.
 */
let currentUserAuthorizationPromise = null;
export function fetchCurrentUserAuthorization({ force = false } = {}) {
    if (!currentUserAuthorizationPromise || force) {
        currentUserAuthorizationPromise = fetchOrRelogin(`${INGEST_URL}/user/me`)
            .then(unwrapJson)
            .catch((error) => {
                currentUserAuthorizationPromise = null;
                throw error;
            });
    }
    return currentUserAuthorizationPromise;
}

/* ---- Pending users ---- */

export function fetchPendingUsers() {
    return fetchOrRelogin(`${INGEST_URL}/user/pending`)
        .then(unwrapJson)
        .then((data) => data?.results || []);
}

export function approvePendingUser(userId) {
    return fetchOrRelogin(`${INGEST_URL}/user/pending/${encodeURIComponent(userId)}`, {
        method: 'post'
    }).then(unwrapJson);
}

export function rejectPendingUser(userId) {
    return fetchOrRelogin(`${INGEST_URL}/user/pending/${encodeURIComponent(userId)}`, {
        method: 'delete'
    }).then(unwrapJson);
}

export function approvePendingUsers(userIds) {
    return fetchOrRelogin(`${INGEST_URL}/user/pending`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userIds)
    }).then(unwrapJson);
}

/* ---- Preapproved users ---- */

export function fetchPreapprovedUsers() {
    return fetchOrRelogin(`${INGEST_URL}/user/preapproved`)
        .then(unwrapJson)
        .then((data) => data?.results || []);
}

export function addPreapprovedUsers(userIds) {
    return fetchOrRelogin(`${INGEST_URL}/user/preapproved`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userIds)
    }).then(unwrapJson);
}

export function removePreapprovedUser(userId) {
    return fetchOrRelogin(`${INGEST_URL}/user/preapproved/${encodeURIComponent(userId)}`, {
        method: 'delete'
    }).then(unwrapJson);
}

/* ---- Programs ---- */

export function fetchPrograms() {
    return fetchOrRelogin(`${INGEST_URL}/program`).then(unwrapJson);
}

export function addProgram(program) {
    return fetchOrRelogin(`${INGEST_URL}/program`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(program)
    }).then(unwrapJson);
}

/*
 * Fetch a single program's authorization info (program_curators, team_members).
 * Resolves to { ok, status, data } so callers can distinguish "not found" (404)
 * from other errors without throwing. Note the ingest service strips
 * dac_authorizations from this response; use fetchProgramDacs for those.
 */
export function fetchProgram(programId) {
    return fetchOrRelogin(`${INGEST_URL}/program/${encodeURIComponent(programId)}`).then(async (response) => {
        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = undefined;
        }
        return { ok: response.ok, status: response.status, data };
    });
}

/*
 * Get the DAC authorizations for a single program. The ingest service returns
 * an object keyed by user id: { <user_id>: { program_id, start_date, end_date } }
 */
export function fetchProgramDacs(programId) {
    return fetchOrRelogin(`${INGEST_URL}/program/${encodeURIComponent(programId)}/dac_authorization`).then(unwrapJson);
}

/*
 * Aggregate every DAC authorization across all programs into a flat list of
 * { program_id, user_id, start_date, end_date } rows, suitable for a table.
 *
 * Note: this is a fan-out of one request per program (an N+1 pattern). It is
 * parallelised and per-program failures are isolated, so it is fine at current
 * program counts; a bulk "all DAC authorizations" ingest endpoint would be the
 * fix if program counts grow large (mirrors the query-service PAGE_SIZE caveat).
 */
export function fetchAllDacAuthorizations() {
    return fetchPrograms().then((programs) => {
        const programIds = Array.isArray(programs) ? programs : [];
        return Promise.all(
            programIds.map((programId) =>
                fetchProgramDacs(programId)
                    .then((dacs) =>
                        Object.entries(dacs || {}).map(([userId, dac]) => ({
                            program_id: dac?.program_id || programId,
                            user_id: userId,
                            dac_id: dac?.dac_id || '',
                            start_date: dac?.start_date || '',
                            end_date: dac?.end_date || ''
                        }))
                    )
                    .catch((error) => {
                        console.log(`Could not fetch DAC authorizations for ${programId}: ${error}`);
                        return [];
                    })
            )
        ).then((nested) => nested.flat());
    });
}

/* ---- DAC authorizations ---- */

export function addDacAuthorization(userId, authorizations) {
    return fetchOrRelogin(`${INGEST_URL}/user/${encodeURIComponent(userId)}/dac_authorization`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authorizations)
    }).then(unwrapJson);
}

/* ---- Site roles ---- */

/*
 * List the users assigned to a given site role (e.g. "curator", "admin"). The
 * ingest service returns an object keyed by role type: { <role_type>: [...] },
 * so we normalise it down to a plain array of user ids.
 */
export function fetchSiteRoleUsers(roleType) {
    return fetchOrRelogin(`${INGEST_URL}/site-role/${encodeURIComponent(roleType)}`)
        .then(unwrapJson)
        .then((data) => {
            if (Array.isArray(data)) {
                return data;
            }
            if (data && Array.isArray(data[roleType])) {
                return data[roleType];
            }
            return [];
        });
}

export function addUserToSiteRole(roleType, userId) {
    return fetchOrRelogin(`${INGEST_URL}/site-role/${encodeURIComponent(roleType)}/user_id/${encodeURIComponent(userId)}`, {
        method: 'post'
    }).then(unwrapJson);
}

export function removeUserFromSiteRole(roleType, userId) {
    return fetchOrRelogin(`${INGEST_URL}/site-role/${encodeURIComponent(roleType)}/user_id/${encodeURIComponent(userId)}`, {
        method: 'delete'
    }).then(unwrapJson);
}

/* ============================================================================
 * Federation node management (federation service)
 *
 * Site administrators can register, list, and unregister peer CanDIG nodes.
 * These endpoints live on the federation service (same base as /fanout) and
 * are gated to site admins by the gateway, so — as with the ingest calls above
 * — no Authorization header is set here. There is no dedicated node-liveness
 * endpoint, so status is derived from an (unsafe) fanout probe; see
 * fetchNodeStatus below. JSON responses are unwrapped by the shared unwrapJson
 * helper defined above.
 * ========================================================================== */

/*
 * List the peer nodes registered with this node's federation service. Resolves
 * to an array of { id, url, location: { name, province, province-code } }.
 */
export function fetchFederatedServers() {
    return fetchOrRelogin(`${federation}/servers`)
        .then(unwrapJson)
        .then((data) => (Array.isArray(data) ? data : []));
}

/*
 * Register a peer CanDIG node. `payload` is the full { server, authentication }
 * body expected by POST /servers (assembled in AddFederatedServer).
 */
export function addFederatedServer(payload) {
    return fetchOrRelogin(`${federation}/servers`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).then(unwrapJson);
}

/*
 * Unregister a peer node by its server id.
 */
export function deleteFederatedServer(serverId) {
    return fetchOrRelogin(`${federation}/servers/${encodeURIComponent(serverId)}`, {
        method: 'delete'
    }).then(unwrapJson);
}

/*
 * Probe the reachability of every registered node. The federation service has
 * no dedicated status endpoint, so we fan a lightweight discovery request out
 * to all nodes with `unsafe` set: this bypasses the heartbeat's live-server
 * filter so unreachable nodes are still contacted (and time out / error) rather
 * than being silently skipped. Resolves to the raw fanout array, one entry per
 * node: { location: { name, province }, status, message }. This is the same
 * signal the Summary page uses for its node counts (reusing fetchFederation).
 */
export function fetchNodeStatus() {
    return fetchFederation(
        'query/discovery',
        'query',
        { targetService: 'katsu', targetPath: 'v3/discovery/overview/individual_count' },
        fetchOrRelogin,
        { unsafe: true }
    );
}
