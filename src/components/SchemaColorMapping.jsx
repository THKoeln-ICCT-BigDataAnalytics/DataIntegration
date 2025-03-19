import * as d3 from "d3";

// Funktion zur Berechnung einer Farbe aus einer Schema-Zeichenfolge
const getColorForSchema = (schema) => {
  if (!schema) {
    console.log("Eingabe: ", schema, " => Ausgabe: gray (fehlender Wert)"); // Konsolenausgabe bei fehlendem Schema
    return "gray"; // Standardfarbe für fehlende Werte
  }
  
  // Erzeuge eine konsistente Hash-Zahl aus dem String
  let hash = 0;
  for (let i = 0; i < schema.length; i++) {
    hash = schema.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Berechne die Farbe
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  const color = colorScale(hash % 10);

  // Konsolenausgabe der Berechnung
  console.log("Eingabe: ", schema, " => Hash: ", hash, " => Farbwert: ", color);

  return color;
};

export default getColorForSchema;