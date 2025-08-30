import React, { useState } from "react";
import Papa from "papaparse";

const CorrelationLinkButton = ({ onDataLoaded }) => {
  const [csvRows, setCsvRows] = useState([]);
  const [activeType, setActiveType] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Datei mit PapaParse einlesen und parsen
    Papa.parse(file, {
      header: true,          // Erste Zeile als Header verwenden
      skipEmptyLines: true,  // Leere Zeilen überspringen
      complete: (result) => {
        console.log("CSV vollständig geparst:", result.data);

        // Ergebnis im State speichern für weitere Verarbeitung
        setCsvRows(result.data);
      }
    });
  };

  const handleTypeSelect = (type) => {
    if (!csvRows.length) return;

    // CSV-Zeilen in gewünschtes Format umwandeln
    const convertedData = csvRows.map(row => ({
      // "_agree" entfernen, damit es zu schema-Namen passt
      schema_a: (row.source || "").replace("_agree", ""),
      schema_b: (row.target || "").replace("_agree", ""),
      v: Number(row.v),
      correlation_value: parseFloat(row[type]) // Zahl statt String
    }));

    console.log(`Konvertierte Korrelationen für "${type}":`, convertedData);

    // Aktiven Button speichern, um UI hervorzuheben
    setActiveType(type);

    // Verarbeitete Daten zurückgeben
    onDataLoaded(convertedData); 
  };

  return (
    <div>
      <h2>Upload Correlation</h2>
      <input id="upload_correlation" type="file" accept=".csv" onChange={handleFileUpload} />

      {csvRows.length > 0 && (
        <div style={{ marginTop: "10px" }}>
          <button
            onClick={() => handleTypeSelect("all")}
            style={{
              backgroundColor: activeType === "all" ? "#9b59b6" : "#3498db",
              color: "#fff",
              padding: "5px 10px",
              marginRight: "5px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            All
          </button>
          <button
            onClick={() => handleTypeSelect("all_true")}
            style={{
              backgroundColor: activeType === "all_true" ? "#9b59b6" : "#3498db",
              color: "#fff",
              padding: "5px 10px",
              marginRight: "5px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            All True
          </button>
          <button
            onClick={() => handleTypeSelect("all_false")}
            style={{
              backgroundColor: activeType === "all_false" ? "#9b59b6" : "#3498db",
              color: "#fff",
              padding: "5px 10px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            All False
          </button>
        </div>
      )}
    </div>
  );
};

export default CorrelationLinkButton;
