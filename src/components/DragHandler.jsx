import * as d3 from "d3";

const enableDrag = (nodeGroups, links, labels, correlationLinks) => {
  // Funktion, um alle Positionen zu aktualisieren
  function updatePositions() {
    nodeGroups.attr("transform", d => `translate(${d.x},${d.y})`);
    links.attr("x1", d => d.source.x)
         .attr("y1", d => d.source.y)
         .attr("x2", d => d.target.x)
         .attr("y2", d => d.target.y);
    labels.attr("x", d => d.x + 10).attr("y", d => d.y + 5);

    // Korrelation-Linien updaten, falls vorhanden
    if (correlationLinks) {
      d3.select(correlationLinks).selectAll("line").each(function(link) {
        d3.select(this)
          .attr("x1", link.source.x)
          .attr("y1", link.source.y)
          .attr("x2", link.target.x)
          .attr("y2", link.target.y);
      });
    }
  }

  return d3.drag()
    .on("start", (event, d) => {
      // Node nach vorne bringen beim Drag
      d3.select(event.sourceEvent.target).raise();
    })
    .on("drag", (event, d) => {
      const dx = event.x - d.x;
      const dy = event.y - d.y;

      // Node-Koordinaten aktualisieren
      d.x = event.x;
      d.y = event.y;

      // Bewege das aktuelle Node
      d3.select(event.sourceEvent.target.closest(".node"))
        .attr("transform", `translate(${d.x},${d.y})`);

      // Falls es eine Tabelle ist, bewege ihre Leaves mit
      if (d.data.type === "table" && d.children) {
        d.children.forEach(child => {
          child.x += dx;
          child.y += dy;

          d3.select(`[data-id='${child.data.id}']`)
            .attr("transform", `translate(${child.x},${child.y})`);
        });
      }

      // Update Links
      links.each(function(link) {
        if (link.source === d || (d.data.type === "table" && d.children?.includes(link.source))) {
          d3.select(this).attr("x1", link.source.x).attr("y1", link.source.y);
        }
        if (link.target === d || (d.data.type === "table" && d.children?.includes(link.target))) {
          d3.select(this).attr("x2", link.target.x).attr("y2", link.target.y);
        }
      });

      // Update Labels
      labels.each(function(label) {
        if (label === d || (d.data.type === "table" && d.children?.includes(label))) {
          d3.select(this).attr("x", label.x + 10).attr("y", label.y + 5);
        }
      });

      // Update der Korrelation-Linien für alle verschobenen Nodes
      if (correlationLinks) {
        d3.select(correlationLinks).selectAll("line").each(function(link) {
          d3.select(this)
          .attr("x1", link.source.x)
          .attr("y1", link.source.y)
          .attr("x2", link.target.x)
          .attr("y2", link.target.y);
        });
      }
    })
    .on("end", () => {
      setTimeout(updatePositions, 50);
    });
  };
  export default enableDrag;
