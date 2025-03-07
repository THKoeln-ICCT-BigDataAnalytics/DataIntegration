import * as d3 from "d3";

export function enableNodeDragging(selection) {
  selection.call(
    d3.drag()
      .on("start", (event, d) => {
        d3.select(event.sourceEvent.target).raise().attr("stroke", "black"); // Hebt das Element hervor
      })
      .on("drag", (event, d) => {
        d.x = event.x; // X-Koordinate des Drag-Elements
        d.y = event.y; // Y-Koordinate des Drag-Elements
        d3.select(event.sourceEvent.target)
          .attr("cx", d.x) // Bewegt das Element entlang der X-Achse
          .attr("cy", d.y); // Bewegt das Element entlang der Y-Achse
      })
      .on("end", (event, d) => {
        d3.select(event.sourceEvent.target).attr("stroke", null); // Entfernt das Highlight nach dem Dragging
      })
  );
}
