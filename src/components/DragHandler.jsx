import * as d3 from "d3";

const enableDrag = (nodeGroups, links, labels) => {
  function updatePositions() {
    nodeGroups.attr("transform", d => `translate(${d.x},${d.y})`);
    links.attr("x1", d => d.source.x)
         .attr("y1", d => d.source.y)
         .attr("x2", d => d.target.x)
         .attr("y2", d => d.target.y);
    labels.attr("x", d => d.x + 10).attr("y", d => d.y + 5);
  }

  return d3.drag()
    .on("start", (event, d) => {
      d3.select(event.sourceEvent.target).raise();
    })
    .on("drag", (event, d) => {
      d.x = event.x;
      d.y = event.y;
      
      // Bewege das gesamte Node-Element (egal ob circle oder image)
      d3.select(event.sourceEvent.target.closest(".node"))
        .attr("transform", `translate(${d.x},${d.y})`);

      // Update Links
      links.each(function(link) {
        if (link.source === d) {
          d3.select(this).attr("x1", d.x).attr("y1", d.y);
        }
        if (link.target === d) {
          d3.select(this).attr("x2", d.x).attr("y2", d.y);
        }
      });

      // Update Labels
      labels.each(function(label) {
        if (label === d) {
          d3.select(this).attr("x", d.x + 10).attr("y", d.y + 5);
        }
      });
    })
    .on("end", () => {
      setTimeout(updatePositions, 50);
    });
};

export default enableDrag;
