import React, { useState } from "react";

const ValidityCheckerButton = ({ onDataLoaded }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Datei ausgewählt:", file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        console.log("Dateiinhalt eingelesen:", text.substring(0, 100) + "...");
        const lines = text.trim().split("\n");
        console.log("Anzahl der Zeilen:", lines.length);

        if (lines.length < 2) {
          console.warn("CSV-Datei enthält keine Datenzeilen.");
          return;
        }

        const [header, ...rows] = lines;
        console.log("CSV-Header:", header);
        const headers = header.split(",").map(h => h.trim());
        
        const parsedData = rows.map(line => {
          const values = line.split(",").map(value => value.trim());
          let entry = {};
          headers.forEach((key, index) => {
            entry[key] = values[index] || "";
          });
          return entry;
        });

        console.log("Eingelesene CSV-Daten nach Parsing:", parsedData);
        console.log("Erste Einträge in validityData:", parsedData.slice(0, 5));
        
        onDataLoaded(parsedData);
      };
      reader.readAsText(file);
    } else {
      console.warn("Keine Datei ausgewählt.");
    }
  };

  return (
    <div>
      <h2>Validitäts-CSV hochladen</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  );
};

export default ValidityCheckerButton;
