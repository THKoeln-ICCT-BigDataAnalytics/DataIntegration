import React from "react";
import Papa from "papaparse";

const ValidityCheckerButton = ({ onDataLoaded }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Datei ausgewählt:", file.name);
      
      Papa.parse(file, {
        complete: (result) => {
          console.log("CSV vollständig geparst:", result);
          
          const { data } = result;
          if (data.length < 2) {
            console.warn("CSV-Datei enthält keine Datenzeilen.");
            return;
          }

          const [headers, ...rows] = data;
          console.log("CSV-Header:", headers);

          const parsedData = rows.map(row => {
            // Stelle sicher, dass die Zeile die gleiche Anzahl an Spalten hat wie der Header
            while (row.length < headers.length) {
              row.push(""); // Fehlende Werte mit leerem String auffüllen
            }

            let entry = {};
            headers.forEach((key, index) => {
              entry[key] = row[index] || "";
            });
            return entry;
          });

          console.log("Eingelesene CSV-Daten:", parsedData);
          onDataLoaded(parsedData);
        },
        skipEmptyLines: true,
        header: false,
      });
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
