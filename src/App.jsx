import React, { useState, useEffect } from "react";
import CsvUploader from "./components/CsvUploader";
import Graph from "./components/Graph";
import TestComponent from "./components/TestComponent";
import ValidityCheckerButton from "./components/ValidityCheckerButton";
import VSelector from "./components/VSelector";
import GraphNode from "./components/GraphNode";

function App() {
  const [csvData, setCsvData] = useState([]); // Daten speichern
  const [selectedNode, setSelectedNode] = useState(null); // Für angeklickte Nodes
  const [showTest, setShowTest] = useState(false); // Steuerung der Test-Anzeige
  const [graphNodes, setGraphNodes] = useState([]); // GraphNodes speichern
  const [vValue, setVValue] = useState(1); // V-Wert global speichern

  useEffect(() => {
    if (csvData.length === 0) return;

    console.log("CSV-Daten vor Umwandlung:", csvData);

    const nodeMap = new Map();
    const allParentIds = new Set();

    // Schritt 1: Alle vorhandenen Nodes speichern und parentIds sammeln
    csvData.forEach(({ id, name, parentId, schema }) => {
      if (!parentId || parentId === "") parentId = null; // Sicherstellen, dass parentId korrekt ist
      nodeMap.set(id, new GraphNode(id, name, parentId, schema));
      if (parentId) allParentIds.add(parentId);
    });

    // Schritt 2: Virtuelle Nodes für fehlende Eltern erstellen
    const baseNode = new GraphNode("base", "Base Node", null, "base-schema");
    allParentIds.forEach((parentId) => {
      if (!nodeMap.has(parentId)) {
        console.log(`Erstelle virtuelle Node für fehlenden Parent: ${parentId}`);
        const virtualNode = new GraphNode(parentId, `Platzhalter ${parentId}`, "base", "virtual");
        virtualNode.isVirtual = true;
        nodeMap.set(parentId, virtualNode);
        baseNode.addChild(virtualNode);
      }
    });

    // Schritt 3: Knoten mit Eltern verknüpfen
    nodeMap.forEach((node, nodeId) => {
      if (node.parentId && nodeMap.has(node.parentId)) {
        nodeMap.get(node.parentId).addChild(node);
      }
    });

    // Schritt 4: Alle Knoten ohne Eltern zur Base-Node hinzufügen
    nodeMap.forEach((node) => {
      if (!node.parentId && node.id !== "base") {
        baseNode.addChild(node);
      }
    });

    console.log("Finale GraphNodes-Struktur mit Base-Node:", JSON.stringify([baseNode, ...nodeMap.values()], null, 2));

    setGraphNodes([baseNode, ...Array.from(nodeMap.values()).filter(node => node.id !== "base")]);
  }, [csvData]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>CSV-Upload & Baum-Visualisierung</h1>
      <CsvUploader onDataLoaded={setCsvData} />
      <Graph data={graphNodes} onNodeClick={setSelectedNode} />
      <ValidityCheckerButton csvData={csvData} />
      <VSelector 
        validityData={csvData} 
        graphNodes={graphNodes} 
        vValue={vValue} 
        setVValue={setVValue}
      />

      {selectedNode && (
        <div>
          <button onClick={() => setShowTest(!showTest)}>
            {showTest ? "Test ausblenden" : "Test anzeigen"}
          </button>
          {showTest && <TestComponent node={selectedNode} />}
        </div>
      )}
    </div>
  );
}

export default App;
