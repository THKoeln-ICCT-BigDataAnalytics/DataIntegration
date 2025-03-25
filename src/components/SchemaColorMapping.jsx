import * as d3 from "d3";

const colorCache = new Map();

const getColorForSchema = (schema) => {
  if (!schema) return "gray";
  
  // Überprüfen, ob die Farbe bereits im Cache gespeichert ist
  if (colorCache.has(schema)) {
    return colorCache.get(schema);
  }

  let hash = 0;
  for (let i = 0; i < schema.length; i++) {
    hash = ((hash << 5) - hash) + schema.charCodeAt(i);
    hash |= 0;
  }

  const colorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, 500]);
  let color = colorScale((hash & 0x7FFFFFFF) % 500);

  // Farbe im Cache speichern
  colorCache.set(schema, color);

  return color;
};

export default getColorForSchema;
