import React, { useState } from "react";
import CsvUploader from "./components/CsvUploader";
import Graph from "./components/Graph";
import TestComponent from "./components/TestComponent";

function App() {
  const [csvData, setCsvData] = useState([]); // Daten speichern
  const [selectedNode, setSelectedNode] = useState(null); // Für angeklickte Nodes
  const [showTest, setShowTest] = useState(false); // Steuerung der Test-Anzeige

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>CSV-Upload & Baum-Visualisierung</h1>
      <CsvUploader onDataLoaded={setCsvData} />
      <Graph data={csvData} onNodeClick={setSelectedNode} />
      
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
