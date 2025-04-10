import * as d3 from "d3";

const colorCache = new Map();

// Feste Farben für bekannte Schemas
const fixedColors = new Map([
  ["OC-ORACLE", "rgb(0, 123, 255)"],  // Blau
  ["OC-MYSQL", "rgb(255, 87, 51)"],   // Orange/Rot
  ["OC-SAP", "rgb(255, 215, 0)"],     // Gelb
  ["FORMULA", "rgb(75, 181, 67)"],    // Grün
]);

const getColorForSchema = (schema) => {
  if (!schema) return "gray";

  // Prüfe, ob eine feste Farbe existiert
  if (fixedColors.has(schema)) {
    const color = fixedColors.get(schema);
    console.log("Eingabe: ", schema, " => Feste Farbe: ", color);
    return color;
  }

  // Fallback: Hash-Methode für unbekannte Schemas
  if (colorCache.has(schema)) {
    return colorCache.get(schema);
  }

  let hash = 0;
  for (let i = 0; i < schema.length; i++) {
    hash = ((hash << 5) - hash) + schema.charCodeAt(i);
    hash |= 0;
  }
  hash = hash * 31; // Verstärkt die Unterschiede

  const colorScale = d3.scaleSequential(d3.interpolateTurbo).domain([0, 1000]); //interpolateTurbo bietet eine bessere Streuung und weniger Dominanz einzelner Farbtöne wie Grün
  let color = colorScale((hash & 0x7FFFFFFF) % 1000);

  colorCache.set(schema, color);
  console.log("Eingabe: ", schema, " => Hash: ", hash, " => Farbwert: ", color);
  return color;
};

export default getColorForSchema;