'use strict';

//#region Defining Libraries
// const Enum = require("./enum.js");
const Enum = require('enum');
const EventEmitter = require("events");
const { checkMultiResults, printMultiArray } = require("../utils/resultUtils.js");
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
 * @property { EnumItem } type - The type of the Result.
 * @property { Number } code - The HTTP Status Code.
 * @property { Number } action - The action to take.
 * 
 * @property { EventEmitter? } globalEventHandler - The event to emit calls for "print". (Emits: print(String), error(String), clear()).
 * @property { EventEmitter? } localEventHandler - The event to emit calls for "print". (Emits: print(String), error(String), clear()), localEventHandler overrides static globalEventHandler.
 * 
 * @property { ResultBase } parent - The parent of the Result.
 * @property { ResultBase } child - The child of the Result.
 */
class ResultBase {
    /** 
    * name - The name of the Result.
    * @type { String }
    */
    name;
    /** 
    * type - The type of the Result.
    * @type { EnumItem }
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
    * @type { ResultBase? }
    */
    #parent;
    /** 
    * child - The child of the Result.
    * @type { ResultBase? }
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
        // @ts-ignore
        let isNameString = (typeof name === "string" || name instanceof String) && name.length > 0 && (name != "" && name != " ");
        // @ts-ignore
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
     * localEventHandler - Get the eventEmmitter that handles events. (Emits: print(String), clear()), localEventHandler overrides static globalEventHandler.
     * @return { EventEmitter? }
     */
    // @ts-ignore
    get localEventHandler() { return this.#localEventHandler; }
    /**
     * localEventHandler - Set the eventEmmitter that handles events. (Emits: print(String), clear()), localEventHandler overrides static globalEventHandler.
     * @param { EventEmitter } EventHandler
     * @return { Boolean }
     */
    set localEventHandler(EventHandler) {
        let isEventHandlerValid = (EventHandler instanceof EventEmitter);
        if(isEventHandlerValid) { this.#localEventHandler = EventHandler;
        } else this.#localEventHandler = null;
    }

    /**
     * globalEventHandler - Get the eventEmmitter that handles events. (Emits: print(String), clear()).
     * @return { EventEmitter? }
     */
    // @ts-ignore
    static get globalEventHandler() { return ResultBase.#globalEventHandler; }
    /**
     * globalEventHandler - Set the eventEmmitter that handles events. (Emits: print(String), clear()).
     * @param { EventEmitter } EventHandler
     * @return { Boolean }
     */
    static set globalEventHandler(EventHandler) {
        let isEventHandlerValid = (EventHandler instanceof EventEmitter);
        if(isEventHandlerValid) { ResultBase.#globalEventHandler = EventHandler;
        } else ResultBase.#globalEventHandler = null;
    }

    /**
     * Checks if provided result in an instance of ResultBase, dosent check if(type <= currentLogLevel)
     * @param { ResultBase } result
     * @return { Boolean }
     */
    static isResult(result) { return result instanceof ResultBase; }

    /**
     * Gets child of `this`, dosent check if(type <= currentLogLevel)
     * @return { ResultBase? }
     */
    get child() { return this.#child; }
    /**
     * Sets child of `this` to `result`, dosent check if(type <= currentLogLevel)
     * @param { ResultBase } result
     * @param { Boolean } skipParentAssign
     * @return { ResultBase? }
     */
    setChild(result, skipParentAssign = false) {
        if(!ResultBase.isResult(result)) throw new TypeError(`set child: ${result} isent a Result class`);

        this.#child = result;
        if(!skipParentAssign) result.setParent(this, true);
        return result;
    }
    /**
     * Clears child of `this`, dosent check if(type <= currentLogLevel)
     * @param { Boolean } childAllreadyCleared
     * @return { Boolean }
     */
    clearChild(childAllreadyCleared = false) {
        if(!this.#child) {
            console.error(`this: ${this.name} doesn't has a child`);
            return false;
        }
        if(childAllreadyCleared && this.#child.parent !== this) {
            // @ts-ignore
            console.error(`clearChild: ${this.#child.parent.name} doesn't equal this: ${this.name}`);
            return false;
        }
        if(!childAllreadyCleared) this.#child.clearParent(true);
        this.#child = null;
        return true;
    }

    /**
     * Gets parent of `this`, dosent check if(type <= currentLogLevel)
     * @return { ResultBase? }
     */
    get parent() { return this.#parent; }
    /**
     * Sets parent of `this` to `result`, dosent check if(type <= currentLogLevel)
     * @param { ResultBase } result
     * @param { Boolean } skipChildAssign
     * @return { ResultBase }
     */
    setParent(result, skipChildAssign = false) {
        if(!ResultBase.isResult(result)) throw new TypeError(`set parent: ${result} isent a Result class`);
        
        this.#parent = result;
        if(!skipChildAssign) result.setChild(this, true);
        return result;
    }
    /**
     * Clears parent of `this`, dosent check if(type <= currentLogLevel)
     * @param { Boolean } parentAllreadyCleared
     * @return { Boolean }
     */
    clearParent(parentAllreadyCleared = false) {
        if(!this.#parent) {
            console.error(`this: ${this.name} doesn't has a parent`);
            return false;
        }
        if(parentAllreadyCleared && this.#parent.child !== this) {
            // @ts-ignore
            console.error(`this.parent.child: ${this.#parent.child.name} doesn't equal this: ${this.name}`);
            return false;
        }
        if(!parentAllreadyCleared) this.#parent.clearChild(true);
        this.#parent = null;
        return true;
    }

    /**
     * Gets first parent of this result's whole chain, dosent check if(type <= currentLogLevel)
     * @return { ResultBase }
     */
    get firstParent() {
        /**
         * @type { ResultBase }
         */
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
     * @return { ResultBase }
     */
    get lastChild() {
        /**
         * @type { ResultBase }
         */
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
     * @return { ResultBase[]? }
     */
    getAll(mode = 0, toIndex = -1, collapseMultiResults = false, flattenMultiResults = false) {
        // 0 = Get all from first parent to last child
        // 1 = Progress from last child to first parent
        let firstParent = this.firstParent;
        let lastChild = this.lastChild;

        /**
         * @type { ResultBase? }
         */
        let currentResult;
        if(mode === 0) {
            if(!firstParent) return null;
            currentResult = firstParent;
        } else if(mode === 1) {
            if(!lastChild) return null;
            currentResult = lastChild;
        } else {
            return null;
        }
        
        let allResults = [];

        let i = -1;
        /**
         * @type { Function }
         */
        let condition = function() { return (currentResult) } // Default to getting all results
        // @ts-ignore
        if(toIndex > 0) { // Default to getting {toIndex} amount of results
            condition = function() {
                // @ts-ignore
                let resolve = (currentResult && i < toIndex);
                if(currentResult && currentResult.belowCurrentLogLevel) i++;
                return resolve;
            }
        }

        while(condition()) {
            // @ts-ignore
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
                // @ts-ignore
                if(currentResult.belowCurrentLogLevel) allResults.push(currentResult);
            }

            if(mode === 0) {
                // @ts-ignore
                currentResult = currentResult.child;
            } else if(mode === 1) {
                // @ts-ignore
                currentResult = currentResult.parent;
            }

        }
        return allResults;
    }

    /**
     * Prints this properties, dosent check if(type <= currentLogLevel)
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
        // 0 = Progress from current to last child
        // 1 = Progress from current to first parent
        // 2 = Progress from first parent to last child
        // 3 = Progress from last child to first parent
        let firstParent = this.firstParent;
        let lastChild = this.lastChild;

        /**
         * @type { ResultBase? }
         */
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
        /**
         * @type { Function }
         */
        let condition = function() { return (currentResult) } // Default to print as many results
        // @ts-ignore
        if(numToProgress >= 0) { // Switch to printing as {numToProgress}
            condition = function() {
                // @ts-ignore
                let resolve = currentResult && (i < numToProgress)
                if(currentResult) i++;
                return resolve;
            };
        }
        
        while(condition()) {
            // @ts-ignore
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
                // @ts-ignore
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
                // @ts-ignore
                currentResult = currentResult.parent;
            } else {
                // @ts-ignore
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
            // @ts-ignore
            if(numToProgress >= 0) {
                printResult = printMultiArray(ResultBase, printResults, printResult, numToProgress);
            } else {
                printResult = printMultiArray(ResultBase, printResults, printResult);
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

module.exports = { ResultBase };