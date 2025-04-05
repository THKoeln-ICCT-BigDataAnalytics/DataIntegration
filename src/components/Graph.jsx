import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ExportButton from "./ExportButton";
import getColorForSchema from "./SchemaColorMapping";
import enableDrag from "./DragHandler";
import databaseIcon from "../assets/database.svg";
import tableIcon from "../assets/table.svg";

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

    // Filtere rekursiv die Kinder
    const filterNodesRecursively = (node) => {
      if (!node) return null;

      // Wenn der Node Kinder hat, filtere sie rekursiv und entferne null-Werte
      const filteredChildren = node.children
        ? node.children.map(filterNodesRecursively).filter(child => child !== null)
        : [];

      // Der Parent-Node soll nur erhalten bleiben, wenn entweder:
      // - `predict_linkability` nicht "false" ist
      // - oder er mindestens ein Kind hat, das erhalten bleibt
      if (String(node.predict_linkability).toLowerCase() !== "false" || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }

      // Falls weder der Parent gültig ist noch Kinder übrig bleiben -> null zurückgeben
      return null;
    };

    // Die gefilterte Liste der Nodes
    const filteredData = copiedData
      .map(filterNodesRecursively)
      .filter(node => node !== null);

    console.log("Nach Filterung unsichtbarer Nodes:", filteredData);

    // Hierarchie aufbauen
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
      .force("link", d3.forceLink(links).id(d => d.id).distance(180).strength(1))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(130))
      .force("y", d3.forceY().strength(0.1));

    const linkElements = g.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#7f8c8d")
      .attr("stroke-width", 2)
      .attr("opacity", 0.8);

    const nodeGroups = g.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .on("click", (event, d) => {
        // Wenn Shift gedrückt wird UND es sich um eine Tabelle handelt
        if (event.shiftKey && d.data.type === "table") {
          let angleStep = (2 * Math.PI) / d.children.length;
          let radius = 50;
          d.children.forEach((child, index) => {
            child.x = d.x + radius * Math.cos(index * angleStep);
            child.y = d.y + radius * Math.sin(index * angleStep);
            d3.selectAll(".node")
              .filter(n => n.id === child.id)
              .attr("transform", `translate(${child.x},${child.y})`);
          });

          // Drag-Interaktivität nach dem Shift+Klick neu anwenden
          nodeGroups.call(enableDrag(nodeGroups, linkElements, labels));
        } else {
          onNodeClick(d.data);
        }
      });

    // Der Wurzelknoten (Base Node) bekommt die größte Größe
    nodeGroups.append("circle")
      .attr("r", d => {
        if (d.depth === 0) {  // Der Base Node ist der Wurzelknoten (depth 0)
          return 30;  // Größter Radius für den Base Node
        }
        if (d.data.type === "schema" || d.data.type === "table") {
          return 20;  // Behalte die Standardgröße für Schema und Table
        }
        return 10;  // Kleinere Größe für Leaves
      })
      .attr("fill", d => getColorForSchema(d.data.schema));

    // Datenbank-Schema-Icons hinzufügen
    nodeGroups.filter(d => d.data.type === "schema") 
      .append("image")
      .attr("xlink:href", databaseIcon)
      .attr("width", 30)
      .attr("height", 30)
      .attr("x", -15)
      .attr("y", -15);

    // Tabellen-Icons hinzufügen
    nodeGroups.filter(d => d.data.type === "table") 
      .append("image")
      .attr("xlink:href", tableIcon)
      .attr("width", 30)
      .attr("height", 30)
      .attr("x", -15)
      .attr("y", -15);

    const labels = g.selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("x", d => d.x + 25) // Text nach rechts verschoben
      .attr("y", d => d.y + 5)
      .text(d => d.data.name)
      .style("font-size", "12px")
      .style("fill", "#2c3e50")
      .style("font-family", "Roboto Mono, monospace")
      .style("font-weight", "bold");

    simulation.on("tick", () => {
      linkElements
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      nodeGroups.attr("transform", d => `translate(${d.x},${d.y})`);

      labels
        .attr("x", d => d.x + 25) // Text nach rechts verschoben
        .attr("y", d => d.y + 5);
    });

    nodeGroups.call(enableDrag(nodeGroups, linkElements, labels));

    
  }, [data]);

  return (
    <div>
      <h2 style={{ color: "#2c3e50" }}>Datenbank-Struktur Visualisierung</h2>
      <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace" }}>
        📌 Anleitung: CSV-Datei hochladen → Validierungsdatei hochladen → Verlinkungen erkunden<br />
        ⚙️ Features: Zoom, Drag & Drop, Export, interaktive Knoten.<br />
        ℹ️ Hinweis: Shift + Klick auf eine Tabelle öffnet eine detaillierte Ansicht der verbundenen Objekte.
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
