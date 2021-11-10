// API Server constant
export const katsu = process.env.REACT_APP_KATSU_API_SERVER;
export const federation = process.env.REACT_APP_FEDERATION_API_SERVER;

// API Calls
export function fetchKatsu(URL) {
    return fetch(`${katsu}${URL}`)
        .then((response) => response.json())
        .then((data) => data);
}
