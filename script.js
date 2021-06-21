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
    if (typeof a === typeof 2 && typeof b === typeof 2)
    {
        let min = a < b ? a : b;
        let max = min === a ? b : a;
        let range = max - min;
        return Math.random() * range + min;
    }
}

function allSameType()
{
    if (arguments.length > 0)
    {
        let first = arguments[0];
        for (let i = 1; i < arguments.length; i++)
        {
            if (typeof first !== typeof arguments[i])
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
        for (let i = 0; i < keys.length; i++)
        {
            if (this[keys[i]] === val)
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
let prevButtonWasOperator = false;

setup();


function addStuffToGrid(things)
{
    for (let i = 0; i < things.length; i++)
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
    switch (button.dataset.char)
    {
        case Special.CLEAR:
            button.addEventListener("click", clearAndResetEverything);
            break;
        case Special.ADD:
        case Special.SUBTRACT:
        case Special.MULTIPLY:
        case Special.DIVIDE:
            button.addEventListener("click", (e) => setupOperation(e.target.dataset.char));
            break;
        case Special.PERCENT:
            break;
        case Special.EQUALS:
            button.addEventListener("click", () => 
            {
                currVal_text = operate();
                updateDisplay();
            });
            break;
        case Special.DECIMAL:
            button.addEventListener("click", appendDecimal);
            break;
        case Special.NEGATE:
            button.addEventListener("click", negateCurrVal);
            break;
        case Special.DELETE:
            button.addEventListener("click", deleteMostRecentChar);
            break;
        default:
            button.addEventListener("click", (e) => appendCharToCurrValue(e.target.dataset.char));
            break;
    }
}

function appendCharToCurrValue(char)
{
    //after operator has been pressed
    if (Operation.operator !== Special.NIL && prevButtonWasOperator)
    {
        prevButtonWasOperator = false;
        currVal_text = "0";
    }
    if (currVal_text.length < maxChars)
    {
        if (currVal_text === "0" && char !== Special.DECIMAL)
        {
            currVal_text = char;
        }
        else
        {
            currVal_text += char;
        }
        updateDisplay();
    }
}

function clearAndResetEverything()
{
    currVal_text = "0";
    Operation.reset();
    prevButtonWasOperator = false;
    updateDisplay();
}

function updateDisplay()
{
    displayText.textContent = currVal_text;
}

function setupOperation(operator)
{
    if (Special.includesValue(operator))
    {
        prevButtonWasOperator = true;
        if (Number.isNaN(Operation.left))
        {
            Operation.operator = operator;
            Operation.left = parseFloat(currVal_text);
        }
        else
        {
            Operation.right = parseFloat(currVal_text);
            currVal_text = operate();
        }

    }
}

function negateCurrVal()
{
    if (currVal_text.indexOf("-") === 0)
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
    if (!hasDecimal())
    {
        appendCharToCurrValue(Special.DECIMAL);
    }
}

function hasDecimal()
{
    return currVal_text.toString().includes(Special.DECIMAL);
}

function deleteMostRecentChar()
{

}

function add(left, right)
{
    //check for NaN
    if (allSameType(2, left, right) && left === left && right === right)
    {
        return left + right;
    }
    return Number.NaN;
}

function subtract(left, right)
{
    //check for NaN
    if (allSameType(2, left, right) && left === left && right === right)
    {
        return left - right;
    }
    return Number.NaN;
}

function multiply(left, right)
{
    //check for NaN
    if (allSameType(2, left, right) && left === left && right === right)
    {
        return left * right;
    }
    return Number.NaN;
}

function divide(left, right)
{
    //check for NaN
    if (allSameType(2, left, right) && left === left && right === right)
    {
        if (right === 0)
        {
            alert("No, thank you.");
            clearAndResetEverything();
        }
        else
        {
            return left / right;
        }
    }
    return Number.NaN;
}

function operate()
{
    if (Number.isNaN(Operation.right))
    {
        if (Number.isNaN(Operation.left))
        {
            console.log("returned the currVal_text because both operands are NaN");
            return currVal_text;
        }
        else
        {
            if (Operation.operator !== Special.NIL)
            {
                if(prevButtonWasOperator)
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
    let result;
    switch(Operation.operator)
    {
        case Special.ADD:
            result = add(Operation.left, Operation.right).toString();
            break;
    }
    Operation.reset();
    return result;
}