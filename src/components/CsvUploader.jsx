import React from "react";
import * as d3 from "d3";

const CsvUploader = ({ onDataLoaded }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsedData = d3.csvParse(text);

      console.log("Eingelesene CSV-Daten:", parsedData); // Debugging
      if (onDataLoaded) {
        onDataLoaded(parsedData); // Korrekte Übergabe der Daten
      } else {
        console.error("onDataLoaded ist nicht definiert!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h2>CSV-Datei hochladen</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  );
};

export default CsvUploader;
