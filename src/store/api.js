// API Server constant
export const katsu = process.env.REACT_APP_KATSU_API_SERVER;
export const federation = process.env.REACT_APP_FEDERATION_API_SERVER;
export const BASE_URL = process.env.REACT_APP_CANDIG_SERVER;
export const htsget = process.env.REACT_APP_HTSGET_SERVER;

// API Calls
export function fetchKatsu(URL) {
    return fetch(`${katsu}${URL}`)
        .then((response) => response.json())
        .then((data) =>
            fetch(`${katsu}${URL}?page_size=${data.count}`) // Page size by default is 25 set page size to count to returns all
                .then((response) => response.json())
                .then((data) => data)
        );
}

/*
Fetch patients from CanDIG web api and returns a promise
*/
function fetchPatients(datasetId) {
    return fetch(`${BASE_URL}/patients/search`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
            datasetId
        })
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        return {};
    });
}

/*
Fetch datasets from CanDIG web api datasets endpoint and returns a promise
*/
function fetchDatasets() {
    return fetch(`${BASE_URL}/datasets/search`, {
        method: 'post'
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        return {};
    });
}

/*
Fetch servers from CanDIG web api datasets endpoint and returns a promise
*/
function fetchServers() {
    return fetchDatasets();
}

/*
Fetch counter for a specific Dataset Id; table; and field; and returns a promise
 * @param {string}... Dataset ID
 * @param {string}... Table to be fetched from
 * @param {list}... Field to be fetched from
*/
function getCounts(datasetId, table, field) {
    let temp;
    if (!Array.isArray(field)) {
        temp = [field];
    } else {
        temp = field;
    }

    return fetch(`${BASE_URL}/count`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            dataset_id: datasetId,
            logic: {
                id: 'A'
            },
            components: [
                {
                    id: 'A',
                    patients: {}
                }
            ],
            results: [
                {
                    table,
                    fields: temp
                }
            ]
        })
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        return {};
    });
}

/*
Fetch variant for a specific Dataset Id; start; and reference name; and returns a promise
 * @param {string}... Dataset ID
 * @param {number}... Start
 * @param {number}... End
 * @param {string}... Reference name
*/
function searchVariant(datasetId, start, end, referenceName) {
    return fetch(`${BASE_URL}/variants/search`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            start,
            end,
            referenceName,
            datasetId
        })
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        return {};
    });
}

/*
Fetch variant for a specific Dataset Id; start; and reference name; and returns a promise
 * @param {string}... Dataset ID
 * @param {number}... Start
 * @param {number}... End
 * @param {string}... Reference name
*/
function searchVariantByVariantSetIds(start, end, referenceName, variantSetIds) {
    return fetch(`${BASE_URL}/variants/search`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            start,
            end,
            referenceName,
            variantSetIds
        })
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        return {};
    });
}

/*
Fetch variants and returns a promise
 * @param {string}... datasetId
 * @param {string}... Start
 * @param {string}... End
 * @param {string}... Reference name
*/
function searchBeaconRange(datasetId, start, end, referenceName) {
    return fetch(`${BASE_URL}/variants/beacon/range/search`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            start,
            end,
            referenceName,
            datasetId
        })
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        return {};
    });
}

/*
Fetch variants and returns a promise
 * @param {string}... datasetId
 * @param {string}... Start
 * @param {string}... End
 * @param {string}... Reference name
*/
function searchBeaconFreq(datasetId, start, end, referenceName) {
    return fetch(`${BASE_URL}/variants/beacon/allele/freq/search`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            start,
            end,
            referenceName,
            datasetId
        })
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        return {};
    });
}

/*
Fetch variant set for a specific Dataset Id; and returns a promise
 * @param {string}... Dataset ID
*/
function searchVariantSets(datasetId) {
    return fetch(`${BASE_URL}/variantsets/search`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            datasetId
        })
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        return {};
    });
}

/*
Fetch read group set for a specific datasetId; and returns a promise
 * @param {string}... datasetId
*/
function searchReadGroupSets(datasetId) {
    return fetch(`${BASE_URL}/readgroupsets/search`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            datasetId
        })
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        return {};
    });
}

/*
Fetch reads for a specific start, end, reference name; and returns a promise
 * @param {string}... datasetId
 * @param {number}... start
 * @param {number}... end
 * @param {array}... readGroupIds
 * @param {string}... referenceGenome
 * @param {string}... referenceName
*/
function searchReads(start, end, referenceName, referenceGenome, readGroupIds) {
    const rawReferenceId = `["${referenceGenome}","${referenceName}"]`;
    const referenceId = btoa(rawReferenceId).replaceAll('=', '');
    const pageSize = 100;

    return fetch(`${BASE_URL}/reads/search`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            readGroupIds,
            start,
            end,
            referenceId,
            pageSize
        })
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        return {};
    });
}

/*
Fetch reference set for a specific referenceSetId; and returns a promise
 * @param {string}... Reference set ID
*/
function getReferenceSet(referenceSetId) {
    return fetch(`${BASE_URL}/referencesets/${referenceSetId}`, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' }
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        return {};
    });
}

/*
Fetch data of genomic datasets, including readgroupsets, variantsets, featuresets and referencesets
 * @param {string}... datasetId
*/
function searchGenomicSets(datasetId, path) {
    return fetch(`${BASE_URL}/${path}/search`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            datasetId
        })
    }).then((response) => {
        if (response.ok) {
            return response.json();
        }
        return {};
    });
}

export {
    fetchPatients,
    fetchDatasets,
    getCounts,
    fetchServers,
    searchVariant,
    searchBeaconRange,
    searchBeaconFreq,
    searchVariantSets,
    searchReadGroupSets,
    searchReads,
    getReferenceSet,
    searchVariantByVariantSetIds,
    searchGenomicSets
};
