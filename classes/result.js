'use strict';

//#region Defining Libraries
// const Enum = require("./enum.js");
const EventEmitter = require("events");
const { checkMultiResults, printMultiArray } = require("../utils/resultUtils.js");
const ResultBase = require("./resultBase.js");
const logLevelsEnum = ResultBase.logLevelsEnum;
//#endregion

const logEverything = false;


/**
 * Used to store log results of functions/methods and also to executes actions depending on result of functions/methods.
 *
 * @since  1.0.0
 * @access public
 * 
 * @property { String } name - The name of the Result.
 * @property { EnumValue } type - The type of the Result.
 * @property { Number } code - The HTTP Status Code.
 * @property { Number } action - The action to take.
 * @property { String } message - The name of the Result.
 * @property { Any? } value - The passed through value of the Result.
 * 
 * @property { EventEmitter? } localEventHandler - The event to emit calls for "print". (Emits: print(String), clear()), localEventHandler overrides static globalEventHandler.
 * 
 *
 * @example
 * let result1 = new Result("Test1", logLevelsEnum.INFO, 200, 1, "Executed successfully", [ 0, 1, 2, 6 ]);
 * let result2 = new Result("Test2", 3, 200, 1, "Executed successfully", [ 0, 1, 2, 6 ]);
 * 
 * @memberof ResultBase
 */
class Result extends ResultBase {
    /** 
    * message - The name of the Result.
    * @type { String }
    */
    message;
    /** 
    * value - The passed through value of the Result.
    * @type { Any? }
    */
    value;

    /**
     * @param { String } message - The name of the Result.
     * @param { Any? } value - The passed through value of the Result.
     */
    constructor (name, type, code, action, message, value) {
        super(name, type, code, action);

        let isMessageValid = (typeof message === "string" || message instanceof String);
        if(!isMessageValid) throw new TypeError(`One or more parameters are missing or invalid:\nCode: ${code}, Action: ${action},\nMessage: ${message}`);

        this.message = message;
        this.value = value;
    }

    /**
     * globalEventHandler - The event to emit calls for "print". (Emits: print(String), clear()).
     * @return { EventEmitter? }
     */
    static get globalEventHandler() { return ResultBase.globalEventHandler; }
    /**
     * globalEventHandler - The event to emit calls for "print". (Emits: print(String), clear()).
     * @param { Result } EventHandler
     * @return { Boolean }
     */
    static set globalEventHandler(EventHandler) { return ResultBase.globalEventHandler = EventHandler; }

    print() {
        super.print(true);

        let printString = `Message: ${this.message}\nValue: ${this.value}`;
        if(this.parent) printString += `\nParent: ${this.parent.name}`;
        if(this.child) printString += `\nChild: ${this.child.name}`;
        printString += "\n";

        if(this.localEventHandler) {
            this.localEventHandler.emit("print", printString);
        } else if(ResultBase.globalEventHandler) {
            ResultBase.globalEventHandler.emit("print", printString);
        } else {
            console.log(printString);
        }

        return true;
    }
}

/**
 * Used to allow multiple results in one result and allows developers to store log results of functions/methods.
 *
 * @since  1.0.0
 * @access public
 * 
 * @property { String } name - The name of the Results.
 * @property { Number } code - The HTTP Status Code.
 * @property { Number } action - The action to take.
 * @property { ResultBase[] } results - An array of Result.
 * 
 * @property { EventEmitter? } localEventHandler - The event to emit calls for "print". (Emits: print(String), clear()), localEventHandler overrides static globalEventHandler.
 *
 * @example
 * let result1 = new Result("Test1", 200, 1, "Executed successfully", [ 0, 1, 2, 6 ]);
 * let result2 = new Result("Test2", 200, 1, "Executed successfully", [ 0, 1, 2, 6 ]);
 * 
 * let results1 = new Results("Test3", 200, 1,  [
 *     result1,
 *     result2
 * ]);
 * 
 * @memberof ResultBase
 */
class Results extends ResultBase {
    /** 
    * results - An array of Result.
    * @type { ResultBase[] }
    */
    #results;

    /**
    * @param { Array<ResultBase> } results - An array of Result.
    */
    constructor (name, code, action, results) {
        
        // let lowestLogLevel = logLevelsEnum.highest;
        
        // for (let i = 0; i < results.length; i++) {
        //     const result = results[i];
        //     if(result.type < lowestLogLevel) lowestLogLevel = result.type;
        // }

        // if(lowestLogLevel > Result.currentLogLevel) lowestLogLevel = Result.currentLogLevel;

        let lowestLogLevels = [];
        
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            lowestLogLevels.push(result.type.value);
        }

        const lowestLogLevelValue = Math.min(...lowestLogLevels);

        let lowestLogLevel = logLevelsEnum[logLevelsEnum.getKey(lowestLogLevelValue)];

        if(lowestLogLevel.value > Result.currentLogLevel.value) lowestLogLevel = Result.currentLogLevel;


        super(name, lowestLogLevel, code, action);

        if(toString.call(results) !== "[object Array]") throw new TypeError("results is required to be an array of ResultBase instances");
        if(results.length < 1) throw new TypeError("A result is required");
        
        for (let i = 0; i < results.length; i++) {
            let resultOne = results[i];
            if(!ResultBase.isResult(resultOne)) throw new TypeError(`Incorrect result type - the type passed was a '${toString.call(resultOne)}'`);

            let result = resultOne.setParent(this, true);

            if(!result) throw new TypeError(`ERROR - setting result parent to '${this.name}'`);
        }
        
        this.#results = results;
    }

    /**
     * globalEventHandler - The event to emit calls for "print". (Emits: print(String), clear()).
     * @return { EventEmitter? }
     */
    static get globalEventHandler() { return ResultBase.globalEventHandler; }
    /**
     * globalEventHandler - The event to emit calls for "print". (Emits: print(String), clear()).
     * @param { Result } EventHandler
     * @return { Boolean }
     */
    static set globalEventHandler(EventHandler) { return ResultBase.globalEventHandler = EventHandler; }

    /**
     * results - Gets the events of `this`.
     * @return { ResultBase[] }
     */
    get results() { return this.#results; }

    print(skipResults = false) {
        super.print(true);

        let printString = "";
        if(this.parent) printString += `Parent: ${this.parent.name}`;
        if(this.child) printString += `\nChild: ${this.child.name}`;

        if(this.localEventHandler) {
            this.localEventHandler.emit("print", printString);
        } else if(ResultBase.globalEventHandler) {
            ResultBase.globalEventHandler.emit("print", printString);
        } else {
            console.log(printString);
        }

        if(!skipResults && this.results.length > 0) {
            let printResult = null;
            for (let i = 0; i < this.results.length; i++) {
                let resultcheck = this.results[i];
                let firstResult = resultcheck;
                
                let printResults = [];
                let allResults = [];

                while(resultcheck) {                    
                    const shouldGetMultiResults = resultcheck.results && Object.keys(resultcheck.results).length > 0;
                    
                    let tempArray = [];
                    if(shouldGetMultiResults) tempArray = checkMultiResults(resultcheck, true);
                    
                    if(tempArray.length > 0) {
                        if(logEverything) {
                            console.log(`result.js 1 (tempArray.length > 0)`)
                            console.log(tempArray);
                            console.log("\n\n")
                        }
                        tempArray.unshift(resultcheck);
                        if(logEverything) {
                            console.log(`result.js 2 (tempArray.length > 0)`)
                            console.log(tempArray);
                            console.log("\n\n")
                        }
                        allResults.push(...tempArray);
                    } else {
                        if(resultcheck.belowCurrentLogLevel) {
                            allResults.push(resultcheck);
                            if(logEverything) {
                                console.log(`result.js } else { if(resultcheck.belowCurrentLogLevel) {`)
                                console.log(resultcheck);
                                console.log("\n\n")
                            }
                        }
                    }

                    resultcheck = resultcheck.child;
                }

                if(allResults.length > 0) {
                    if(logEverything) {
                        console.log(`result.js 1 if(allResults.length > 0) {`)
                        console.log(allResults);
                        console.log("\n\n")
                    }
                    // allResults.unshift(firstResult);
                    if(logEverything) {
                        console.log(`result.js 2 if(allResults.length > 0) {`)
                        console.log(allResults);
                        console.log("\n\n")
                    }
                    printResults.push(...allResults);
                } else {
                    if(firstResult.belowCurrentLogLevel) printResults.push(firstResult);
                }
        
                if(printResults.length > 0) {
                    if(logEverything) {
                        console.log(`result.js if(printResults.length > 0) {`)
                        console.log(printResults);
                        console.log("\n\n")
                    }
                    printResult = printMultiArray(ResultBase, printResults, printResult);
                } else {
                    if(firstResult.belowCurrentLogLevel) {
                        printResult = firstResult.print();
                        if(logEverything) {
                            console.log(`result.js } else { if(firstResult.belowCurrentLogLevel) {`)
                            console.log(firstResult);
                            console.log("\n\n")
                        }
                    }
                }

                if(!printResult) break;
            }

            if(printResult !== null && !printResult) {
                printString = "\n\n\n\nprintResult\n\n\n\n";
                if(this.localEventHandler) {
                    this.localEventHandler.emit("error", printString);
                } else if(ResultBase.globalEventHandler) {
                    ResultBase.globalEventHandler.emit("error", printString);
                } else {
                    console.error(printString);
                }
                
                return printResult;
            }
        }
        printString = "\n";
        if(this.localEventHandler) {
            this.localEventHandler.emit("print", printString);
        } else if(ResultBase.globalEventHandler) {
            ResultBase.globalEventHandler.emit("print", printString);
        } else {
            console.log(printString);
        }
        
        return true;
    }
}

module.exports = { Result, Results, ResultBase };