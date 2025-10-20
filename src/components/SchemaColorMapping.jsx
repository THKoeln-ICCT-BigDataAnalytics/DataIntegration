import * as d3 from "d3";

// State to track the next index for randomColors
// Using 'let' so it can be updated across function calls
let colorIndex = 0;

// Existing cache and fixed colors remain outside the function
const colorCache = new Map();

// Feste Farben für bekannte Schemas
const fixedColors = new Map([
    ["OC_ORACLE", "rgb(255, 215, 0)"],  
    ["OC_MYSQL", "rgb(255, 87, 51)"],    
    ["OC_SAP", "rgb(75, 181, 67)"],   
    ["FORMULA", "rgb(0, 123, 255)"],     
]);


const availableColors = [
    "rgb(255, 215, 0)", // Yellow 
    "rgb(255, 87, 51)",  // Orange/Red 
    "rgb(75, 181, 67)",  // Green
    "rgb(0, 123, 255)",  // Blue 
    "rgba(255, 0, 247, 1)", // Pink/Magenta
    "rgba(0, 247, 255, 1)", // Cyan
    "rgba(255, 140, 0, 1)", // Dark Orange
    "rgba(141, 18, 40, 1)", // Dark Red/Maroon
];

const getColorForSchema = (schema) => {
    if (!schema) return "gray";

    // 1. Check for fixed color
    if (fixedColors.has(schema)) {
        const color = fixedColors.get(schema);
        return color;
    }

    // 2. Check cache for unknown schemas
    if (colorCache.has(schema)) {
        return colorCache.get(schema);
    }

    // 3. Assign and cache a new color using the iterator
    const color = availableColors[colorIndex % availableColors.length];
    
    // Update the iterator for the next assignment
    // Use modulo operator (%) to cycle through the availableColors array
    colorIndex = (colorIndex + 1) % availableColors.length;

    colorCache.set(schema, color);

    return color;
};

export default getColorForSchema;