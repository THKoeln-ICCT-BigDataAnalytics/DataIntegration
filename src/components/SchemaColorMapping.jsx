import * as d3 from "d3";

// Set, um bereits verwendete Farben zu speichern
const usedColors = new Set();

// Funktion zur Berechnung einer Farbe aus einer Schema-Zeichenfolge
const getColorForSchema = (schema) => {
  if (!schema) {
    console.log("Schema fehlt oder ist ungültig:", schema); // Debug-Ausgabe
    console.log("Eingabe: ", schema, " => Ausgabe: gray (fehlender Wert)"); // Konsolenausgabe bei fehlendem Schema
    return "gray"; // Standardfarbe für fehlende Werte
  }
  
  // Erzeuge eine konsistente Hash-Zahl aus dem String
  let hash = 0;
  for (let i = 0; i < schema.length; i++) {
    hash = ((hash << 5) - hash) + schema.charCodeAt(i);  // Hash-Funktion optimiert
    hash |= 0;  // Sicherstellen, dass der Hash eine 32-Bit-Zahl bleibt
  }

  // Definiere eine Farbskala
  const colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, 500]);

// Initialisiere die Farbe
 let color = colorScale((hash & 0x7FFFFFFF) % 500);

// Falls die Farbe bereits verwendet wurde, wähle eine andere
let attempts = 0;
while (usedColors.has(color) && attempts < 50) {
  hash += 1; // Variiere den Hash-Wert
  color = colorScale(hash % 500); // Berechne die Farbe erneut
  attempts++;
}

if (usedColors.has(color)) {
  console.log("Fehler: Alle Farben sind vergeben. Rückfall auf grau.");
  color = "gray"; // Rückfall auf grau, falls keine eindeutige Farbe gefunden wurde
}

  // Füge die verwendete Farbe dem Set hinzu
  usedColors.add(color);

  // Konsolenausgabe der Berechnung
  console.log("Eingabe: ", schema, " => Hash: ", hash, " => Farbwert: ", color);

  return color;
};

export default getColorForSchema;