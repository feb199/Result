# Result
Used to store log results of functions/methods and also to executes actions depending on result of functions/methods.

Verified works on Windows.

# Install
## `npm i @feb199/result --save`

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

<details><summary>ResultBase</summary>

## `.name, .type, .code, .action` Variable

Name of `this`<br>
`.name` (Variable)<br>
Type `String`

Type of `this`<br>
`.type` (Variable)<br>
Type `EnumItem`

Code of `this`<br>
`.code` (Variable)<br>
Type `Number`

Action of `this`<br>
`.action` (Variable)<br>
Type `Number`
<br><br><br>

## `.currentLogLevel, .logLevelsEnum` Static Variable

`(ResultBase)` = `ResultBase` or `Result` or `Results

(Static Variable) currentLogLevel of `ResultBase`<br>
`(ResultBase).currentLogLevel`<br>
Type `EnumItem`

(Static Variable) logLevelsEnum of `ResultBase`<br>
`(ResultBase).logLevelsEnum`<br>
Type `Enum`
<br><br><br>

## `isResult()` Method

Checks if provided result in an instance of ResultBase, dosent check if(type <= currentLogLevel)<br>
`isResult(result)` (Method)<br>
Param `result` = `ResultBase`<br>
Returns `Boolean`
<br><br><br>

## `.child, setChild(), clearChild()` (Getter, Method, Method)

Gets child of this result, dosent check if(type <= currentLogLevel)<br>
`.child` (Getter)<br>
Returns `ResultBase`

Sets child of `this` to param `result`, dosent check if(type <= currentLogLevel)<br>
`.setChild(result, skipParentAssign?)` (Method)<br>
Param `result` = `ResultBase`<br>
Param `skipParentAssign` = `Boolean?`<br>
Returns `ResultBase`

Clears child of `this`, dosent check if(type <= currentLogLevel)<br>
`.clearChild(childAllreadyCleared?)` (Method)<br>
Param `childAllreadyCleared` = `Boolean?`<br>
Returns `Boolean`
<br><br><br>

## `.parent, setParent(), clearParent()` (Getter, Method, Method)

Gets parent of this result, dosent check if(type <= currentLogLevel)<br>
`.parent` (Getter)<br>
Returns `ResultBase`

Sets parent of `this` to param `result`, dosent check if(type <= currentLogLevel)<br>
`.setParent(result, skipChildAssign?)` (Method)<br>
Param `result` = `ResultBase`<br>
Param `skipChildAssign` = `Boolean?`<br>
Returns `ResultBase`

Clears parent of `this`, dosent check if(type <= currentLogLevel)<br>
`.clearParent(parentAllreadyCleared?)` (Method)<br>
Param `parentAllreadyCleared` = `Boolean?`<br>
Returns `Boolean`
<br><br><br>

## `.firstParent, .lastChild` Getter

Gets first parent of this result's whole chain, dosent check if(type <= currentLogLevel)<br>
`.firstParent` (Getter)<br>
Returns `ResultBase`

Gets last child of this result's whole chain, dosent check if(type <= currentLogLevel)<br>
`.lastChild` (Getter)<br>
Returns `ResultBase`
<br><br><br>

## `.getAll()` Method

Gets a custom amount of results(type <= currentLogLevel)<br>
`.getAll(mode?, toIndex?, collapseMultiResults?, flattenMultiResults?)` (Method)<br>
Param `mode` = `Number?` - `0` = Get all from first parent to last child, `1` = Progress from last child to first parent.<br>
Param `toIndex` = `Number?`<br>
Param `collapseMultiResults` = `Boolean?`<br>
Param `flattenMultiResults` = `Boolean?`<br>
Returns `ResultBase`
<br><br><br>

## `.print(), .printMore()` Method

Prints this properties, dosent check if(type <= currentLogLevel)<br>
`.print(onlyName?)` (Method)<br>
Param `onlyName` = `String?`<br>
Returns `Boolean`

Print all results(type <= currentLogLevel)<br>
`.printMore(mode?, numToProgress?, collapseMultiResults?)` (Method)<br>
Param `mode` = `Number?` - `0` = Progress from current to last child, `1` = Progress from current to first parent, `2` = Progress from first parent to last child, `3` = Progress from last child to first parent.<br>
Param `numToProgress` = `Number?`<br>
Param `collapseMultiResults` = `Boolean?`<br>
Returns `Boolean`
<br><br><br>

## `.belowCurrentLogLevel()` Method

Checks whether or not (this.type is <= ResultBase.currentLogLevel)<br>
`.belowCurrentLogLevel()` (Method)<br>
Returns `Boolean`
<br><br><br>

## `.localEventHandler, .globalEventHandler` ((Setter, Getter), (Setter, Getter))

Get the eventEmmitter that handles events.<br>
(Emits: print(String), clear()), localEventHandler overrides static globalEventHandler.<br>
`.localEventHandler()` (Getter)<br>
Returns `EventEmitter?`

Set the eventEmmitter that handles events.<br>
(Emits: print(String), clear()), localEventHandler overrides static globalEventHandler.<br>
`.localEventHandler(EventHandler)` (Setter)<br>
Param `EventHandler` = `EventEmitter`<br>
Returns `Boolean`

<br>

Get the eventEmmitter that handles events.<br>
(Emits: print(String), clear()).<br>
`.globalEventHandler()` (Getter)<br>
Returns `EventEmitter?`

Set the eventEmmitter that handles events.<br>
(Emits: print(String), clear()).<br>
`.globalEventHandler(EventHandler)` (Setter)<br>
Param `EventHandler` = `EventEmitter`<br>
Returns `Boolean`
</details>


#### WIP