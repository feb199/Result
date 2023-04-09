'use strict';

//#region Grab utility functions
// const Enum = require("./enum.js");
// const { Result, Results, ResultBase } = require("./result.js");
//#endregion

/**
 * Extracts the digit at the specified index from right to left in the number.
 *
 * @function getDigit
 * @memberof Number.prototype
 * 
 * @param { Number } index - The index of the digit to extract, starting from the right (0-indexed).
 * @returns { Number } - The extracted digit at the specified index.
 *
 * @example
 * const num = 1234567890;
 * const digit = num.getDigit(4); // Returns 6
 *
 * @description
 * This method can be used to extract a single digit from a number at a specific index from right to left.
 * The `index` parameter is 0-indexed, meaning the rightmost digit is at index 0, the second-to-rightmost digit is at index 1, and so on.
 */
function getDigit(index) {
    return Math.floor(this / Math.pow(10, index)) % 10;
};

/**
 * Verifies that the Version complies with "Semantic Versioning 2.0.0" (https://semver.org).
 *
 * @function verifyVersion
 * 
 * @param { String } version - The index of the digit to extract, starting from the right (0-indexed).
 * @returns { Boolean } - Either or not {version} complies with "Semantic Versioning 2.0.0" (https://semver.org).
 *
 * @example
 * import packageFile from "./package.json" assert { type: "json" };
 * if(!verifyVersion(packageFile.version)) throw new TypeError(`Version is incorrect: ${packageFile.version}`);
 */
function verifyVersion(version) {
    const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    return regex.test(version);
}


Number.prototype.getDigit = getDigit;


// module.exports = { Result, Results, ResultBase, Enum, verifyVersion };
module.exports = { verifyVersion };


// if(esMain(import.meta)) { // Checking if module is ran by itself (.mjs)
if (require.main === module) { // Checking if module is ran by itself (.js)
    // Example usage
    const num = 301;
    console.log(num.getDigit(2));
}


