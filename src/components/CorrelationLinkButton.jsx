import React, { useState } from "react";
import Papa from "papaparse";

const CorrelationLinkButton = ({ onDataLoaded }) => {
  const [csvRows, setCsvRows] = useState([]);
  const [activeType, setActiveType] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;


    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setCsvRows(result.data);
      }
    });
  };

  const handleTypeSelect = (type) => {
    if (!csvRows.length) return;

    const convertedData = csvRows.map(row => ({
      schema_a: (row.source || "").replace("_agree", ""),
      schema_b: (row.target || "").replace("_agree", ""),
      v: Number(row.v),
      correlation_value: parseFloat(row[type])
    }));

    setActiveType(type);
    onDataLoaded(convertedData);
  };

  // Render only buttons as a separate component
  const Buttons = () => {
     if (csvRows.length === 0) return null;

    const buttonStyle = (type) => ({
      backgroundColor: activeType === type ? "#9b59b6" : "#3498db",
      color: "#fff",
      padding: "5px 10px",
      marginRight: "5px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer"
    });

    return (
      <div style={{ marginTop: "10px" }}>
        <button onClick={() => handleTypeSelect("all")} style={buttonStyle("all")}>All</button>
        <button onClick={() => handleTypeSelect("all_true")} style={buttonStyle("all_true")}>Linkable True</button>
        <button onClick={() => handleTypeSelect("all_false")} style={buttonStyle("all_false")}>Linkable False</button>
       </div>
    );
  };

  
  CorrelationLinkButton.Buttons = Buttons;

  return (
    <div>
      <input id="upload_correlation" type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  );
};

export default CorrelationLinkButton;
