// API Server constant
/* eslint-disable camelcase */
export const federation = `${process.env.REACT_APP_FEDERATION_API_SERVER}/v1`;
export const htsget = process.env.REACT_APP_HTSGET_SERVER;
export const INGEST_URL = process.env.REACT_APP_INGEST_SERVER;
export const API_URL = process.env.REACT_APP_API_SERVER;

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
export function fetchFederation(path, service, abort = null, payload = {}, fetchMethod = fetchOrRelogin, method = 'GET') {
    const requestbody = {
        method,
        path,
        payload: payload || {},
        service
    };
    if (abort != null) {
        requestbody.signal = abort;
    }

    return fetchMethod(`${federation}/fanout`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestbody)
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
    return fetchFederation('discovery/programs', 'query').then((data) => {
        // Step 1: Determine the number of provinces
        const provinces = data?.map((site) => site?.location?.province);
        const uniqueProvinces = [...new Set(provinces)];
        const uniquePrograms = new Set();
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
                uniquePrograms.add(program.program_id);
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
        retVal.uniquePrograms = uniquePrograms;
        retVal.data = data;
        return retVal;
    });
}

/*
 * Directly query Query for the /get-token endpoint, which reflects our refresh token.
 */
export function fetchRefreshToken() {
    return fetchOrRelogin(`${API_URL}/v1/authz/get-token`)
        .then((response) => response.json())
        .catch((error) => {
            console.log('Error:', error);
            return error;
        });
}

/*
 * CanDIG-API filtering_terms:
 */
export function fetchBeaconFilteringTerms() {
    return fetchFederation('v1/beacon/datasets/filtering_terms', 'candig-api');
}

// params.filters should be a list of objects
// e.g. [{ "id": "SNOMED:33821000087103" }]
export function queryBeacon(params, filter_mapping, programs, abort = null) {
    // Transform the parameters into something that it'll understand
    const params_filters = [];
    // Grab out the page and page number
    const page = params?.page ? `${params.page}` : undefined;
    const page_size = params?.page_size;

    const NON_FILTER_PARAMS = ['page', 'page_size', 'genomic_data_types'];
    const NON_ID_FILTERS = [];
    const INVALID_FILTERS = ['', null, undefined];
    const DATASET_PARAM = 'dataset_ids';

    if (typeof params !== 'undefined' && params !== null) {
        Object.keys(params).forEach((param) => {
            if (NON_FILTER_PARAMS.includes(param)) {
                return;
            }

            if (!NON_ID_FILTERS.includes(param) && !INVALID_FILTERS.includes(param)) {
                // Determine if we're dealing with a list or not (and if so, are we dealing with the datasets?)
                const new_param = {};
                if (param === DATASET_PARAM) {
                    new_param.id = `dataset_id:${params[param].join('|')}`;
                } else if (Array.isArray(filter_mapping[params[param]])) {
                    new_param.id = params[param].map((thisParam) => filter_mapping[thisParam]).join('|');
                } else {
                    new_param.id = filter_mapping[params[param]];
                }

                // Prevent an empty filter from somehow being passed on
                if (typeof new_param.id === 'undefined') {
                    console.log(`ID filter has no mapping: ${param} / ${params[param]}`);
                    return;
                }
                params_filters.push(new_param);
            } else {
                // Non-ID filters need to be applied as well -- how should I approach this?
                console.log(`Non-ID filter found but not yet supported: ${param}`);
            }
        });
    }

    // Construct the payload
    const payload = {
        meta: { apiVersion: 'v2.0.0' },
        query: {
            requestedGranularity: 'record',
            filters: params_filters, // [{ "id": "SNOMED:33821000087103" }]
            // TO FIX: currently candig-api is reading its pagination parameters from the wrong place
            /* pagination: {
                page,
                pageSize: page_size
                // "skip": ?
            } */
            skip: page ? page * page_size : undefined,
            limit: page_size
        }
    };

    return fetchFederation('v1/beacon/persons', 'candig-api', abort, payload, fetchOrRelogin, 'POST');
}
