function allSameType()
{
    if(arguments.length > 0)
    {
        let first = arguments[0];
        for(let i = 1; i < arguments.length; i++)
        {
            if(typeof first !== typeof arguments[i])
            {
                return false;
            }
        }
    }
    return true;
}

const Special =
{
    ADD: "+",
    SUBTRACT: "-",
    MULTIPLY: "*",
    DIVIDE: "/",
    NEGATE: "+/-",
    PERCENT: "%",
    EQUALS: "=",
    CLEAR: "clear",
    DECIMAL: ".",
    DELETE: "delete",
    NIL: "nil"
};

const grid = document.querySelector("#grid");
let gridArr;
const displayText = document.querySelector("#display-text");
const chars =
    [
        Special.CLEAR, Special.NEGATE, Special.PERCENT, Special.DIVIDE,
        '7', '8', '9', Special.MULTIPLY,
        '4', '5', '6', Special.SUBTRACT,
        '1', '2', '3', Special.ADD,
        '0', Special.DECIMAL, Special.EQUALS, Special.DELETE
    ];
const maxChars = 17;

const KeyChars =
{
    "Numpad0": "0",
    "Numpad1": "1",
    "Numpad2": "2",
    "Numpad3": "3",
    "Numpad4": "4",
    "Numpad5": "5",
    "Numpad6": "6",
    "Numpad7": "7",
    "Numpad8": "8",
    "Numpad9": "9",
    "NumpadDecimal": Special.DECIMAL,
    "NumpadDivide": Special.DIVIDE,
    "NumpadMultiply": Special.MULTIPLY,
    "NumpadSubtract": Special.SUBTRACT,
    "NumpadAdd": Special.ADD,
    "NumpadEnter": Special.EQUALS,
    "Backspace": Special.DELETE,
    "Delete": Special.DELETE,
    "Minus": Special.NEGATE,
    "Equal": Special.EQUALS
}

function keyHandler(e)
{
    //remove focus from previously clicked button if one exists
    let element = document.querySelector(":focus");
    if(element)
    {
        element.blur();
    }
    //invoke associated button's click event
    if(KeyChars[e.code])
    {
        let button = gridArr.find((item) => item.dataset.char === KeyChars[e.code]);
        if(button)
        {
            button.dispatchEvent(new Event("click"));
        }
    }
}

const Operation =
{
    operator: Special.NIL,
    left: Number.NaN,
    right: Number.NaN,
    reset: function ()
    {
        this.operator = Special.NIL;
        this.left = Number.NaN;
        this.right = Number.NaN;
    }
};

let currVal_text = "0";
let prevButton = Special.NIL;

setup();
window.addEventListener("keydown", keyHandler);


function addStuffToGrid(charInfo)
{
    for(let i = 0; i < charInfo.length; i++)
    {
        let temp = document.createElement("button");
        temp.textContent = "" + charInfo[i];
        temp.classList.add("grid-item");
        temp.setAttribute("data-char", charInfo[i]);
        if(isInnerButtonChar(charInfo[i]))
        {
            temp.classList.add("inner-button");
        }
        else
        {
            temp.classList.add("outer-button");
        }
        setupButtonListener(temp);
        grid.appendChild(temp);
    }
}

function isInnerButtonChar(char)
{
    let chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', Special.DECIMAL, Special.EQUALS];
    return chars.includes(char);
}

function setup()
{
    addStuffToGrid(chars);
    gridArr = Array.from(grid.children);
    updateDisplay();
}

function setupButtonListener(button)
{
    switch(button.dataset.char)
    {
        case Special.CLEAR:
            button.addEventListener("click", clearAndResetEverything);
            break;
        case Special.ADD:
        case Special.SUBTRACT:
        case Special.MULTIPLY:
        case Special.DIVIDE:
        case Special.PERCENT:
        case Special.EQUALS:
        case Special.DECIMAL:
            button.addEventListener("click", pressTrackedButton);
            break;
        case Special.NEGATE:
            button.addEventListener("click", negateCurrVal);
            break;
        case Special.DELETE:
            button.addEventListener("click", deleteMostRecentChar);
            break;
        default:
            button.addEventListener("click", pressTrackedButton);
            break;
    }
}

function pressTrackedButton(e)
{
    let completed = false;
    switch(e.target.dataset.char)
    {
        case Special.ADD:
        case Special.SUBTRACT:
        case Special.MULTIPLY:
        case Special.DIVIDE:
            completed = setupOperation(e.target.dataset.char);
            break;
        case Special.PERCENT:
            completed = doPercentThing();
            break;
        case Special.EQUALS:
            completed = performOperation();
            break;
        case Special.DECIMAL:
            completed = appendDecimal();
            break;
        default:
            completed = typeDigitOrDecimal(e.target.dataset.char);
            break;
    }
    if(completed)
    {
        prevButton = e.target.dataset.char;
    }
    updateDisplay();
}

function typeDigitOrDecimal(char)
{
    resetCurrValIfOperatorPrevPressed();
    resetEverythingIfEqualsPrevPressed();

    if(currVal_text.length < maxChars)
    {
        if(currVal_text === "0" && char !== Special.DECIMAL)
        {
            currVal_text = char;
        }
        else if(currVal_text === "-0" && char !== Special.DECIMAL)
        {
            currVal_text = "-" + char;
        }
        else
        {
            currVal_text += char;
        }
        updateDisplay();
        return true;
    }
    return false;
}

function clearAndResetEverything()
{
    currVal_text = "0";
    Operation.reset();
    prevButton = Special.NIL;
    updateDisplay();
}

function updateDisplay()
{
    let currAsNum = parseFloat(currVal_text);
    let currWithPrecision = parseFloat(currAsNum.toPrecision(15));
    let currPrecisionString = currWithPrecision.toString();
    let tenTo13th = Math.pow(10, 13);
    let tenToNeg7th = Math.pow(10, -7);
    let tooMuchPrecision = currPrecisionString.length > 13 &&
        (currWithPrecision < 1 && currWithPrecision > tenToNeg7th ||
            currWithPrecision > -1 && currWithPrecision < -tenToNeg7th);

    if(currWithPrecision === 0 || prevButtonIsDigitOrDecimal())
    {
        displayText.textContent = currVal_text;
    }
    else if(tooMuchPrecision)
    {
        displayText.textContent = currWithPrecision.toPrecision(7);
    }
    else if(currWithPrecision >= tenTo13th || currWithPrecision <= -tenTo13th ||
        (currWithPrecision <= tenToNeg7th && currWithPrecision >= -tenToNeg7th))
    {
        displayText.textContent = currWithPrecision.toExponential(5);
    }
    else
    {
        displayText.textContent = currWithPrecision.toString();
    }
}

//operator pressed
function setupOperation(operator)
{
    if(prevButtonIsDigitOrDecimal() && Operation.operator !== Special.NIL)
    {
        Operation.right = parseFloat(currVal_text);
        operate();
        Operation.left = parseFloat(currVal_text);
    }
    if(!leftOperandIsSet())
    {
        Operation.left = parseFloat(currVal_text);
    }
    if(prevButton === Special.EQUALS)
    {
        Operation.left = parseFloat(currVal_text);
    }
    Operation.operator = operator;
    return true;
}

//equals button pressed
function performOperation()
{
    if(Operation.operator !== Special.NIL)
    {
        //if operate was called from a previous button press
        if(prevButtonIsOperator() && rightOperandIsSet() ||
            prevButton === Special.EQUALS)
        {
            Operation.left = parseFloat(currVal_text);
        }

        if(prevButtonIsOperator())
        {
            Operation.right = Operation.left;
        }
        else if(!prevButtonIsOperator() && prevButtonIsDigitOrDecimal())
        {
            Operation.right = parseFloat(currVal_text);
        }
        else if(prevButtonIsPercent())
        {
            Operation.right = parseFloat(currVal_text);
        }
        operate();
        updateDisplay();
        return true;
    }
    updateDisplay();
    return false;
}

function operate()
{
    let endOperation = handleRightSideOrEnd();
    if(endOperation)
    {
        return;
    }

    let result = parseFloat(currVal_text);
    switch(Operation.operator)
    {
        case Special.ADD:
            result = add(Operation.left, Operation.right);
            break;
        case Special.SUBTRACT:
            result = subtract(Operation.left, Operation.right);
            break;
        case Special.MULTIPLY:
            result = multiply(Operation.left, Operation.right);
            break;
        case Special.DIVIDE:
            result = divide(Operation.left, Operation.right);
            break;
    }
    currVal_text = result.toString();
    updateDisplay();
}

function handleRightSideOrEnd()
{
    let endOperation = false;
    if(!rightOperandIsSet())
    {
        if(!leftOperandIsSet())
        {
            endOperation = true;
        }
        else
        {
            if(Operation.operator !== Special.NIL)
            {
                if(prevButtonIsOperator())
                {
                    Operation.right = Operation.left;
                }
                else
                {
                    Operation.right = parseFloat(currVal_text);
                }
            }
        }
    }
    return endOperation;
}

function doPercentThing()
{
    if(prevButtonIsDigitOrDecimal())
    {
        if(leftOperandIsSet() &&
            (Operation.operator === Special.ADD || Operation.operator === Special.SUBTRACT))
        {
            let val = parseFloat(currVal_text);
            let valAsPercentage = val / 100.0;
            let percentOfLeft = Operation.left * valAsPercentage;
            currVal_text = percentOfLeft.toString();
            updateDisplay();
            return true;
        }
        else if(!leftOperandIsSet() ||
            Operation.operator === Special.MULTIPLY || Operation.operator === Special.DIVIDE)
        {
            let currAsPercentage = parseFloat(currVal_text) / 100.0;
            currVal_text = currAsPercentage.toString();
            updateDisplay();
            return true;
        }
    }
    else if(prevButton === Special.EQUALS)
    {
        let currAsPercentage = parseFloat(currVal_text) / 100.0;
        Operation.left = currAsPercentage;
        currVal_text = currAsPercentage.toString();
        updateDisplay();
        return true;
    }
    else if(prevButtonIsOperator())
    {
        if(Operation.operator === Special.ADD || Operation.operator === Special.SUBTRACT)
        {
            let val = Operation.left;
            let valAsPercentage = val / 100.0;
            let percentOfLeft = Operation.left * valAsPercentage;
            currVal_text = percentOfLeft.toString();
            updateDisplay();
            return true;
        }
        else if(Operation.operator === Special.MULTIPLY || Operation.operator === Special.DIVIDE)
        {
            let valAsPercentage = Operation.left / 100.0;
            currVal_text = valAsPercentage.toString();
            updateDisplay();
            return true;
        }
    }
    else if(prevButtonIsPercent())
    {
        let currAsPercentage = parseFloat(currVal_text) / 100.0;
        currVal_text = currAsPercentage.toString();
        updateDisplay();
        return true;
    }
    updateDisplay();
    return false;
}

function isOperator(char)
{
    switch(char)
    {
        case Special.ADD:
        case Special.SUBTRACT:
        case Special.MULTIPLY:
        case Special.DIVIDE:
            return true;
        default:
            return false;
    }
}

function prevButtonIsOperator()
{
    return isOperator(prevButton);
}

function prevButtonIsPercent()
{
    return prevButton === Special.PERCENT;
}

function prevButtonIsDigit()
{
    return prevButton >= '0' && prevButton <= '9';
}

function prevButtonIsDigitOrDecimal()
{
    return prevButtonIsDigit() || prevButton === Special.DECIMAL;
}

function leftOperandIsSet()
{
    return !Number.isNaN(Operation.left);
}

function rightOperandIsSet()
{
    return !Number.isNaN(Operation.right);
}

function resetCurrValIfOperatorPrevPressed()
{
    if(Operation.operator !== Special.NIL && prevButtonIsOperator())
    {
        currVal_text = "0";
    }
}

function resetEverythingIfEqualsPrevPressed()
{
    if(Operation.operator !== Special.NIL && prevButton === Special.EQUALS)
    {
        clearAndResetEverything();
    }
}

function negateCurrVal()
{
    if(currVal_text.indexOf("-") === 0)
    {
        currVal_text = currVal_text.slice(1);
    }
    else
    {
        currVal_text = "-" + currVal_text;
    }
    updateDisplay();
    console.log("pressed negate");
}

function appendDecimal()
{
    if(!hasDecimal())
    {
        return typeDigitOrDecimal(Special.DECIMAL);
    }
    return false;
}

function hasDecimal()
{
    return currVal_text.toString().includes(Special.DECIMAL);
}

function deleteMostRecentChar()
{
    if(prevButtonIsDigitOrDecimal())
    {
        //special case for single-digit negative numbers
        if(currVal_text.length === 2 && currVal_text[0] === "-")
        {
            resetCurrValAndPreviousButton();
        }
        else if(currVal_text.length >= 2)
        {
            currVal_text = currVal_text.substring(0, currVal_text.length - 1);
            prevButton = currVal_text[currVal_text.length - 1];
        }
        else
        {
            resetCurrValAndPreviousButton();
        }
        updateDisplay();
    }
}
function resetCurrValAndPreviousButton()
{
    currVal_text = "0";
    prevButton = Special.NIL;
}

function add(left, right)
{
    //check for NaN
    if(allSameType(2, left, right) && left === left && right === right)
    {
        return Number(left + right);
    }
    return Number.NaN;
}

function subtract(left, right)
{
    //check for NaN
    if(allSameType(2, left, right) && left === left && right === right)
    {
        return left - right;
    }
    return Number.NaN;
}

function multiply(left, right)
{
    //check for NaN
    if(allSameType(2, left, right) && left === left && right === right)
    {
        return left * right;
    }
    return Number.NaN;
}

function divide(left, right)
{
    //check for NaN
    if(allSameType(2, left, right) && left === left && right === right)
    {
        if(right === 0)
        {
            alert("No, thank you.");
            clearAndResetEverything();
            return 0;
        }
        else
        {
            return left / right;
        }
    }
    return Number.NaN;
}