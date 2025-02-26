import React, { useState } from "react";
import CsvUploader from "./components/CsvUploader";
import Graph from "./components/Graph";

function App() {
  const [csvData, setCsvData] = useState([]); // Daten speichern

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>CSV-Upload & Baum-Visualisierung</h1>
      <CsvUploader onDataLoaded={setCsvData} />
      <Graph data={csvData} />
    </div>
  );
}

export default App;
