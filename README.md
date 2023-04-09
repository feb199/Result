# Result
Used to store log results of functions/methods and also to executes actions depending on result of functions/methods.

Verified works on Windows.

# Install
#### `npm i @feb199/result --save`

## Setup
```js
//#region Setting up ResultBase
const { Result, Results, ResultBase } = require("@feb199/result");
const logLevelsEnum = ResultBase.logLevelsEnum;
ResultBase.currentLogLevel = logLevelsEnum.INFO;
//#endregion

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
```

# Examples

<details><summary>Example 1</summary>

```js
console.log("\n\n\n\n\nTest3+4");


let result4 = new Result("Test4", logLevelsEnum.INFO, 200, 1, "Test4 completed successfully", [0, 1, 7, 3]);

result4.setParent(new Result("Test3", logLevelsEnum.INFO, 400, 0, "Test3 failed: user error"));

console.log("\n\nresult4.print();");
result4.print();

console.log("\n\n\n\nresult4.printMore();");
result4.printMore();

console.log("\n\n\n\nresult4.printMore(2);");
result4.printMore(2);
```
</details>

<details><summary>Example 2</summary>

```js
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
```
</details>

<details><summary>Example 3</summary>

```js
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
```
</details>

<details><summary>Practical Example</summary>

```js
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
```
</details>

# Documentation

## `isResult(ResultBase)` 

Checks if provided result in an instance of ResultBase, dosent check if(type <= currentLogLevel)

Takes `result` param which can be your own custom ResultBase instance or `ResultBase`.
Param `result` = `ResultBase`
Returns `Boolean`

## `.child, setChild(), clearChild()`

`.child` Gets child of this result, dosent check if(type <= currentLogLevel)
Returns `ResultBase`

`.setChild(result, skipParentAssign?)` Sets child of `this` to param `result`, dosent check if(type <= currentLogLevel)
Param `result` = `ResultBase`
Param `skipParentAssign` = `Boolean?`
Returns `ResultBase`

`.clearChild(childAllreadyCleared?)` Clears child of `this`, dosent check if(type <= currentLogLevel)
Param `childAllreadyCleared` = `Boolean?`
Returns `Boolean`

## `.parent, setParent(), clearParent()`

`.parent` Gets parent of this result, dosent check if(type <= currentLogLevel)
Returns `ResultBase`

`.setParent(result, skipChildAssign?)` Sets parent of `this` to param `result`, dosent check if(type <= currentLogLevel)
Param `result` = `ResultBase`
Param `skipChildAssign` = `Boolean?`
Returns `ResultBase`

`.clearParent(parentAllreadyCleared?)` Clears parent of `this`, dosent check if(type <= currentLogLevel)
Param `parentAllreadyCleared` = `Boolean?`
Returns `Boolean`

#### WIP