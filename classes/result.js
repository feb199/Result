'use strict';

//#region Defining Libraries
// const Enum = require("./enum.js");
const EventEmitter = require("events");
const { checkMultiResults, printMultiArray } = require("../utils/resultUtils.js");
const ResultBase = require("./resultBase.js");
const logLevelsEnum = ResultBase.logLevelsEnum;
//#endregion


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

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
 * @property { Array<ResultBase> } results - An array of Result.
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
    * results - The HTTP Status Code.
    * @type { Array<ResultBase> }
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

    get results() { return this.#results; }

    async print(skipResults = false) {
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
                            await sleep(10000);
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
                    printResult = printMultiArray(printResults, printResult);
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



// if(esMain(import.meta)) { // Checking if module is ran by itself (.mjs)
if (require.main === module) { // Checking if module is ran by itself (.js)
    let result1 = new Result("Test1", logLevelsEnum.TRACE, 200, 1, "Executed successfully", [ 0, 1, 2, 6 ]);
    let result2 = new Result("Test2", logLevelsEnum.DEBUG, 200, 1, "Executed successfully", [ 0, 1, 2, 6 ]);
    let result31 = new Result("Test3.1", logLevelsEnum.WARN, 200, 1, "Executed successfully", [ 0, 1, 2, 6 ]);
    let result32 = new Result("Test3.2", logLevelsEnum.INFO, 200, 1, "Executed successfully", [ 0, 1, 2, 6 ]);
    let result331 = new Result("Test3.3.1", logLevelsEnum.WARN, 200, 1, "Executed successfully", [ 0, 1, 2, 6 ]);
    let result332 = new Result("Test3.3.2", logLevelsEnum.INFO, 200, 1, "Executed successfully", [ 0, 1, 2, 6 ]);
    let result33 = new Results("Test3.3", 200, 1,  [
        result331,
        result332
    ]);
    let results3 = new Results("Test3", 200, 1,  [
        result31,
        result32,
        result33
    ]);
    let result4 = new Result("Test4", logLevelsEnum.ERROR, 200, 1, "Executed successfully", [ 0, 1, 2, 6 ]);
    let result5 = new Result("Test5", logLevelsEnum.FATAL, 200, 1, "Executed successfully", [ 0, 1, 2, 6 ]);

    let result1Child = result1.setChild(result2);
    let result2Child = result2.setChild(results3);
    let result3Child = results3.setChild(result4);
    let result4Child = result4.setChild(result5);

    ResultBase.currentLogLevel = logLevelsEnum.INFO;



    //#region Event handlers
    function logEventHandler() {
        console.log(result1.print());

        Result.globalEventHandler = new EventEmitter();
        // Result.globalEventHandler = "hi";
        if(Result.globalEventHandler) {
            Result.globalEventHandler.on("print", printString => {
                console.log(`globalEventHandler print: ${printString}`);
            });
        }

        console.log(result1.print());

        result1.localEventHandler = new EventEmitter();
        // result1.localEventHandler = "hi";
        if(result1.localEventHandler) {
            result1.localEventHandler.on("print", printString => {
                console.log(`localEventHandler print: ${printString}`);
            });
        }

        console.log(result1.print());

        if(Result.globalEventHandler) {
            console.log(`\nResult.globalEventHandler: ${Result.globalEventHandler}`);
            if(Result.globalEventHandler._events) console.log(`${Result.globalEventHandler._events.print.toString()}\n`);
        }
        if(ResultBase.globalEventHandler) {
            console.log(`\nResultBase.globalEventHandler: ${ResultBase.globalEventHandler}`);
            if(ResultBase.globalEventHandler._events) console.log(`${ResultBase.globalEventHandler._events.print.toString()}\n`);
        }
        if(result1.localEventHandler) {
            console.log(`\nresult1.localEventHandler: ${result1.localEventHandler}`);
            if(result1.localEventHandler._events) console.log(`${result1.localEventHandler._events.print.toString()}\n`);
        }
    };
    // logEventHandler();
    //#endregion


    //#region Log resultChilds
    function logResultChilds() {
        console.log(result1Child);
        console.log(result2Child);
        console.log(result3Child);
        console.log(result4Child);
    };
    // logResultChilds();
    //#endregion


    //#region Testing {.print} and {.printMore} functions
    // 0 = Progress from current to last child
    // 1 = Progress from current to first parent
    // 2 = Progress from first parent to last child
    // 3 = Progress from last child to first parent
    function logPrintNMore() {
        console.log("\n\n\nresult1.print();")
        console.log(result1.print()); // TRACE

        console.log("\n\nresult1.printMore();")
        console.log(result1.printMore()); // TRACE

        console.log("\n\nresult1.printMore(1);")
        console.log(result1.printMore(1)); // TRACE

        console.log("\n\nresult4.printMore(1);")
        console.log(result4.printMore(1)); // ERROR

        console.log("\n\nresults3.printMore(2);")
        console.log(results3.printMore(2)); // WARN

        console.log("\n\nresults3.printMore(3);")
        console.log(results3.printMore(3)); // WARN // TODO: allow Results results to be reversed.

        console.log("\n\nresults3.printMore(3, 0);")
        console.log(results3.printMore(3, 0)); // WARN

        console.log("\n\nresult2.printMore(3, 2);")
        console.log(result2.printMore(3, 2)); // DEBUG

        console.log("\n\nresults3.printMore(0, 0);")
        console.log(results3.printMore(0, 0)); // WARN

        console.log("\n\nresult2.printMore(0, 2);")
        console.log(result2.printMore(0, 2)); // DEBUG

        console.log("\n\nresult2.printMore(0, 3);")
        console.log(result2.printMore(0, 3)); // DEBUG

        console.log("\n\nresult2.printMore(0, 5);")
        console.log(result2.printMore(0, 5)); // DEBUG
    };
    // logPrintNMore();
    //#endregion


    //#region Testing {.getAll} function
    // 0 = Get all from first parent to last child
    // 1 = Progress from last child to first parent
    function logGetAll() {
        console.log("\n\nresult1.getAll()")
        console.log(result1.getAll());

        console.log("\n\nresult1.getAll(0 , -1, true)")
        console.log(result1.getAll(0 , -1, true));

        console.log("\n\nresult1.getAll(1)")
        console.log(result1.getAll(1));

        console.log("\n\nresult1.getAll(0, 2)")
        console.log(result1.getAll(0, 2));

        console.log("\n\nresult1.getAll(1, 2)")
        console.log(result1.getAll(1, 2));
    };
    // logGetAll();
    //#endregion


    //#region Testing detecting if array of ResultBase classes are valid
    function logDections() {
        class test {
            test() {
                console.log("hi")
            }
        }
        try {
            console.log("\nShould Error");
            console.log(new Results("Test1", 200, 1, new test())); // This errors
        } catch (error) {
            console.error(error);
        }
        try {
            console.log("\nShould Error");
            console.log(new Results("Test1", 200, 1, [new test()])); // This errors
        } catch (error) {
            console.error(error);
        }
        try {
            console.log("\nShould Error");
            console.log(new Results("Test1", 200, 1, [new Results("Test4", 200, 1, [1])])); // This errors
        } catch (error) {
            console.error(error);
        }
        try {
            console.log("\nShould Error");
            console.log(new Results("Test1", 200, 1, ["hi"])); // This errors
        } catch (error) {
            console.error(error);
        }
        try {
            console.log("\nShould Error");
            console.log(new Results("Test1", 200, 1, 1)); // This errors
        } catch (error) {
            console.error(error);
        }
        try {
            console.log("\nShould NOT Error");
            console.log(new Results("Test1", 200, 1, [new Results("Test4", 200, 1, [new Results("Test5", 200, 1, [new Result("Test6", logLevelsEnum.INFO, 200, 0, "Executed successfully", [ 0, 1, 2, 6 ])])])]));
        } catch (error) {
            console.error(error);
        }
        try {
            console.log("\nShould NOT Error");
            console.log(new Results("Test2", 200, 1, [new Result("Test3", logLevelsEnum.INFO, 200, 0, "Executed successfully", [ 0, 1, 2, 6 ])]));
        } catch (error) {
            console.error(error);
        }

        try {
            console.log("\nShould Error");
            console.log(new Result("Test6", 20, 200, 0, "Executed successfully", [ 0, 1, 2, 6 ])); // This errors
        } catch (error) {
            console.error(error);
        }
        try {
            console.log("\nShould NOT Error");
            console.log(new Result("Test6", logLevelsEnum.INFO, 200, 0, "Executed successfully", [ 0, 1, 2, 6 ]));
        } catch (error) {
            console.error(error);
        }
        
    };
    // logDections();
    //#endregion
}