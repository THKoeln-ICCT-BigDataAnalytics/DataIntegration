import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import getColorForSchema from "./SchemaColorMapping";
import enableDrag from "./DragHandler";
import databaseIcon from "../assets/database.svg";
import tableIcon from "../assets/table.svg";

const Graph = ({ svgRef, data, onNodesUpdate, onNodeClick,
  schemas, setSchemas,
  schemasLinkability, setSchemasLinkability,
   vValue, tValue, correlationData = [] }) => {
  // const svgRef = useRef();
  const gRef = useRef();
  const nodesRef = useRef(null);
  const specialLinkGroupRef = useRef(null);
  const correlationLinkGroupRef = useRef(null); 
  const zoomRef = useRef(d3.zoom().scaleExtent([0.1, 2]));
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Debug-Ausgabe für tValue
  useEffect(() => {
    console.log("Aktueller threshold für Verlinkungen in Graph:", tValue);
  }, [tValue]);

  // Funktion zum Herunterladen der Datei von GitHub
  // const downloadFile = async (fileUrl, filename) => {
  //   const response = await fetch(fileUrl);
  //   const blob = await response.blob();
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   link.download = filename;
  //   link.click();
  // };

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
            return targetNode && cosineSimilarity > tValue ? {
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

 // Korrelationen aktualisieren 
  const updateCorrelationLinks = () => {
  
    if (correlationData === "none"){
      console.log("Korrelation Links entfernen");
      const correlationLinkGroup = d3.select(correlationLinkGroupRef.current);
      correlationLinkGroup.selectAll("*").remove();
      return;
    }

  if (!correlationLinkGroupRef.current || !nodesRef.current || correlationData.length === 0) return;

  console.log("updateCorrelationLinks gestartet");
  const correlationLinkGroup = d3.select(correlationLinkGroupRef.current);
  correlationLinkGroup.selectAll("*").remove();

  // Schema-Namen normalisieren
  const normalizeSchemaName = (name) => {
    return String(name || "")
      .toLowerCase()
      .trim()
      .replace(/_agree$/, ""); // "_agree" entfernen
  };

  // Nur die Schema-Nodes aus allen vorhandenen Nodes herausfiltern
  const schemaNodes = nodesRef.current.filter(n => n.data.type === "schema");
  // Korrelationen auf die aktuelle Variante (v) einschränken
  const filteredCorrelations = correlationData.filter(
    d => Number(d.v) === Number(vValue)
  );
  console.log(`Gefilterte Korrelationen für v=${vValue}:`, filteredCorrelations);

  filteredCorrelations.forEach(d => {
  // Schlüssel für beide Schemas vereinheitlichen
  const keyA = String(d.schema_a || d.source || "").toLowerCase().trim();
  const keyB = String(d.schema_b || d.target || "").toLowerCase().trim();

  // Zugehörige Schema-Nodes im Array suchen
  const nodeA = schemaNodes.find(n => normalizeSchemaName(n.data.schema) === keyA);
  const nodeB = schemaNodes.find(n => normalizeSchemaName(n.data.schema) === keyB);

  // Wenn einer der beiden Nodes nicht existiert, abbrechen
  if (!nodeA || !nodeB) {
    console.warn("Schema nicht gefunden:", d.schema_a || d.source, d.schema_b || d.target);
    return;
  }

    // Linie zeichnen
    correlationLinkGroup
      .append("line")
      .attr("stroke", "blue")
      .attr("stroke-width", 3)
      .attr("x1", nodeA.x)
      .attr("y1", nodeA.y)
      .attr("x2", nodeB.x)
      .attr("y2", nodeB.y);

    // Text mit Korrelationswert
    correlationLinkGroup
      .append("text")
      .attr("fill", "black")
      .style("font-size", "18px")
      .attr("font-weight", "bold")
      .attr("x", (nodeA.x + nodeB.x) / 2)
      .attr("y", (nodeA.y + nodeB.y) / 2-10)
      .text(Number(d.correlation_value || d.all).toFixed(2));
  });
};

  useEffect(() => {
    console.log("Empfangene Daten:", data);
    if (!data || data.length === 0) {
      console.log("Abbruch: Keine Daten oder leeres Array");
      return;
    }

    const width = window.innerWidth * 0.97;
    const height = window.innerHeight * 0.70;

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

      // Start with true to include node, then restrict with conditions
      let shouldInclude = true;

      if (Object.keys(schemas).length > 0) {
        shouldInclude = shouldInclude && (schemas[node.schema] === true);
      }

      if ((Object.keys(schemasLinkability).length) > 0 && (vValue)) {
        // Check agreeFlags for at least one other schema with agree=1 and linkability=true
        const agreeFlags = node.agreeFlags || {};
        const nodeSchemaAgreeKey = `${node.schema}_agree`;

        // Check if any other schema agree flag is set AND that schema is enabled in schemasLinkability
        const hasMatchingAgreeFlag = Object.entries(agreeFlags).some(([key, value]) => {
          // key must end with '_agree'
          if (!key.endsWith('_agree')) return false;
          // skip own schema's agree key
          if (key === nodeSchemaAgreeKey) return false;
          // schema name for linkability check is key without _agree suffix
          const schemaName = key.slice(0, -6);
          return (value === 1 || value === "1" || value === true) && schemasLinkability[schemaName] === true;
        });

        shouldInclude = shouldInclude && hasMatchingAgreeFlag;
      }
      
      shouldInclude = shouldInclude && (String(node.predict_linkability).toLowerCase() !== "false");

      // Always keep base node if applicable, can add here too:
      if ((node.id === "base") | (node.type === "schema")) {
        return { ...node, children: filteredChildren };
      }
      
      // Return node if all filter conditions passed or it has children (preserve hierarchy)
      if (shouldInclude || filteredChildren.length > 0) {
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
    // pass nodes up to App
    if(onNodesUpdate) onNodesUpdate(nodes);

    const links = root.links();

     // 1. Extract unique schemas from schemaNodes
    const schemaNodes = nodesRef.current.filter(n => n.data.type === "schema");
    const uniqueSchemas = Array.from(new Set(schemaNodes.map(n => n.data.schema)));

    // Global state update logic:
    if (Object.keys(schemas).length === 0) {
      // Set schemas as key-value object:
      setSchemas(Object.fromEntries(uniqueSchemas.map(schema => [schema, true])));
    }

    if (Object.keys(schemasLinkability).length === 0) {
      // Set schemasLinkability as key-value object:
      setSchemasLinkability(Object.fromEntries(uniqueSchemas.map(schema => [schema, true])));
    }


    
    


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

    const correlationLinkGroup = g.append("g").attr("class", "correlation-links"); 
    correlationLinkGroupRef.current = correlationLinkGroup.node();

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

          //nodeGroups.call(enableDrag(nodeGroups, linkElements, labels, correlationLinkGroupRef.current));
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
        if (d.data.type === "source" || d.data.type === "schema" || d.data.type === "table") {
          return 20;
        }
        return 10;
      })
      .attr("fill", d => getColorForSchema(d.data.schema));

    nodeGroups.filter(d => (d.data.type === "source") || (d.data.type === "schema"))
      .append("image")
      .attr("xlink:href", databaseIcon)
      .attr("width", 50)
      .attr("height", 50)
      .attr("x", -25)
      .attr("y", -25);

    nodeGroups.filter(d => d.data.type === "table") 
      .append("image")
      .attr("xlink:href", tableIcon)
      .attr("width", 40)
      .attr("height", 40)
      .attr("x", -20)
      .attr("y", -20);

    nodeGroups.filter(d => d.data.type !== (d.data.type === "source") || (d.data.type === "schema"))
      .append("circle")
      .attr("r", 8)
      .attr("fill", d => getColorForSchema(d.data.schema));

    

      // 2. Generate agreeMarkers dynamically with color from schema
    const agreeMarkers = Object.keys(schemasLinkability).map((schemaName, i) => ({
      key: `${schemaName}_agree`,
      color: getColorForSchema(schemaName),
      offset: -15 + i * 5  // adjust spacing as needed
    }));

    agreeMarkers.forEach(marker => {
      const filteredNodes = nodeGroups.filter(d => {
        const value = d.data.agreeFlags ? d.data.agreeFlags[marker.key] : 0;
        return (d.data.schema !== marker.key.replace('_agree', '')) && (value === 1 || value === "1" || value === true);
        // Only include nodes where the schema is NOT the marker schema
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

      nodeGroups.call(enableDrag(nodeGroups, linkElements, labels, correlationLinkGroupRef.current));
      
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
      updateCorrelationLinks(); 
    });

    nodeGroups.call(enableDrag(nodeGroups, linkElements, labels));

    updateSpecialLinks();
    updateCorrelationLinks(); 
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
  }, [selectedNodeId, tValue]); // tValue als Abhängigkeit hinzufügen

  useEffect(() => {
    if (gRef.current && nodesRef.current && correlationLinkGroupRef.current) {
      updateCorrelationLinks();
    }
  }, [correlationData, vValue, schemas, schemasLinkability, setSchemas, setSchemasLinkability]); 

  
  return (
    <div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Graph;

      {/* <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={zoomLevel}
          onChange={(e) => setZoomLevel(Number(e.target.value))}
        />
      </div> */}