import * as d3 from "d3";

const enableDrag = (nodes, links, labels) => {
  function updatePositions() {
    nodes.attr("cx", d => d.x).attr("cy", d => d.y);
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
      d3.select(event.sourceEvent.target)
        .attr("cx", d.x)
        .attr("cy", d.y);
      
      links.each(function(link) {
        if (link.source === d) {
          d3.select(this)
            .attr("x1", d.x)
            .attr("y1", d.y);
        }
        if (link.target === d) {
          d3.select(this)
            .attr("x2", d.x)
            .attr("y2", d.y);
        }
      });
    })
    .on("end", () => {
      setTimeout(updatePositions, 50);
    });
};

export default enableDrag;
