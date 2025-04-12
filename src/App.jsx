import React, { useState, useEffect } from "react";
import CsvUploader from "./components/CsvUploader";
import Graph from "./components/Graph";
import TestComponent from "./components/TestComponent";
import ValidityCheckerButton from "./components/ValidityCheckerButton";
import LinkDataButton from "./components/LinkDataButton";
import VSelector from "./components/VSelector";
import LinkDataManager from "./components/LinkDataManager";

function App() {
  const [csvData, setCsvData] = useState([]);
  const [validityData, setValidityData] = useState([]);
  const [linkData, setLinkData] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showTest, setShowTest] = useState(false);
  const [vValue, setVValue] = useState(1);
  const [graphKey, setGraphKey] = useState(0);

  const refreshGraph = () => {
    setGraphKey(prevKey => prevKey + 1);
    console.log("🔄 Graph wird neu gezeichnet!");
  };

  useEffect(() => {
    if (csvData.length > 0 && linkData.length > 0) {
      console.log("Vor LinkDataManager - csvData:", csvData);
      const manager = new LinkDataManager(csvData, linkData);
      const newCsvData = manager.updateCsvData();
      console.log("Nach LinkDataManager - newCsvData:", newCsvData);

      // Aktualisiere csvData mit neuer Referenz
      setCsvData([...newCsvData]); // Neue Array-Referenz erzwingen
      console.log("setCsvData aufgerufen mit:", [...newCsvData]);

      // Aktualisiere selectedNode
      if (selectedNode) {
        const updatedNode = findNodeById(newCsvData, selectedNode.id);
        if (updatedNode) {
          setSelectedNode(updatedNode);
          console.log("SelectedNode aktualisiert:", updatedNode);
        } else {
          console.warn("SelectedNode nicht in newCsvData gefunden:", selectedNode.id);
        }
      }

  
    }
  }, [linkData]);

  // Debugging: Prüfe csvData nach jedem Update
  useEffect(() => {
    console.log("csvData nach State-Update:", csvData);
    if (selectedNode) {
      console.log("Aktueller selectedNode nach csvData-Update:", selectedNode);
    }
  }, [csvData]);

  const findNodeById = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children && node.children.length > 0) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    console.log("Aktualisierte Validity Data:", validityData);
  }, [validityData]);

  useEffect(() => {
    console.log("Aktualisierte Link Data:", linkData);
  }, [linkData]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>CSV-Upload & Baum-Visualisierung</h1>
      <CsvUploader onDataLoaded={setCsvData} />
      <Graph key={graphKey} data={csvData} onNodeClick={setSelectedNode} />
      
      <ValidityCheckerButton onDataLoaded={(data) => {
        console.log("Empfangene Validity Data vor dem Speichern:", data);
        if (data.length > 0) {
          setValidityData(data);
          console.log("Validity Data erfolgreich gespeichert.");
        } else {
          console.warn("Empfangene Validity Data ist leer!");
        }
      }} />
      
      <LinkDataButton 
        onDataLoaded={(data) => {
          console.log("Empfangene Link Data vor dem Speichern:", data);
          if (data.length > 0) {
            setLinkData(data);
            console.log("Link Data erfolgreich gespeichert.");
          } else {
            console.warn("Empfangene Link Data ist leer!");
          }
        }} 
      />

      <VSelector 
        validityData={validityData} 
        graphNodes={csvData} 
        vValue={vValue} 
        setVValue={setVValue} 
        refreshGraph={refreshGraph}
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