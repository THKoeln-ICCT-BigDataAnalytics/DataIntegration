import React, { useState, useEffect } from "react";
import CsvUploader from "./components/CsvUploader";
import Graph from "./components/Graph";
import TestComponent from "./components/TestComponent";
import ValidityCheckerButton from "./components/ValidityCheckerButton";
import VSelector from "./components/VSelector";

function App() {
  const [csvData, setCsvData] = useState([]); // Globale CSV-Daten speichern
  const [validityData, setValidityData] = useState([]); // Validitätsdaten speichern
  const [selectedNode, setSelectedNode] = useState(null); // Für angeklickte Nodes
  const [showTest, setShowTest] = useState(false); // Steuerung der Test-Anzeige
  const [vValue, setVValue] = useState(1); // V-Wert global speichern
  const [graphKey, setGraphKey] = useState(0); // Trigger für Neuzeichnen

  // Funktion zum manuellen Triggern des Graph-Updates
  const refreshGraph = () => {
    setGraphKey(prevKey => prevKey + 1);
    console.log("🔄 Graph wird neu gezeichnet!");
  };

  useEffect(() => {
    console.log("Aktualisierte Validity Data:", validityData);
  }, [validityData]); // Loggt validityData bei Änderungen

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
      
      <VSelector 
        validityData={validityData} 
        graphNodes={csvData} 
        vValue={vValue} 
        setVValue={setVValue} 
        refreshGraph={refreshGraph} // **Graph neu zeichnen**
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
