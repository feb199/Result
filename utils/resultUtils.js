'use strict';

const logEverything = false;


/**
 * printMultiArray parses an array and prints all results
 * @param { ResultBase } allResults
 * @param { Boolean } printResult
 * @param { Number? } numToProgress
 * @param { Number? } i2
 * @return { Any } ResultBase[] || Object<Number, ResultBase[]>
 */
function printMultiArray(ResultBase, allResults, printResult, numToProgress = -1, i2 = null) {
    let currentResults = allResults;
    //while (toString.call(currentResults) === "[object Array]") {
    if(toString.call(currentResults) === "[object Array]") {

        if(logEverything) {
            console.log("resultBase.js currentResults:")
            console.log(currentResults);
            console.log("\n\n")
        }

        if(!i2) i2 = 0;

        for(let i = 0; i < currentResults.length; i++) {
            if(numToProgress >= 0 && i2 > numToProgress) break;

            let result = currentResults[i2];
            if(logEverything) {
                console.log(`${i2} result = currentResults[i2]:`)
                console.log(result);
                console.log("\n\n")
            }

            if (toString.call(result) === "[object Array]") {
                if(logEverything) {
                    console.log(`resultBase.js ${i2} if (toString.call(result) === "[object Array]"):`)
                    console.log(result);
                    console.log("\n\n")
                }
                if(numToProgress >= 0) {
                    printResult = printMultiArray(ResultBase, result, printResult, numToProgress, i2);
                } else {
                    printResult = printMultiArray(ResultBase, result, printResult);
                }
                if(!printResult) break;
            } else if (ResultBase.isResult(result)) {
                if(logEverything) {
                    console.log(`resultBase.js ${i2} if } else if (ResultBase.isResult(result)) {:`)
                    console.log(result);
                    console.log("\n\n")
                }
                printResult = result.print(true);
                i2++;
                if (!printResult) break;
            } else {
                throw new TypeError(`result is not a ResultBase: ${result}`);
            }
            if (!printResult) break;
        }
    }

    return printResult;
}

/**
 * Checks checkMultiResults and returns all results that is (this.type is <= ResultBase.currentLogLevel)
 * @param { ResultBase } currentResult
 * @param { Boolean? } collapseMultiResults
 * @param { Boolean? } flattenMultiResults
 * @return { ResultBase[] }
 */
function checkMultiResults(currentResult, collapseMultiResults = false, flattenMultiResults = false) {
    let returnArray = [];
    let lastArray = [];

    for (let i = 0; i < Object.keys(currentResult.results).length; i++) {
        const tempResult = currentResult.results[i];
        let resultcheck = tempResult;

        let tempArray = [];

        while(resultcheck) {
            
            const shouldGetMultiResults = !collapseMultiResults && resultcheck.results && Object.keys(resultcheck.results).length > 0;
            
            let tempArray2 = [];
            if(shouldGetMultiResults) tempArray2 = checkMultiResults(resultcheck, collapseMultiResults, flattenMultiResults);
            
            if(tempArray2.length > 0) {
                if(logEverything) {
                    console.log("resultBase.js 1 [checkMultiResults] (tempArray2.length > 0)")
                    console.log(tempArray2);
                    console.log("\n\n")
                }
                // tempArray2.unshift(resultcheck);
                if(logEverything) {
                    console.log("resultBase.js 2 [checkMultiResults] (tempArray2.length > 0)")
                    console.log(tempArray2);
                    console.log("\n\n")
                }
                if(flattenMultiResults || tempArray2.length == 1) {
                    tempArray.push(...tempArray2);
                } else {
                    tempArray.push(tempArray2);
                }
            } else {
                if(resultcheck.belowCurrentLogLevel) {
                    tempArray.push(resultcheck);
                    if(logEverything) {
                        console.log("resultBase.js [checkMultiResults] } else { if(resultcheck.belowCurrentLogLevel) {")
                        console.log(resultcheck);
                        console.log("\n\n")
                    }
                }
            }

            resultcheck = resultcheck.child;
        }

        if(tempArray.length > 0) {
            if(logEverything) {
                console.log("resultBase.js 1 [checkMultiResults] (tempArray.length > 0)")
                console.log(tempArray);
                console.log("\n\n")
            }
            //tempArray.unshift(tempResult);
            if(logEverything) {
                console.log("resultBase.js 2 [checkMultiResults] (tempArray.length > 0)")
                console.log(tempArray);
                console.log("\n\n")
            }
            if(flattenMultiResults || tempArray.length == 1) {
                lastArray.push(...tempArray);
            } else {
                lastArray.push(tempArray);
            }
        } else {
            if(tempResult.belowCurrentLogLevel) {
                lastArray.push(tempResult);
                if(logEverything) {
                    console.log("resultBase.js 3 [checkMultiResults] } else { if(tempResult.belowCurrentLogLevel)")
                    console.log(lastArray);
                    console.log("\n\n")
                }
            }
        }
    }

    if(lastArray.length > 0) {
        if(logEverything) {
            console.log("resultBase.js 1 [checkMultiResults] (lastArray.length > 0)")
            console.log(lastArray);
            console.log("\n\n")
        }
        lastArray.unshift(currentResult);
        if(logEverything) {
            console.log("resultBase.js 2 [checkMultiResults] (lastArray.length > 0)")
            console.log(lastArray);
            console.log("\n\n")
        }
        
        if(flattenMultiResults || lastArray.length == 1) {
            returnArray.push(...lastArray);
        } else {
            returnArray.push(lastArray);
        }
    } else {
        if(currentResult.belowCurrentLogLevel) {
            returnArray.push(currentResult);
            if(logEverything) {
                console.log("resultBase.js [checkMultiResults] } else { if(currentResult.belowCurrentLogLevel)")
                console.log(currentResult);
                console.log("\n\n")
            }
        }
    }
    return returnArray;
}


module.exports = { checkMultiResults, printMultiArray };


