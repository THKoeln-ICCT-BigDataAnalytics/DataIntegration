import React, { useState } from "react";
import ValidityChecker from "./ValidityChecker";

const ValidityCheckerButton = ({ onDataLoaded }) => {

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.trim().split("\n");
        const [header, ...rows] = lines;
        
        const parsedData = rows.map(line => {
          const [id, v, predict_liability] = line.split(",").map(item => item.trim());
          return id && v && predict_liability ? { id, v: Number(v), predict_liability } : null;
        }).filter(entry => entry !== null);

        console.log("Eingelesene CSV-Daten:", parsedData);
        onDataLoaded(parsedData);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  );
};

const App = () => {
  const [validityData, setValidityData] = useState([]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>CSV-Upload & Validity Checker</h1>
      <ValidityCheckerButton onDataLoaded={setValidityData} />
      <button
        onClick={() => console.log("Gespeicherte Validitätsdaten:", validityData)}
        style={{ padding: "10px 20px", margin: "10px", cursor: "pointer" }}
      >
        Validitätsdaten anzeigen
      </button>
    </div>
  );
};

export default App;
