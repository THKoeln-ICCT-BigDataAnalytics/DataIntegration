import React from "react";
import Papa from "papaparse";

const LinkDataButton = ({ onDataLoaded }) => {
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

          // Erste Ebene: Parsen der CSV-Zeilen
          const parsedData = rows.map((row) => {
            while (row.length < headers.length) {
              row.push(""); // Fehlende Werte mit leerem String auffüllen
            }

            let entry = {};
            headers.forEach((key, index) => {
              entry[key] = row[index] || "";
            });
            return entry;
          });

          // Zweite Ebene: Erweitern um beide Richtungen
          const expandedData = [];
          parsedData.forEach((entry) => {
            const { entity_a_id, entity_b_id, cosine_similarity } = entry;

            // Richtung 1: entity_a_id -> entity_b_id
            expandedData.push({
              entity_a_id,
              entity_b_id,
              cosine_similarity: parseFloat(cosine_similarity), // Sicherstellen, dass es eine Zahl ist
            });

            // Richtung 2: entity_b_id -> entity_a_id
            expandedData.push({
              entity_a_id: entity_b_id,
              entity_b_id: entity_a_id,
              cosine_similarity: parseFloat(cosine_similarity),
            });
          });

          console.log("Erweiterte Daten:", expandedData);
          onDataLoaded(expandedData);
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
      <h2>Upload Link-Daten-CSV </h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  );
};

export default LinkDataButton;