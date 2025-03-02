import React, { useState } from "react";
import CsvUploader from "./components/CsvUploader";
import Graph from "./components/Graph";
import TestComponent from "./components/TestComponent";

function App() {
  const [csvData, setCsvData] = useState([]); // Daten speichern
  const [showTest, setShowTest] = useState(false);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>CSV-Upload & Baum-Visualisierung</h1>
      <CsvUploader onDataLoaded={setCsvData} />
      <Graph data={csvData} />
      
      <button onClick={() => setShowTest(!showTest)}>
        {showTest ? "Test ausblenden" : "Test anzeigen"}
      </button>
      
      {showTest && csvData.length > 0 && (
        <TestComponent node={csvData[0]} />
      )}
    </div>
  );
}

export default App;