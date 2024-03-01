// API Server constant
/* eslint-disable camelcase */
export const katsu = process.env.REACT_APP_KATSU_API_SERVER;
export const federation = `${process.env.REACT_APP_FEDERATION_API_SERVER}/v1`;
export const BASE_URL = process.env.REACT_APP_CANDIG_SERVER;
export const htsget = process.env.REACT_APP_HTSGET_SERVER;
export const TYK_URL = process.env.REACT_APP_TYK_SERVER;
export const INGEST_URL = process.env.REACT_APP_INGEST_SERVER;

// API Calls
/* 
Fetch katsu calls
*/
export function fetchKatsu(URL) {
    return fetch(`${katsu}/moh/v1/discovery/overview/${URL}`)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            console.log(`Katsu: ${response}`);
            throw new Error(`Katsu: ${response}`);
        })
        .catch((error) => {
            console.log(`Error: ${error}`);
            return 'error';
        });
}

/*
Fetch htsget calls
*/
export function fetchHtsget() {
    return fetch(`${federation}/fanout`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'GET',
            path: `ga4gh/drs/v1/objects`,
            payload: {},
            service: 'htsget'
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

export function fetchFederationStat(endpoint) {
    return fetch(`${federation}/fanout`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'GET',
            path: `v2/discovery/overview${endpoint}`,
            payload: {},
            service: 'katsu'
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

/*
Generic querying for federation
*/
export function fetchFederation(path, service) {
    return fetch(`${federation}/fanout`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'GET',
            path,
            payload: {},
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

/*
Fetch the federation service for clinical search data
*/
/* export function fetchFederationClinicalData() {
    // Until I can debug the Tyk error
    return new Promise((resolve) => resolve({}));
    return fetch(`${federation}/fanout`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'GET',
            path: 'api/mcodepackets',
            payload: {},
            service: 'katsu'
        })
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return {};
        })
        .catch((error) => {
            console.log('Error:', error);
            return 'error';
        });
} */

/*
Fetch peer federation stats from CanDIG federation service 
*/
export function fetchSummaryStats(URL) {
    return federation !== '' ? fetchFederationStat() : fetchKatsu(URL);
}

/*
Fetch variant for a specific Dataset Id; start; and reference name; and returns a promise
 * @param {number}... Start
 * @param {number}... End
 * @param {string}... Reference name
*/
export function searchVariant(chromosome, start, end, assemblyId = 'hg37') {
    const payload = {
        query: {
            requestParameters: {
                referenceName: chromosome,
                assemblyId,
                start: [parseInt(start, 10) || 0],
                end: [parseInt(end, 10) || 100000]
            }
        },
        meta: {
            apiVersion: 'v2'
        }
    };
    return fetch(`${federation}/fanout`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'POST',
            path: 'beacon/v2/g_variants',
            payload,
            service: 'htsget'
        })
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return [];
        })
        .catch((error) => {
            console.log('Error:', error);
            return 'error';
        });
}

/*
Fetch variant for a gene name; and returns a promise that contains the results from HTSGet through Federation
 * @param {string}... Name of a gene
*/
export function searchVariantByGene(geneName) {
    const payload = {
        query: {
            requestParameters: {
                gene_id: geneName
            }
        },
        meta: {
            apiVersion: 'v2'
        }
    };
    return fetch(`${federation}/fanout`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'POST',
            path: 'beacon/v2/g_variants',
            payload,
            service: 'htsget'
        })
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return [];
        })
        .catch((error) => {
            console.log('Error:', error);
            return 'error';
        });
}

export function query(parameters, abort) {
    const payload = {
        ...parameters
    };

    return fetch(`${federation}/fanout`, {
        method: 'post',
        signal: abort,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'GET',
            path: 'query',
            service: 'query',
            payload
        })
    })
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return [];
        })
        .catch((error) => {
            console.log('Error:', error);
            return 'error';
        });
}

/*
Post a clinical data JSON to Katsu
 * @param {string}... Name of a gene
*/
export function ingestClinicalData(data) {
    return fetch(`${INGEST_URL}/ingest/clinical_donors`, {
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

export function ingestGenomicData(data, program_id) {
    return fetch(`${INGEST_URL}/ingest/moh_variants/${program_id}`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: data
    })
        .then((response) => response)
        .catch((error) => {
            console.log('Error:', error);
            return error;
        });
}

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
                    completeClinical[site.location.name][program.program_id] = program.metadata.summary_cases.total_cases;
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
