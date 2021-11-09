// API Server constant
export const katsu = '';

export const federation = '';

// API Calls
export function fetchKatsu(URL) {
    return fetch(`${katsu}${URL}`)
        .then((response) => response.json())
        .then((data) => data);
}
