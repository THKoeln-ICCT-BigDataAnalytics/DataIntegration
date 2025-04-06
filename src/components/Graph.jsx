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

  // Funktion zum Herunterladen der Datei von GitHub
  const downloadFile = async (fileUrl, filename) => {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename; // Name der heruntergeladenen Datei
    link.click();
  };

  useEffect(() => {
    console.log("Empfangene Daten:", data);
    if (!data || data.length === 0) return;

    const width = window.innerWidth * 0.9;
    const height = window.innerHeight * 0.8;

    // SVG-Element erstellen
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    // Entferne alle vorherigen Elemente
    svg.selectAll("*").remove();
    const g = svg.append("g");
    gRef.current = g;

    // Zoom-Event hinzufügen
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

    // Simulation der Knoten und Verbindungen
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(180).strength(1))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(130))
      .force("y", d3.forceY().strength(0.1));

    // Linien für Verbindungen zwischen Knoten
    const linkElements = g.selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#7f8c8d")
      .attr("stroke-width", 2)
      .attr("opacity", 0.8);

    // Gruppen für die Knoten erstellen
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

    // Knoten visuell darstellen
    nodeGroups.append("circle")
      .attr("r", d => {
        if (d.depth === 0) {
          return 30; // Der Base Node bekommt den größten Radius
        }
        if (d.data.type === "schema" || d.data.type === "table") {
          return 20; // Standardgröße für Schema und Table
        }
        return 10; // Kleinere Größe für andere Knoten
      })
      .attr("fill", d => getColorForSchema(d.data.schema));

    // Schema-Knoten mit Datenbank-Symbol
    nodeGroups.filter(d => d.data.type === "schema") 
      .append("image")
      .attr("xlink:href", databaseIcon)
      .attr("width", 30)
      .attr("height", 30)
      .attr("x", -15)
      .attr("y", -15);

    // Tabellen-Knoten mit Tabellen-Symbol
    nodeGroups.filter(d => d.data.type === "table") 
      .append("image")
      .attr("xlink:href", tableIcon)
      .attr("width", 30)
      .attr("height", 30)
      .attr("x", -15)
      .attr("y", -15);

    // Labels für die Knoten
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

    // Simulation "tick" für Knotenbewegung
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

    // Dragging für Knoten aktivieren
    nodeGroups.call(enableDrag(nodeGroups, linkElements, labels));


  }, [data]);

  return (
    <div>
      <h2 style={{ color: "#2c3e50" }}>Datenbank-Struktur Visualisierung</h2>
      <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace" }}>
        📌 Anleitung: CSV-Datei hochladen → Validierungsdatei hochladen → Verlinkungen erkunden<br />
        ⚙️ Features: Zoom, Drag & Drop, Export, interaktive Knoten.<br />
        ℹ️ Hinweis: Shift + Klick auf eine Tabelle öffnet eine detaillierte Ansicht der verbundenen Objekte.<br /><br />
        Wenn die CSV-Datei lokal nicht vorhanden ist, per Knopfdruck aus dem GitHub-Repository heruntergeladen
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
        <button 
          onClick={() => downloadFile("https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO_schema_elements_dataset.csv", "OC3FO_schema_elements_dataset.csv")}
          style={{ padding: "10px 20px", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          CSV-Datei herunterladen
        </button>
        <button 
          onClick={() => downloadFile("https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO_collaborative_scoping.csv", "OC3FO_collaborative_scoping.csv")}
          style={{ padding: "10px 20px", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Validitäts-CSV herunterladen
        </button>
        <ExportButton svgRef={svgRef} />
        <input
        type="range"
        min="0.1"
        max="2"
        step="0.1"
        value={zoomLevel}
        onChange={(e) => setZoomLevel(Number(e.target.value))}
      />
      </div>
      
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Graph;
