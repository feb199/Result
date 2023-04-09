'use strict';

//#region Defining Libraries
const { verifyVersion } = require("./utils/utils.js");
const { ResultBase, Result, Results } = require("./classes/result.js");
//#endregion

// Checking if version is correct
const packageFile = require("./package.json");
if(!verifyVersion(packageFile.version)) throw new TypeError(`Version is incorrect: ${packageFile.version}`);

Number.prototype.getDigit = getDigit;


module.exports = { Result, Results, ResultBase };


// if(esMain(import.meta)) { // Checking if module is ran by itself (.mjs)
if (require.main === module) { // Checking if module is ran by itself (.js
    // Example usage
    const num = 301;
    console.log(num.getDigit(2));
}


