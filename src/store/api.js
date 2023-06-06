// API Server constant
/* eslint-disable camelcase */
export const katsu = process.env.REACT_APP_KATSU_API_SERVER;
export const federation = process.env.REACT_APP_FEDERATION_API_SERVER + '/v1';
export const BASE_URL = process.env.REACT_APP_CANDIG_SERVER;
export const htsget = process.env.REACT_APP_HTSGET_SERVER;
export const TYK_URL = process.env.REACT_APP_TYK_SERVER;

// API Calls
/* 
Fetch katsu calls
*/
export function fetchKatsu(URL) {
    return fetch(`${katsu}${URL}`)
        .then((response) => response.json())
        .then((data) =>
            fetch(`${katsu}${URL}?page_size=${data.count}`) // Page size by default is 25 set page size to count to returns all
                .then((response) => response.json())
                .then((data) => data)
        );
}

export function fetchFederationStat() {
    return fetch(`${federation}/fanout`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'GET',
            path: 'v2/discovery/overview/patients_per_cohort',
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
}

/*
Fetch the federation service for clinical search data
*/
export function fetchFederationClinicalData() {
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
Fetch peer servers from CanDIG federation service 
*/
export function fetchServers() {
    return fetch(`${federation}/servers`, {}).then((response) => {
        if (response.ok) {
            return response.json();
        }
        return {};
    });
}

/*
Fetch variant for a specific Dataset Id; start; and reference name; and returns a promise
 * @param {number}... Start
 * @param {number}... End
 * @param {string}... Reference name
*/
export function searchVariant(chromosome, start, end) {
    const payload = {
        regions: [
            {
                referenceName: chromosome,
                start: parseInt(start, 10),
                end: parseInt(end, 10)
            }
        ]
    };
    return fetch(`${federation}/fanout`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            method: 'POST',
            path: 'htsget/v1/variants/search',
            payload: payload,
            service: 'htsget'
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
}
