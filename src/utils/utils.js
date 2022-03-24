// /* eslint-disable import/prefer-default-export */
// /*
//    * Return the aggregation value of a key from an array of objects.
//    * @param {array} objectArray: An array of objects.
//    * @param {object} property: The key to aggregate on.
//    * @return an object with different values of the
//    *  queried property being the key, and frequency being the value.
//    */
// export function groupBy(objectArray, property) {
//     return objectArray.reduce((acc, obj) => {
//       const key = obj[property];
//       if (!acc[key]) {
//         acc[key] = 0;
//       }
//       acc[key] += 1;
//       delete acc.undefined;
//       return acc;
//     }, {});
//   }
