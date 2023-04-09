"use strict";

//#region Setting up ResultBase
const { Result, Results, ResultBase } = require("./classes/result.js");
const logLevelsEnum = ResultBase.logLevelsEnum;
ResultBase.currentLogLevel = logLevelsEnum.INFO;
//#endregion


// if(esMain(import.meta)) { // Checking if module is ran by itself (.mjs)
if (require.main === module) { // Checking if module is ran by itself (.js)
    // ResultJS();


    console.log("Test1+2");
    //                     Name(String)   LogLevelType(EnumItem)     HTTPStatusCode(Number)   action(Number)         Message(String)          value(Any)
    let result = new Result(  "Test"  ,     logLevelsEnum.INFO     ,           200           ,       1       , "Test completed successfully", [0, 1, 7, 3]);

    //                       Name(String)   LogLevelType(EnumItem)     HTTPStatusCode(Number)   action(Number)         Message(String)
    let result2 = new Result(  "Test2"  ,     logLevelsEnum.INFO     ,           400           ,       0       , "Test2 failed: user error");

    result.setChild(result2);
    console.log("\n\nresult.print();");
    result.print();

    console.log("\n\n\n\nresult.printMore();");
    result.printMore();


    console.log("\n\n\n\n\nTest3+4");


    let result4 = new Result("Test4", logLevelsEnum.INFO, 200, 1, "Test4 completed successfully", [0, 1, 7, 3]);

    result4.setParent(new Result("Test3", logLevelsEnum.INFO, 400, 0, "Test3 failed: user error"));

    console.log("\n\nresult4.print();");
    result4.print();

    console.log("\n\n\n\nresult4.printMore();");
    result4.printMore();

    console.log("\n\n\n\nresult4.printMore(2);");
    result4.printMore(2);


    console.log("\n\n\n\n\nTest5+6+7+8");


    let result5 = new Result("Test5", logLevelsEnum.INFO, 204, 1, "Test5 completed successfully")

    result5.setChild(new Results("Test6", 200, 1, [
        new Result("Test7", logLevelsEnum.INFO, 400, 0, "Test7 failed: user error"),
        new Result("Test8", logLevelsEnum.INFO, 200, 1, "Test7 completed successfully", "Returned Text")
    ]));

    console.log("\n\nresult5.print();");
    result5.print();

    console.log("\n\n\n\nresult5.printMore();");
    result5.printMore();


    console.log("\n\n\n\n\nTest9+10+testFunct*3");


    function testFunct(testVar = null) {
        if(testVar === false) return new Result("Test10: testFunct", logLevelsEnum.WARN, 503, 0, "testVar is false");
        if(testVar === null) return new Result("Test10: testFunct", logLevelsEnum.WARN, 500, 0, "testVar is set to an incorrect value");
        return new Result("Test10: testFunct", logLevelsEnum.WARN, 200, 1, "testVar is set to a correct value");
    }

    let result9 = new Result("Test9", logLevelsEnum.INFO, 204, 1, "Test5 completed successfully")

    let testFunctResults = [
        testFunct(),
        testFunct(false)
    ]
    testFunctResults.push(testFunct(true));
    result9.setChild(new Results("Test10", 204, 1, testFunctResults));


    console.log("\n\nresult9.print();");
    result9.print();

    console.log("\n\n\n\nresult9.printMore();");
    result9.printMore();




    console.log("\n\n\n\n\nPractical Example:");

    var numOfDice = 2;
    var total = null;

    function setTotalVar(inputTotal) {
        inputTotal = Number(inputTotal);
        if(isNaN(inputTotal)) return new Result("Main: setTotal", logLevelsEnum.INFO, 400, 0, "Need a number");
        if(inputTotal < numOfDice || inputTotal > numOfDice * 6) return new Result("Main: setTotal", logLevelsEnum.INFO, 400, 0, "Cannot set less than numOfDice or set higher than possible (numOfDice * 6)");
        total = inputTotal;
        return new Result("Main: setTotal", logLevelsEnum.DEBUG, 204, 1, `Set 'total' to ${inputTotal}`);
    }

    function totalVarCallback(totalInput) {
        let result;
        result = setTotalVar(totalInput);

        if(result.action) {
            return result.setParent(new Result("Main - total - totalCallback", logLevelsEnum.DEBUG, 204, 1, "Main totalCallback success"));
        } else {
            return result.setParent(new Result("Main - total - totalCallback", logLevelsEnum.INFO, 400, 0, "Main totalCallback failed - believed to be client error"));
        }
    }

    let resultMain = new Result("Main", logLevelsEnum.INFO, 204, 1, "Main executed successfully");
    resultMain.setChild(totalVarCallback(5));

    ResultBase.currentLogLevel = logLevelsEnum.INFO;
    console.log("\n\n\nResultBase.currentLogLevel = logLevelsEnum.INFO;\nresultMain.printMore();");
    resultMain.printMore();

    ResultBase.currentLogLevel = logLevelsEnum.TRACE;
    console.log("\n\n\nResultBase.currentLogLevel = logLevelsEnum.TRACE;\nresultMain.printMore();");
    resultMain.printMore();
}

function ResultJS() {
    let result1 = new Result("Test1", logLevelsEnum.TRACE, 200, 1, "Executed successfully", [0, 1, 2, 6]);
    let result2 = new Result("Test2", logLevelsEnum.DEBUG, 200, 1, "Executed successfully", [0, 1, 2, 6]);
    let result31 = new Result("Test3.1", logLevelsEnum.WARN, 200, 1, "Executed successfully", [0, 1, 2, 6]);
    let result32 = new Result("Test3.2", logLevelsEnum.INFO, 200, 1, "Executed successfully", [0, 1, 2, 6]);
    let result331 = new Result("Test3.3.1", logLevelsEnum.WARN, 200, 1, "Executed successfully", [0, 1, 2, 6]);
    let result332 = new Result("Test3.3.2", logLevelsEnum.INFO, 200, 1, "Executed successfully", [0, 1, 2, 6]);
    let result33 = new Results("Test3.3", 200, 1, [
        result331,
        result332
    ]);
    let results3 = new Results("Test3", 200, 1, [
        result31,
        result32,
        result33
    ]);
    let result4 = new Result("Test4", logLevelsEnum.ERROR, 200, 1, "Executed successfully", [0, 1, 2, 6]);
    let result5 = new Result("Test5", logLevelsEnum.FATAL, 200, 1, "Executed successfully", [0, 1, 2, 6]);

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
        if (Result.globalEventHandler) {
            Result.globalEventHandler.on("print", printString => {
                console.log(`globalEventHandler print: ${printString}`);
            });
        }

        console.log(result1.print());

        result1.localEventHandler = new EventEmitter();
        // result1.localEventHandler = "hi";
        if (result1.localEventHandler) {
            result1.localEventHandler.on("print", printString => {
                console.log(`localEventHandler print: ${printString}`);
            });
        }

        console.log(result1.print());

        if (Result.globalEventHandler) {
            console.log(`\nResult.globalEventHandler: ${Result.globalEventHandler}`);
            if (Result.globalEventHandler._events)
                console.log(`${Result.globalEventHandler._events.print.toString()}\n`);
        }
        if (ResultBase.globalEventHandler) {
            console.log(`\nResultBase.globalEventHandler: ${ResultBase.globalEventHandler}`);
            if (ResultBase.globalEventHandler._events)
                console.log(`${ResultBase.globalEventHandler._events.print.toString()}\n`);
        }
        if (result1.localEventHandler) {
            console.log(`\nresult1.localEventHandler: ${result1.localEventHandler}`);
            if (result1.localEventHandler._events)
                console.log(`${result1.localEventHandler._events.print.toString()}\n`);
        }
    };
    //#endregion

    //#region Log resultChilds
    function logResultChilds() {
        console.log(result1Child);
        console.log(result2Child);
        console.log(result3Child);
        console.log(result4Child);
    };
    //#endregion

    //#region Testing {.print} and {.printMore} functions
    // 0 = Progress from current to last child
    // 1 = Progress from current to first parent
    // 2 = Progress from first parent to last child
    // 3 = Progress from last child to first parent
    function logPrintNMore() {
        console.log("\n\n\nresult1.print();");
        console.log(result1.print()); // TRACE

        console.log("\n\nresult1.printMore();");
        console.log(result1.printMore()); // TRACE

        console.log("\n\nresult1.printMore(1);");
        console.log(result1.printMore(1)); // TRACE

        console.log("\n\nresult4.printMore(1);");
        console.log(result4.printMore(1)); // ERROR

        console.log("\n\nresults3.printMore(2);");
        console.log(results3.printMore(2)); // WARN

        console.log("\n\nresults3.printMore(3);");
        console.log(results3.printMore(3)); // WARN // TODO: allow Results results to be reversed.

        console.log("\n\nresults3.printMore(3, 0);");
        console.log(results3.printMore(3, 0)); // WARN

        console.log("\n\nresult2.printMore(3, 2);");
        console.log(result2.printMore(3, 2)); // DEBUG

        console.log("\n\nresults3.printMore(0, 0);");
        console.log(results3.printMore(0, 0)); // WARN

        console.log("\n\nresult2.printMore(0, 2);");
        console.log(result2.printMore(0, 2)); // DEBUG

        console.log("\n\nresult2.printMore(0, 3);");
        console.log(result2.printMore(0, 3)); // DEBUG

        console.log("\n\nresult2.printMore(0, 5);");
        console.log(result2.printMore(0, 5)); // DEBUG
    };
    //#endregion

    //#region Testing {.getAll} function
    // 0 = Get all from first parent to last child
    // 1 = Progress from last child to first parent
    function logGetAll() {
        console.log("\n\nresult1.getAll()");
        console.log(result1.getAll());

        console.log("\n\nresult1.getAll(0 , -1, true)");
        console.log(result1.getAll(0, -1, true));

        console.log("\n\nresult1.getAll(1)");
        console.log(result1.getAll(1));

        console.log("\n\nresult1.getAll(0, 2)");
        console.log(result1.getAll(0, 2));

        console.log("\n\nresult1.getAll(1, 2)");
        console.log(result1.getAll(1, 2));
    };
    //#endregion

    //#region Testing detecting if array of ResultBase classes are valid
    function logDections() {
        class test {
            test() {
                console.log("hi");
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
            console.log(new Results("Test1", 200, 1, [new Results("Test4", 200, 1, [new Results("Test5", 200, 1, [new Result("Test6", logLevelsEnum.INFO, 200, 0, "Executed successfully", [0, 1, 2, 6])])])]));
        } catch (error) {
            console.error(error);
        }
        try {
            console.log("\nShould NOT Error");
            console.log(new Results("Test2", 200, 1, [new Result("Test3", logLevelsEnum.INFO, 200, 0, "Executed successfully", [0, 1, 2, 6])]));
        } catch (error) {
            console.error(error);
        }

        try {
            console.log("\nShould Error");
            console.log(new Result("Test6", 20, 200, 0, "Executed successfully", [0, 1, 2, 6])); // This errors
        } catch (error) {
            console.error(error);
        }
        try {
            console.log("\nShould NOT Error");
            console.log(new Result("Test6", logLevelsEnum.INFO, 200, 0, "Executed successfully", [0, 1, 2, 6]));
        } catch (error) {
            console.error(error);
        }
    };
    //#endregion



    // logEventHandler();
    // logResultChilds();
    // logPrintNMore();
    // logGetAll();
    // logDections();
}
