import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ExportButton from "./ExportButton";

const Graph = ({ data }) => {
  const svgRef = useRef();
  const gRef = useRef();
  const zoomRef = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    console.log("Empfangene Daten:", data);
    if (!data || data.length === 0) return;

    const width = window.innerWidth * 0.9;
    const height = window.innerHeight * 0.8;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove(); // Entfernt alte Zeichnungen
    const g = svg.append("g").attr("ref", gRef);

    // Zoom und Verschieben aktivieren
    if (!zoomRef.current) {
      zoomRef.current = d3.zoom().scaleExtent([0.1, 2]).on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
      svg.call(zoomRef.current);
    }

    // Baumstruktur erstellen mit dynamischem Abstand
    const buildTree = (nodes) => {
      if (nodes.length === 0) return null;
      const root = { id: nodes[0].id, children: [] };
      const queue = [root];
      let index = 1;

      while (index < nodes.length) {
        const parent = queue.shift();
        for (let i = 0; i < 2 && index < nodes.length; i++) {
          const child = { id: nodes[index].id, children: [] };
          parent.children.push(child);
          queue.push(child);
          index++;
        }
      }
      return root;
    };

    const treeData = buildTree(data);
    console.log("Tree Data:", treeData);

    const root = d3.hierarchy(treeData);
    const depthFactor = Math.max(50, height / (root.height + 2)); // Abstand anpassen
    const treeLayout = d3.tree().nodeSize([depthFactor, depthFactor * 2]);
    treeLayout(root);

    // Links zeichnen
    g.selectAll("line")
      .data(root.links())
      .enter()
      .append("line")
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)
      .attr("stroke", "black");

    // Knoten zeichnen
    g.selectAll("circle")
      .data(root.descendants())
      .enter()
      .append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 5)
      .attr("fill", "blue");

    // Labels hinzufügen
    g.selectAll("text")
      .data(root.descendants())
      .enter()
      .append("text")
      .attr("x", d => d.x + 10)
      .attr("y", d => d.y + 5)
      .text(d => d.data.id);
  }, [data]);

  // Zoom per Slider steuern
  useEffect(() => {
    if (zoomRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(300).call(zoomRef.current.scaleTo, zoomLevel);
    }
  }, [zoomLevel]);

  return (
    <div>
      <input
        type="range"
        min="0.1"
        max="2"
        step="0.1"
        value={zoomLevel}
        onChange={(e) => {
          setZoomLevel(Number(e.target.value));
          if (zoomRef.current) {
            d3.select(svgRef.current).call(zoomRef.current.scaleTo, Number(e.target.value));
          }
        }}
      />
      <ExportButton svgRef={svgRef} />
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Graph;
