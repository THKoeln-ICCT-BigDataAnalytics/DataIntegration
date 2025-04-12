//ungenutzte Klasse

import * as d3 from "d3";

const enableDrag = () => {
  function dragStarted(event, d) {
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
    d3.select(this)
      .attr("cx", d.fx)
      .attr("cy", d.fy);
  }

  function dragEnded(event, d) {
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on("start", dragStarted)
    .on("drag", dragged)
    .on("end", dragEnded);
};

export default enableDrag;