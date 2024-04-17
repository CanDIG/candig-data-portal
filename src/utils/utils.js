/* Object Aggregation
 * @param {object} stat: The object to aggregate
 * @param {object} aggregateObj: The object to aggregate into
 * * @param {func} aggregator: A function that grabs the numerical value from stat
 * @return an object with different values of the queried property
 * being the key, and frequency being the value.
 * This function is used for the pie and bar charts
 */
export function aggregateObj(stat, aggregateObj, aggregator = (object, key) => object[key]) {
    const count = { ...aggregateObj };
    Object.keys(stat).forEach((key) => {
        if (key in count) {
            count[key] += aggregator(stat, key);
        } else {
            count[key] = aggregator(stat, key);
        }
    });
    return count;
}

/* Object Aggregation for Stack Bar chart
 * @param {object} stat: The object to aggregate
 * @param {object} Object: The object to aggregate into
 * @param {func} aggregator: A function that grabs the numerical value from stat
 * @return an object with different values of the queried property
 * being the key, and frequency being the value.
 * This function is used for the stack bar chart
 */
export function aggregateObjStack(stat, Object, aggregator = (object) => object) {
    const count = { ...Object };
    count[stat.location.name] = aggregator(stat);
    return count;
}

/* Title Case function
 * @param {string} str: The string to transform
 * @return a string with the first letter of each word capitalized
 */
export function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

/*
 * Transform a camelCase string to a capital spaced string
 * @param {string} newString: The string to transform
 * @return a string with the first letter of each word capitalized
 * and a space between each word
 */
export function splitString(newString) {
    const splitted = newString.replace(/([a-z])([A-Z])/g, '$1 $2');
    const capitalized = splitted.charAt(0).toUpperCase() + splitted.substr(1);
    return capitalized;
}

/*
 * Return the aggregation value of a key from an array of objects.
 * @param {array} objectArray: An array of objects.
 * @param {object} property: The key to aggregate on.
 * @return an object with different values of the
 * queried property being the key, and frequency being the value.
 */
export function groupBy(objectArray, property) {
    return objectArray.reduce((acc, obj) => {
        const key = obj[property];
        if (!acc[key]) {
            acc[key] = 0;
        }
        acc[key] += 1;
        delete acc.undefined;
        return acc;
    }, {});
}

/*
 * Return aggregation value of a key anmd its count from an array of objects
 * @param {array} objectArray: An array of objects.
 * @param {object} property: The key to aggregate on.
 * @return an object a collection of keys and their counts
 */
export function groupCount(objectArray, property) {
    return objectArray.reduce((acc, obj) => {
        const key = obj[property];
        if (!acc[key]) {
            acc[key] = 0;
        }
        acc[key] = obj.count;
        delete acc.undefined;
        return acc;
    }, {});
}

/*
 * Merge results formm federation service into one array
 * @param data: The federated response object
 */
export function mergeFederatedResults(data) {
    let output = [];
    const { results } = data;
    for (let i = 0; i < results.length; i += 1) {
        output = output.concat(results[i].results);
    }
    return output;
}

/*
 * Format a key by converting underscores to spaces and capitalizing each word
 * @param {string} key - The key to be formatted
 * @returns {string} - The formatted key
 */
export function formatKey(key) {
    return key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/*
 * Handles the setup of a table by processing the data and generating configuration for the columns and rows
 * @param {string} title - The title of the table
 * @param {Array} array - The table to be processed
 * @param {function} setTitle - Function to set the title of the table
 * @param {function} setColumns - Function to set the columns of the table
 * @param {function} setRows - Function to set the rows of the table
 */
export function handleTableSet(title, array, ageAtFirstDiagnosis) {
    const uniqueKeysSet = new Set();

    array.forEach((obj) => {
        const entries = Object.entries(obj);

        const validEntries = entries.filter((value) => value !== null && value !== undefined && value !== '');

        validEntries.forEach(([key]) => {
            uniqueKeysSet.add(key);
        });
    });

    const uniqueKeys = Array.from(uniqueKeysSet);

    let startDate;
    let endDate;
    const columns = uniqueKeys.map((key) => {
        const hasNonEmptyValue = array.some((obj) => {
            if (Array.isArray(obj[key])) {
                // Include arrays of strings
                return obj[key].length > 0 && obj[key].every((item) => typeof item === 'string');
            }

            return (
                obj[key] !== null &&
                obj[key] !== undefined &&
                obj[key] !== '' &&
                (!(typeof obj[key] === 'object') || (typeof obj[key] === 'object' && 'month_interval' in obj[key]))
            );
        });

        let value = key;
        if (key === 'date_of_diagnosis') {
            value = `Age at Diagnosis`;
        } else if (key.endsWith('_start_date')) {
            value = `Diagnosis_to_${key}`;
            startDate = key;
        } else if (key.endsWith('_end_date')) {
            value = key.split('_end_date')[0];
            value = `${value.trim()} Duration`;
            endDate = key;
        } else if (key.startsWith('date_of_')) {
            value = key.split('date_of_')[1];
            value = `Diagnosis_to_${value.trim()}`;
        }

        return hasNonEmptyValue
            ? {
                  field: key,
                  headerName: formatKey(value),
                  flex: 1,
                  minWidth: 275
              }
            : null;
    });

    const filteredColumns = columns.filter((column) => column !== null);

    const reorderedColumns = [...filteredColumns].sort((a, b) => {
        const aEndsWithID = a.headerName.endsWith('Id');
        const bEndsWithID = b.headerName.endsWith('Id');

        if (aEndsWithID && !bEndsWithID) {
            return -1;
        }
        if (!aEndsWithID && bEndsWithID) {
            return 1;
        }
        return 0;
    });

    const rowsClick = array.map((obj, index) => {
        const row = { id: index };

        filteredColumns.forEach((column) => {
            // eslint-disable-next-line no-prototype-builtins
            if (obj[column.field]?.hasOwnProperty('day_interval') && column.field !== 'date_of_diagnosis') {
                if (column.field === 'endDate') {
                    const ageInDays = obj[endDate].day_interval - obj[startDate].day_interval;
                    const years = Math.floor(ageInDays / 365);
                    const remainingDays = ageInDays % 365;
                    const months = Math.floor(remainingDays / 30);
                    const days = remainingDays % 30;

                    row[column.field] = `${years}y ${months}m ${days}d`;
                } else {
                    const ageInDays = obj[column.field].day_interval;
                    const years = Math.floor(ageInDays / 365);
                    const remainingDays = ageInDays % 365;
                    const months = Math.floor(remainingDays / 30);
                    const days = remainingDays % 30;

                    row[column.field] = `${years}y ${months}m ${days}d`;
                }
            } else if (
                // eslint-disable-next-line no-prototype-builtins
                obj[column.field]?.hasOwnProperty('month_interval') &&
                column.field !== 'date_of_diagnosis'
            ) {
                if (column.field === endDate) {
                    const ageInMonths = obj[endDate].month_interval - obj[startDate].month_interval;
                    const years = Math.floor(ageInMonths / 12);
                    const remainingMonths = ageInMonths % 12;

                    // Format the years and months into a single string
                    const formattedAge = years > 0 ? `${years}y ${remainingMonths}m` : `${remainingMonths}m`;
                    row[column.field] = formattedAge;
                } else {
                    const ageInMonths = obj[column.field].month_interval;
                    const years = Math.floor(ageInMonths / 12);
                    const remainingMonths = ageInMonths % 12;

                    // Format the years and months into a single string
                    const formattedAge = years > 0 ? `${years}y ${remainingMonths}m` : `${remainingMonths}m`;
                    row[column.field] = formattedAge;
                }
            } else if (column.field === 'date_of_diagnosis') {
                row[column.field] = ageAtFirstDiagnosis + Math.floor(obj[column.field].month_interval / 12);
            } else {
                row[column.field] = Array.isArray(obj[column.field]) ? obj[column.field].join(', ') : obj[column.field]; // Add spaces to arrays
            }
        });

        return row;
    });

    const titleClick = formatKey(title);
    return { rowsClick, titleClick, reorderedColumns };
}
