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
