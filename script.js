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

const grid = document.querySelector("#grid");
const gridArr = Array.from(grid.querySelectorAll("div"));
const textArr = gridArr.map((node) => node.textContent);

let lastNum = parseInt(textArr[textArr.length - 1]);
lastNum = 0;
let nums = [1,2,3,4,5,6,7,8,9];
let chars = ['C','+/-','%','/','7','8','9','*','4','5','6','-','1','2','3','+','0','.','='];
addStuffToGrid(chars);

function addStuffToGrid(things)
{
    for(let i = 0; i < things.length; i++)
    {
        let temp = document.createElement("button");
        temp.textContent = "" + things[i];
        temp.classList.add("grid-item");
        
        //temp.style.borderStyle = "solid";
        //temp.style.borderColor = Color.BLACK.toCssString();
        //temp.style.backgroundColor = Color.randomColor().toCssString();
        grid.appendChild(temp);
    }
}

