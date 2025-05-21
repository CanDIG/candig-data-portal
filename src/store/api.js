// API Server constant
/* eslint-disable camelcase */
export const federation = `${process.env.REACT_APP_FEDERATION_API_SERVER}/v1`;
export const htsget = process.env.REACT_APP_HTSGET_SERVER;
export const INGEST_URL = process.env.REACT_APP_INGEST_SERVER;

export function reloginCheck() {
    return fetch('/portal/favicon.ico')
        .then((response) => {
            console.log(`Relogin check performed. Statuz: ${response.status}`);
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
    return fetch(...args)
        .then((response) => {
            if (response.status === 401) {
                // The user's token has expired, and they need to refresh the page
                window.location.reload();
                throw new Error("User's token has expired, they must refresh");
            } else {
                // Wasn't a permission denied -- continue processing
                return response;
            }
        })
        .catch((error) => {
            console.log(error);
            window.location.reload();
        });
}

/*
Generic querying for federation
*/
export function fetchFederation(path, service, payload = {}, fetchMethod = fetchOrRelogin) {
    return fetchMethod(`${federation}/fanout`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'GET',
            path,
            payload: payload || {},
            service
        })
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return [];
        })
        .catch((error) => {
            console.log(`Error: ${error}`);
            return 'error';
        });
}

/**
 * Fetch federated sub-services by querying the Query microservice.
 *
 * @param {string} targetPath - The specific path within the target service to request data from
 * @param {string} [targetService='katsu'] - The target service being queried (default: 'katsu')
 * @param {string} [endpoint='discovery] - The endpoint used for the federation request (default: 'discovery')
 * @param {string} [service='query'] - The service handling the request (default: 'query')
 * @returns {Promise<Object|string>} A promise that resolves to the response data or 'error' if the request fails
 */
export function fetchFederatedSubServices(targetPath, targetService = 'katsu', endpoint = 'discovery', service = 'query') {
    const payload = {
        targetService,
        targetPath
    };

    return fetchFederation(endpoint, service, payload)
        .then((data) => data)
        .catch((error) => {
            console.log(`Error: ${error}`);
            return 'error';
        });
}

/*
    Query the Query microservice for a page of results
    * @param {parameters} passed onto Query as URL parameters
    * @param {abort} Abort Controller used to cancel the query
    * @param {path} Query API path used to send the request to, assumed to be /query but
    * can be used for e.g. /genomic_completeness if need be
*/
export function query(parameters, abort, path = 'query') {
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
    return fetchFederation('genomic_completeness', 'query').then((data) => {
        const numCompleteGenomic = {};
        data.filter((site) => site.status === 200).forEach((site) => {
            numCompleteGenomic[site.location.name] = {};
            Object.keys(site.results).forEach((program) => {
                Object.keys(site.results[program]).forEach((type) => {
                    numCompleteGenomic[site.location.name][`${program} (${type})`] = site.results[program][type];
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
    return fetchFederation('discovery/programs', 'query').then((data) => {
        // Step 1: Determine the number of provinces
        const provinces = data.map((site) => site?.location?.province);
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
