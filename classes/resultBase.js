'use strict';

//#region Defining Libraries
// const Enum = require("./enum.js");
const Enum = require('enum');
const EventEmitter = require("events");
//#endregion

// const logLevelsEnum = new Enum("logLevelsEnum", [ "FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE" ]);
const logLevelsEnum = new Enum({ "FATAL": 0, "ERROR": 1, "WARN": 2, "INFO": 3, "DEBUG": 4, "TRACE": 5 });

const logEverything = false;

/**
 * Used by Result classes as a Base and this allows developers to log results of functions/methods.
 *
 * @since  1.0.0
 * @access private
 * 
 * @augments ResultBase
 * @static
 * 
 * @property { String } name - The name of the Result.
 * @property { EnumValue } type - The type of the Result.
 * @property { Number } code - The HTTP Status Code.
 * @property { Number } action - The action to take.
 * 
 * @property { EventEmitter? } globalEventHandler - The event to emit calls for "print". (Emits: print(String), error(String), clear()).
 * @property { EventEmitter? } localEventHandler - The event to emit calls for "print". (Emits: print(String), error(String), clear()), localEventHandler overrides static globalEventHandler.
 * 
 * @property { Result|Results } parent - The parent of the Result.
 * @property { Result|Results } child - The child of the Result.
 */
class ResultBase {
    /** 
    * name - The name of the Result.
    * @type { String }
    */
    name;
    /** 
    * type - The type of the Result.
    * @type { EnumValue }
    */
    type;
    /** 
    * code - The HTTP Status Code.
    * @type { Number }
    */
    code;
    /** 
    * action - The action to take.
    * @type { Number }
    */
    action;

    /** 
    * currentLogLevel - The Current Log Level.
    * @type { EnumValue }
    */
    static currentLogLevel = logLevelsEnum.INFO;
    /** 
    * logLevelsEnum - The Log Levels Enum.
    * @type { Enum }
    */
    static logLevelsEnum = logLevelsEnum;
    /** 
    * globalEventHandler - The event to emit calls for "print". (Emits: print(String), clear()).
    * @type { EventEmitter? }
    */
    static #globalEventHandler;

    /** 
    * parent - The parent of the Result.
    * @type { Result|Results }
    */
    #parent;
    /** 
    * child - The child of the Result.
    * @type { Result|Results }
    */
    #child;
    /** 
    * localEventHandler - The event to emit calls for "print". (Emits: print(String), clear()), localEventHandler overrides static globalEventHandler.
    * @type { EventEmitter? }
    */
    #localEventHandler;

    /** 
    * @param { String } name - The name of the Result.
    * @param { EnumValue } type - The type of the Result.
    * @param { Number } code - The HTTP Status Code.
    * @param { Number } action - The action to take.
    */
    constructor(name, type, code, action) {
        let isNameString = (typeof name === "string" || name instanceof String) && name.length > 0 && (name != "" && name != " ");
        let isNameNumber = (typeof name === "number" || name instanceof Number);
        let isNameValid = isNameString || isNameNumber;
        if(!isNameValid) throw new TypeError(`Name parameter is missing or invalid: ${name}`);

        // let isTypeNumber = !(isNaN(type));
        // type = Number(type);
        // let isTypeLogLevel = logLevelsEnum.values.includes(type);
        // let isTypeValid = isTypeNumber && isTypeLogLevel;
        // if(!isTypeValid) throw new TypeError(`Type parameter is missing or invalid: ${type}`);
        if(!logLevelsEnum.isDefined(type)) throw new TypeError(`Type parameter is missing or invalid: ${type}`);

        let isCodeNumber = !(isNaN(code));
        code = Number(code);
        let isCodeInRange = (code >= 0);
        if(!isCodeNumber || !isCodeInRange) throw new TypeError(`Code parameter is missing or invalid: ${code}`);

        let isActionNumber = !(isNaN(action));
        action = Number(action);
        let isActionInRange = (action >= 0);
        if(!isActionNumber || !isActionInRange) throw new TypeError(`Action parameter is missing or invalid: ${action}`);

        this.name = name.toString();
        this.type = type;
        this.code = code;
        this.action = action;
    }

    /**
     * localEventHandler - The event to emit calls for "print". (Emits: print(String), clear()), localEventHandler overrides static globalEventHandler.
     * @return { EventEmitter? }
     */
    get localEventHandler() { return this.#localEventHandler; }
    /**
     * localEventHandler - The event to emit calls for "print". (Emits: print(String), clear()), localEventHandler overrides static globalEventHandler.
     * @param { Result } EventHandler
     * @return { Boolean }
     */
    set localEventHandler(EventHandler) {
        let isEventHandlerValid = (EventHandler instanceof EventEmitter);
        if(isEventHandlerValid) {
            this.#localEventHandler = EventHandler;
            return true;
        } else {
            this.#localEventHandler = null;
            return false;
        }
    }

    /**
     * globalEventHandler - The event to emit calls for "print". (Emits: print(String), clear()).
     * @return { EventEmitter? }
     */
    static get globalEventHandler() { return ResultBase.#globalEventHandler; }
    /**
     * globalEventHandler - The event to emit calls for "print". (Emits: print(String), clear()).
     * @param { Result } EventHandler
     * @return { Boolean }
     */
    static set globalEventHandler(EventHandler) {
        let isEventHandlerValid = (EventHandler instanceof EventEmitter);
        if(isEventHandlerValid) {
            ResultBase.#globalEventHandler = EventHandler;
            return true;
        } else {
            ResultBase.#globalEventHandler = null;
            return false;
        }
    }

    /**
     * Checks if provided result in an instance of ResultBase, dosent check if(type <= currentLogLevel)
     * @param { Result } result
     * @return { Boolean }
     */
    static isResult(result) { return result instanceof ResultBase; }

    /**
     * Gets child of this result, dosent check if(type <= currentLogLevel)
     * @return { Result | Results }
     */
    get child() { return this.#child; }
    /**
     * @param { Result } result
     * @param { Boolean } skipChildAssign
     * @return { Result | Results }
     */
    setChild(result, skipChildAssign = false) {
        if(!ResultBase.isResult(result)) {
            console.error(`set child: ${result} isent a Result class`);
            return false;
        }
        this.#child = result;
        if(!skipChildAssign) result.setParent(this, true);
        return result;
    }
    /**
     * @param { Boolean } childAllreadyCleared
     * @return { Boolean }
     */
    clearChild(childAllreadyCleared = false) {
        if(!this.#child) {
            console.error(`this: ${this.name} doesn't has a child`);
            return false;
        }
        if(childAllreadyCleared && this.#child.parent !== this) {
            console.error(`clearChild: ${this.#child.parent.name} doesn't equal this: ${this.name}`);
            return false;
        }
        if(!childAllreadyCleared) this.#child.clearParent(true);
        this.#child = null;
        return true;
    }

    /**
     * Gets parent of this result, dosent check if(type <= currentLogLevel)
     * @return { Result | Results }
     */
    get parent() { return this.#parent; }
    /**
     * @param { Result | Results } result
     * @param { Boolean } skipChildAssign
     * @return { Result | Results }
     */
    setParent(result, skipChildAssign = false) {
        if(!ResultBase.isResult(result)) {
            console.error(`set child: ${result} isent a Result class`);
            return false;
        }
        this.#parent = result;
        if(!skipChildAssign) result.setChild(this, true);
        return result;
    }
    /**
     * @param { Boolean } parentAllreadyCleared
     * @return { Boolean }
     */
    clearParent(parentAllreadyCleared = false) {
        if(!this.#parent) {
            console.error(`this: ${this.name} doesn't has a parent`);
            return false;
        }
        if(parentAllreadyCleared && this.#parent.child !== this) {
            console.error(`this.parent.child: ${this.#parent.child.name} doesn't equal this: ${this.name}`);
            return false;
        }
        if(!parentAllreadyCleared) this.#parent.clearChild(true);
        this.#parent = null;
        return true;
    }

    /**
     * Gets first parent of this result's whole chain, dosent check if(type <= currentLogLevel)
     * @param { Result | Results } result
     * @return { Result | Results }
     */
    get firstParent() {
        let foundParent = this;
        if(this.parent) {
            while(foundParent.parent) {
                foundParent = foundParent.parent;
            }
        }
        return foundParent;
    }
    /**
     * Gets last child of this result's whole chain, dosent check if(type <= currentLogLevel)
     * @param { Result | Results } result
     * @return { Result | Results }
     */
    get lastChild() {
        let foundChild = this;
        if(this.child) {
            while(foundChild.child) {
                foundChild = foundChild.child;
            }
        }
        return foundChild;
    }

    /**
     * Get a custom amount of results(type <= currentLogLevel)
     * @param { Number? } mode
     * @param { Number? } toIndex
     * @param { Boolean? } collapseMultiResults
     * @param { Boolean? } flattenMultiResults
     * @return { (Result | Results)[] }
     */
    getAll(mode = 0, toIndex = -1, collapseMultiResults = false, flattenMultiResults = false) {
        // 0 = Get all from first parent to last child
        // 1 = Progress from last child to first parent
        let firstParent = this.firstParent;
        let lastChild = this.lastChild;

        let currentResult;
        if(mode === 0) {
            if(!firstParent) return false;
            currentResult = firstParent;
        } else if(mode === 1) {
            if(!lastChild) return false;
            currentResult = lastChild;
        } else {
            return false;
        }
        
        let allResults = [];

        let i = -1;
        let condition = function() { return (currentResult) } // Default to getting all results
        if(toIndex > 0) { // Default to getting {toIndex} amount of results
            condition = function() {
                let resolve = (currentResult && i < toIndex);
                if(currentResult && currentResult.belowCurrentLogLevel) i++;
                return resolve;
            }
        }

        while(condition()) {
            const shouldGetMultiResults = !collapseMultiResults && currentResult.results && Object.keys(currentResult.results).length > 0;

            let tempObject = [];
            if(shouldGetMultiResults) tempObject = checkMultiResults(currentResult, collapseMultiResults, flattenMultiResults);

            const isArray = toString.call(tempObject) === "[object Array]";
            const isArrayValid = (isArray && tempObject.length > 0);
            if(shouldGetMultiResults && isArrayValid) {
                if(flattenMultiResults || tempObject.length == 1) {
                    allResults.push(...tempObject);
                } else {
                    allResults.push(tempObject);
                }
            } else {
                if(currentResult.belowCurrentLogLevel) allResults.push(currentResult);
            }

            if(mode === 0) {
                currentResult = currentResult.child;
            } else if(mode === 1) {
                currentResult = currentResult.parent;
            }

        }
        return allResults;
    }

    /**
     * Prints this properties if(type <= currentLogLevel)
     * @param { Boolean? } onlyName
     * @return { Boolean }
     */
    print(onlyName = false) {
        let printString = `\nName: ${this.name}, Type: ${this.type}`;
        printString += `\nCode: ${this.code}, Action: ${this.action}`
        if(!onlyName) {
            if(this.parent) printString += `\nParent: ${this.parent.name}`;
            if(this.child) printString += `\nChild: ${this.child.name}`;
            printString += "\n";
        }
        
        if(this.localEventHandler) {
            this.localEventHandler.emit("print", printString);
        } else if(ResultBase.globalEventHandler) {
            ResultBase.globalEventHandler.emit("print", printString);
        } else {
            console.log(printString);
        }
        
        return true;
    }

    /**
     * Print all results(type <= currentLogLevel)
     * @param { Number? } mode
     * @param { Number? } numToProgress
     * @param { Boolean? } collapseMultiResults
     * @return { Boolean }
     */
    printMore(mode = 0, numToProgress = -1, collapseMultiResults = false) {
        let printString = `\nName: ${this.name}, Type: ${this.type}`;

        // 0 = Progress from current to last child
        // 1 = Progress from current to first parent
        // 2 = Progress from first parent to last child
        // 3 = Progress from last child to first parent
        let firstParent = this.firstParent;
        let lastChild = this.lastChild;

        
        let currentResult = this;     
        if(mode === 2) {
            if(!firstParent) return false;
            currentResult = firstParent;
        }
        if(mode === 3) {
            if(!lastChild) return false;
            currentResult = lastChild;
        }
        let firstResult = currentResult;

        let printResult = true;
        let printResults = [];
        
        let allResults = [];
        let i = -1;
        let condition = function() { return (currentResult) } // Default to print as many results
        if(numToProgress >= 0) { // Switch to printing as {numToProgress}
            condition = function() {
                let resolve = currentResult && (i < numToProgress)
                if(currentResult) i++;
                return resolve;
            };
        }
        
        while(condition()) {
            const shouldGetMultiResults = currentResult.results && Object.keys(currentResult.results).length > 0;
            // const shouldGetMultiResults = false;

            let tempArray = [];
            if(shouldGetMultiResults) tempArray = checkMultiResults(currentResult, collapseMultiResults, true);

            if(shouldGetMultiResults && tempArray.length > 0) {
                if(logEverything) {
                    console.log("resultBase.js shouldGetMultiResults && tempArray.length > 0")
                    console.log(tempArray);
                    console.log("\n\n")
                }
                allResults.push(...tempArray);
            } else {
                if(currentResult.belowCurrentLogLevel) {
                    allResults.push(currentResult);
                    if(logEverything) {
                        console.log("resultBase.js 2 } else { if(currentResult.belowCurrentLogLevel) {")
                        console.log(allResults);
                        console.log("\n\n")
                    }
                }
            }

            if(mode === 1 || mode === 3) {
                currentResult = currentResult.parent;
            } else {
                currentResult = currentResult.child;
            }

            if(logEverything) {
                console.log("resultBase.js (mode === 1 || mode === 3)")
                console.log(currentResult);
                console.log("\n\n")
            }
        }

        if(allResults.length > 0) {
            if(logEverything) {
                console.log("resultBase.js allResults.length > 0:")
                console.log(allResults);
                console.log("\n\n")
            }
            printResults.push(...allResults);
        } else {
            if(firstResult.belowCurrentLogLevel) printResults.push(firstResult);
        }

        if(printResults.length > 0) {
            if(logEverything) {
                console.log("resultBase.js printResults.length:")
                console.log(printResults);
                console.log("\n\n")
            }
            if(numToProgress >= 0) {
                printResult = printMultiArray(printResults, printResult, numToProgress);
            } else {
                printResult = printMultiArray(printResults, printResult);
            }
        } else {
            if(firstResult.belowCurrentLogLevel) printResult = firstResult.print();
        }
        

        if(!printResult) return printResult;
        return true;
    }

    /**
     * Checks whether or not (this.type is <= ResultBase.currentLogLevel)
     * @return { Boolean }
     */
    get belowCurrentLogLevel() { return this.type.value <= ResultBase.currentLogLevel.value }
}

module.exports = { ResultBase, checkMultiResults, printMultiArray };

/**
 * printMultiArray parses an array and prints all results
 * @param { ResultBase } allResults
 * @param { Boolean } printResult
 * @param { Number? } numToProgress
 * @param { Number? } i2
 * @return { Any } ResultBase[] || Object<Number, ResultBase[]>
 */
function printMultiArray(allResults, printResult, numToProgress = -1, i2 = null) {
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
                    printResult = printMultiArray(result, printResult, numToProgress, i2);
                } else {
                    printResult = printMultiArray(result, printResult);
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
