class Color
{
    static BLACK = new Color(0, 0, 0, 1);
    static WHITE = new Color(255, 255, 255, 1);
    static GRAY = new Color(127, 127, 127, 1);
    static LIGHT_GRAY = new Color(230, 230, 230, 1);
    static RED = new Color(255, 0, 0, 1);
    static GREEN = new Color(0, 200, 0, 1);

    constructor(red, green, blue, alpha = 1)
    {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }

    toCssString()
    {
        return `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
    }

    static randomColor(alpha = 1)
    {
        return new Color(randomRangeExclusive(256), randomRangeExclusive(256), randomRangeExclusive(256), alpha);
    }

}
function randomRangeExclusive(a, b = 0)
{
    if(typeof a === typeof 2 && typeof b === typeof 2)
    {
        let min = a < b ? a : b;
        let max = min === a ? b : a;
        let range = max - min;
        return Math.random() * range + min;
    }
}

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
    NIL: "nil",
    includesValue: function (val)
    {
        let keys = Object.keys(this);
        for(let i = 0; i < keys.length; i++)
        {
            if(this[keys[i]] === val)
            {
                return true;
            }
        }
        return false;
    }
};

const grid = document.querySelector("#grid");
const gridArr = Array.from(grid.querySelectorAll("div"));
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


function addStuffToGrid(things)
{
    for(let i = 0; i < things.length; i++)
    {
        let temp = document.createElement("button");
        console.log(i);
        temp.textContent = "" + things[i];
        temp.classList.add("grid-item");
        temp.setAttribute("data-char", things[i])
        setupButtonListener(temp);
        grid.appendChild(temp);
    }
}



function setup()
{
    //console.log(`${chars.length} buttons to add`);
    addStuffToGrid(chars);
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
            button.addEventListener("click", trackedButtonPress);
            break;
        case Special.NEGATE:
            button.addEventListener("click", negateCurrVal);
            break;
        case Special.DELETE:
            button.addEventListener("click", deleteMostRecentChar);
            break;
        default:
            button.addEventListener("click", trackedButtonPress);
            break;
    }
}

function trackedButtonPress(e)
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
    displayText.textContent = currVal_text;
}

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
        //just after operate is called elsewhere
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
        operate();
        updateDisplay();
        return true;
    }
    updateDisplay();
    return false;
}

//make this part of Operation obj?
function operate()
{
    if(!rightOperandIsSet())
    {
        if(!leftOperandIsSet())
        {
            //set left?
            console.log("returned the currVal_text because both operands are NaN");
            return currVal_text;
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
        }
        else if(!leftOperandIsSet() || 
            Operation.operator === Special.MULTIPLY || Operation.operator === Special.DIVIDE)
        {
            let currAsPercentage = parseFloat(currVal_text) / 100.0;
            currVal_text = currAsPercentage.toString();
        }
    }
    else if(prevButton === Special.EQUALS)
    {
        let currAsPercentage = parseFloat(currVal_text) / 100.0;
        Operation.left = currAsPercentage;
        currVal_text = currAsPercentage.toString();
    }
    updateDisplay();
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