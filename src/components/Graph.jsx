import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ExportButton from "./ExportButton";
import getColorForSchema from "./SchemaColorMapping";
import enableDrag from "./DragHandler";
import databaseIcon from "../assets/database.svg";

const Graph = ({ data, onNodeClick }) => {
  const svgRef = useRef();
  const gRef = useRef();
  const zoomRef = useRef(d3.zoom().scaleExtent([0.1, 2]));
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    console.log("Empfangene Daten:", data);
    if (!data || data.length === 0) return;

    const width = window.innerWidth * 0.9;
    const height = window.innerHeight * 0.8;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    svg.selectAll("*").remove();
    const g = svg.append("g");
    gRef.current = g;

    svg.call(zoomRef.current.on("zoom", (event) => {
      g.attr("transform", event.transform);
    }));

    const copiedData = JSON.parse(JSON.stringify(data));

    const filterNodesRecursively = (node) => {
      if (!node || String(node.predict_linkability).toLowerCase() === "false") {
        return null;
      }
      const filteredChildren = node.children
        ? node.children.map(filterNodesRecursively).filter(child => child !== null)
        : [];
      return { ...node, children: filteredChildren };
    };

    const filteredData = copiedData
      .map(filterNodesRecursively)
      .filter(node => node !== null);

    console.log("Nach Filterung unsichtbarer Nodes:", filteredData);

    const buildHierarchy = (nodes) => {
      if (!nodes || nodes.length === 0) return null;
      const rootNode = nodes.find(node => node.parentId === null);
      if (!rootNode) {
        console.error("Kein gültiger Wurzelknoten gefunden!");
        return null;
      }
      return d3.hierarchy(rootNode, (node) => node.children);
    };

    const root = buildHierarchy(filteredData);
    if (!root) return;

    const nodes = root.descendants();
    const links = root.links();

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(200).strength(1))
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(150))
      .force("y", d3.forceY().strength(0.1));

    const linkElements = g.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("opacity", 0.6);

    const nodeGroups = g.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .on("click", (event, d) => onNodeClick(d.data));

    nodeGroups.filter(d => d.data.type === "schema") // Nur Schemas als SVG
      .append("image")
      .attr("xlink:href", databaseIcon)
      .attr("width", 20)
      .attr("height", 20)
      .attr("x", -10) // Zentrierung relativ zur Gruppe
      .attr("y", -10);

    nodeGroups.filter(d => d.data.type !== "schema") // Alle anderen als Kreise
      .append("circle")
      .attr("r", 6)
      .attr("fill", d => getColorForSchema(d.data.schema));

    const labels = g.selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("x", d => d.x + 15)
      .attr("y", d => d.y + 5)
      .text(d => d.data.name)
      .style("font-size", "9px");

    simulation.on("tick", () => {
      linkElements
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      nodeGroups.attr("transform", d => `translate(${d.x},${d.y})`);

      labels
        .attr("x", d => d.x + 15)
        .attr("y", d => d.y + 5);
    });

    nodeGroups.call(enableDrag(nodeGroups, linkElements, labels));
  }, [data]);

  useEffect(() => {
    d3.select(gRef.current)
      .transition()
      .duration(300)
      .attr("transform", `scale(${zoomLevel})`);
  }, [zoomLevel]);

  return (
    <div>
      <h2>Graph Visualisierung</h2>
      <p style={{ fontSize: "14px", color: "gray" }}>
        Anleitung: 1. CSV-Datei hochladen → 2. Validierungsdatei hochladen (unten auf der Seite) → 3. Validitäts-Regler verwenden<br></br>
        Optionale Features: 1. Zoom: Zoom ist über den Zoom-Regler oder das Mausrad → 2.verwendbar Knoten anklicken und Werte unten über den Button anzeigen lassen → 3.Export mit ExportButton → 4.Drag and Drop: Nodes lassen sich verschieben
      </p>
      <input
        type="range"
        min="0.1"
        max="2"
        step="0.1"
        value={zoomLevel}
        onChange={(e) => setZoomLevel(Number(e.target.value))}
      />
      <ExportButton svgRef={svgRef} />
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Graph;
