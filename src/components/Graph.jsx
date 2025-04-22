import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ExportButton from "./ExportButton";
import getColorForSchema from "./SchemaColorMapping";
import enableDrag from "./DragHandler";
import databaseIcon from "../assets/database.svg";
import tableIcon from "../assets/table.svg";

const Graph = ({ data, onNodeClick, sliderValue }) => {
  const svgRef = useRef();
  const gRef = useRef();
  const nodesRef = useRef(null);
  const specialLinkGroupRef = useRef(null);
  const zoomRef = useRef(d3.zoom().scaleExtent([0.1, 2]));
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Debug-Ausgabe für sliderValue
  useEffect(() => {
    console.log("Aktueller sliderValue in Graph:", sliderValue);
  }, [sliderValue]);

  // Funktion zum Herunterladen der Datei von GitHub
  const downloadFile = async (fileUrl, filename) => {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Farbskala für cosine_similarity (-1 bis 1)
  const colorScale = d3.scaleLinear()
    .domain([0, 0.5, 1])
    .range(["red", "yellow", "green"]);

  const updateSpecialLinks = () => {
    if (!specialLinkGroupRef.current || !nodesRef.current) return;

    const specialLinkGroup = d3.select(specialLinkGroupRef.current);
    specialLinkGroup.selectAll("line").remove();

    if (selectedNodeId) {
      const selectedNode = nodesRef.current.find(n => n.data.id === selectedNodeId);
      if (selectedNode && selectedNode.data && selectedNode.data.allLinks) {
        const linkData = selectedNode.data.allLinks
          .map(link => {
            const targetNode = nodesRef.current.find(n => n.data.id === link.entity_b_id);
            const cosineSimilarity = parseFloat(link.cosine_similarity);
            return targetNode && cosineSimilarity > sliderValue ? {
              source: selectedNode,
              target: targetNode,
              cosine_similarity: cosineSimilarity,
            } : null;
          })
          .filter(d => d !== null);

        specialLinkGroup.selectAll("line")
          .data(linkData)
          .enter()
          .append("line")
          .attr("stroke", d => colorScale(d.cosine_similarity))
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5,5")
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
      }
    }
  };

  useEffect(() => {
    console.log("Empfangene Daten:", data);
    if (!data || data.length === 0) {
      console.log("Abbruch: Keine Daten oder leeres Array");
      return;
    }

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
      if (!node) return null;
      const filteredChildren = node.children
        ? node.children.map(filterNodesRecursively).filter(child => child !== null)
        : [];
      if (String(node.predict_linkability).toLowerCase() !== "false" || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    };

    const filteredData = copiedData
      .map(filterNodesRecursively)
      .filter(node => node !== null);

    console.log("Nach Filterung unsichtbarer Nodes:", filteredData);
    if (filteredData.length === 0) {
      console.log("Abbruch: filteredData ist leer");
      return;
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

    const root = buildHierarchy(filteredData);
    console.log("Root Hierarchie:", root);
    if (!root) {
      console.log("Abbruch: Keine gültige Hierarchie erstellt");
      return;
    }

    const nodes = root.descendants();
    nodesRef.current = nodes;
    const links = root.links();

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(180).strength(1))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(130))
      .force("y", d3.forceY().strength(0.1));

    const linkElements = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#7f8c8d")
      .attr("stroke-width", 2)
      .attr("opacity", 0.8);

    const specialLinkGroup = g.append("g").attr("class", "special-links");
    specialLinkGroupRef.current = specialLinkGroup.node();

    const nodeGroups = g.append("g")
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .on("click", (event, d) => {
        if (event.shiftKey && d.data.type === "table" && d.children?.length) {
          const angleStep = (2 * Math.PI) / d.children.length;
          const radius = 120;

          d.children.forEach((child, index) => {
            child.x = d.x + radius * Math.cos(index * angleStep);
            child.y = d.y + radius * Math.sin(index * angleStep);
            d3.selectAll(".node")
              .filter(n => n.id === child.id)
              .attr("transform", `translate(${child.x},${child.y})`);
          });

          nodeGroups.call(enableDrag(nodeGroups, linkElements, labels));
        } else {
          onNodeClick(d.data);
        }
      })
      .on("dblclick", (event, d) => {
        const nodeId = d.data.id;
        setSelectedNodeId(selectedNodeId === nodeId ? null : nodeId);
      });

    nodeGroups.append("circle")
      .attr("r", d => {
        if (d.depth === 0) {
          return 30;
        }
        if (d.data.type === "schema" || d.data.type === "table") {
          return 20;
        }
        return 10;
      })
      .attr("fill", d => getColorForSchema(d.data.schema));

    nodeGroups.filter(d => d.data.type === "schema")
      .append("image")
      .attr("xlink:href", databaseIcon)
      .attr("width", 30)
      .attr("height", 30)
      .attr("x", -15)
      .attr("y", -15);

    nodeGroups.filter(d => d.data.type === "table") 
      .append("image")
      .attr("xlink:href", tableIcon)
      .attr("width", 30)
      .attr("height", 30)
      .attr("x", -15)
      .attr("y", -15);

    nodeGroups.filter(d => d.data.type !== "schema")
      .append("circle")
      .attr("r", 8)
      .attr("fill", d => getColorForSchema(d.data.schema));

    const agreeMarkers = [
      { key: "OC_ORACLE_agree", color: "rgb(0, 123, 255)", offset: -15 },
      { key: "OC_MYSQL_agree", color: "rgb(255, 87, 51)", offset: -10 },
      { key: "OC_SAP_agree", color: "rgb(255, 215, 0)", offset: -5 },
      { key: "FORMULA_agree", color: "rgb(75, 181, 67)", offset: 0 }
    ];

    agreeMarkers.forEach(marker => {
      const filteredNodes = nodeGroups.filter(d => {
        const value = d.data[marker.key];
        return value === 1 || value === "1" || value === true;
      });
      filteredNodes
        .append("circle")
        .attr("r", 4)
        .attr("cx", marker.offset)
        .attr("cy", 15)
        .attr("fill", marker.color);
    });

    const labels = g.append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("x", d => d.x + 20)
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
        .attr("x", d => d.x + 20)
        .attr("y", d => d.y + 5);

      updateSpecialLinks();
    });

    nodeGroups.call(enableDrag(nodeGroups, linkElements, labels));

    updateSpecialLinks();
  }, [data, onNodeClick]);

  useEffect(() => {
    d3.select(gRef.current)
      .transition()
      .duration(300)
      .attr("transform", `scale(${zoomLevel})`);
  }, [zoomLevel]);

  useEffect(() => {
    if (gRef.current && nodesRef.current && specialLinkGroupRef.current) {
      updateSpecialLinks();
    }
  }, [selectedNodeId, sliderValue]); // sliderValue als Abhängigkeit hinzufügen

  return (
    <div>
      <h2 style={{ color: "#2c3e50" }}>Datenbank-Struktur Visualisierung</h2>
      <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace" }}>
        📌 Anleitung: CSV-Datei hochladen → Validierungsdatei hochladen → Verlinkungsdatei hochladen → Verlinkungen erkunden<br />
        ⚙️ Features: Zoom, Drag & Drop, Export, interaktive Knoten.<br />
        ℹ️ Hinweis: Shift + Klick auf eine Tabelle öffnet eine detaillierte Ansicht der verbundenen Objekte. <br />
        Doppelklick öffnet eine detaillierte Ansicht der Verlinkungen<br /><br />
        Wenn die CSV-Dateien lokal nicht vorhanden sind, per Knopfdruck aus dem GitHub-Repository herunterladen
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
        <button 
          onClick={() => downloadFile("https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO_linkages_cossimilarity.csv", "OC3_linkages.csv")}
          style={{ padding: "10px 20px", backgroundColor: "#3498db", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
>
          Linkages-CSV herunterladen
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