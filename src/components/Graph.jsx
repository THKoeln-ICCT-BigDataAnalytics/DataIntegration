import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ExportButton from "./ExportButton";
import getColorForSchema from "./SchemaColorMapping";
import enableDrag from "./DragHandler";

const Graph = ({ data, onNodeClick }) => {
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

    if (!zoomRef.current) {
      zoomRef.current = d3.zoom().scaleExtent([0.1, 2]).on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
      svg.call(zoomRef.current);
    }

    const buildHierarchy = (nodes) => {
      if (!nodes || nodes.length === 0) return null;
      const rootNode = nodes.find(node => node.parentId === null);
      if (!rootNode) {
        console.error("Kein gültiger Wurzelknoten gefunden!");
        return null;
      }
      return d3.hierarchy(rootNode, (node) => node.children);
    };

    const root = buildHierarchy(data);
    if (!root) return;

    // Alle Knoten und Verbindungen für das Force-Graph
    const nodes = root.descendants();
    const links = root.links();

    // Erstelle eine Simulation für das Force-Graph
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(200).strength(1)) // Größerer Abstand für Links
      .force("charge", d3.forceManyBody().strength(-1000)) // Stärkere Abstoßungskraft für Knoten
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(150)) // Kollisionsradius für Knoten
      .force("y", d3.forceY().strength(0.1)); // Vertikale Trennung

    const linkElements = g.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("opacity", 0.6);

    const nodeElements = g.selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", d => {
        if (d === root) return 15; // Wurzelknoten bleibt bei 15
        const isLeafParent = d.children && d.children.some(child => !child.children); // Eltern der Blätter
        return isLeafParent ? 9 : 6; // Eltern der Blätter haben einen Radius von 9, Blätter bleiben bei 6
      })
      .attr("fill", d => {
        const isLeafParent = d.children && d.children.some(child => !child.children); // Eltern der Blätter
        return isLeafParent ? "#FF0000" : getColorForSchema(d.data.schema); // Helles Rot für Elternknoten der Blätter
      })
      .on("click", (event, d) => {
        onNodeClick(d.data);
      });

    const labels = g.selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("x", d => d.x + 10)
      .attr("y", d => d.y + 5)
      .text(d => d.data.name)
      .style("font-size", "9px");

    // Aktualisiere die Positionen der Knoten und Kanten während der Simulation
    simulation.on("tick", () => {
      linkElements
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      nodeElements
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

      labels
        .attr("x", d => d.x + 10)
        .attr("y", d => d.y + 5);
    });

    // Dragging hinzufügen
    nodeElements.call(enableDrag(nodeElements, linkElements, labels));
  }, [data]);

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
