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

const Special =
{
    ADD: "+",
    SUBTRACT: "-",
    MULTIPLY: "*",
    DIVIDE: "/",
    NEGATE: "+/-",
    PERCENT: "%",
    EQUALS: "=",
    CLEAR: "C",
    DECIMAL: "."
};

const grid = document.querySelector("#grid");
const gridArr = Array.from(grid.querySelectorAll("div"));
const displayText = document.querySelector("#display-text");
const chars = ['C', '+/-', '%', '/', '7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '='];
const maxChars = 17;

let currValue = "0";
let hasDecimal = false;

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
        //temp.addEventListener("click", sayData);
        grid.appendChild(temp);
    }
}

function sayData(e)
{
    console.log(e.target.dataset.char);
}

function operate()
{

}

function setup()
{
    console.log(`${chars.length} buttons to add`);
    addStuffToGrid(chars);
    updateDisplay();
}

function setupButtonListener(button)
{
    switch (button.dataset.char)
    {
        case Special.CLEAR:
            button.addEventListener("click", clearDisplay);
            console.log("isClear");
            break;
        case Special.ADD:
        case Special.SUBTRACT:
        case Special.MULTIPLY:
        case Special.DIVIDE:
        case Special.PERCENT:
        case Special.EQUALS:
        case Special.DECIMAL:
            button.addEventListener("click", decimalEvent);
            console.log("isSomethingElse");
            break;
        case Special.NEGATE:
            button.addEventListener("click", negate);
            console.log("isNegate");
            break;
        default:
            button.addEventListener("click", appendCharToCurrValue);
            console.log("isNumber");
            break;
    }
}

function appendCharToCurrValue(e)
{
    if(currValue.length < maxChars)
    {
        currValue += "" + e.target.dataset.char;
        updateDisplay();
        return true;
    }
    return false;
}

function clearDisplay()
{
    currValue = "0";
    updateDisplay();
}

function updateDisplay()
{
    displayText.textContent = currValue;
}

function negate()
{
    if (currValue.indexOf("-") >= 0)
    {
        currValue = currValue.slice(1);
    }
    else
    {
        currValue = "-" + currValue;
    }
    updateDisplay();
    console.log("pressed negate");
}

function decimalEvent(e)
{
    
}

function resetDecimal()
{
    hasDecimal = false;
}