// API Server constant
/* eslint-disable camelcase */
export const katsu = process.env.REACT_APP_KATSU_API_SERVER;
export const federation = `${process.env.REACT_APP_FEDERATION_API_SERVER}/v1`;
export const BASE_URL = process.env.REACT_APP_CANDIG_SERVER;
export const htsget = process.env.REACT_APP_HTSGET_SERVER;
export const TYK_URL = process.env.REACT_APP_TYK_SERVER;

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
export function fetchFederationClinicalData() {
    // Until I can debug the Tyk error
    return new Promise((resolve) => resolve({}));
    /* return fetch(`${federation}/fanout`, {
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
        }); */
}

/*
Fetch peer federation stats from CanDIG federation service 
*/
export function fetchSummaryStats(URL) {
    return federation !== '' ? fetchFederationStat() : fetchKatsu(URL);
}

/*
Fetch peer federation stats from CanDIG federation service 
*/
export function fetchClinicalData(URL) {
    return federation !== '' ? fetchFederationClinicalData() : fetchKatsu(URL);
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
