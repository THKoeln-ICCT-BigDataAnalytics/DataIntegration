import React, { useState } from "react";
import Papa from "papaparse";
import Form from 'react-bootstrap/Form';

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

    onDataLoaded(convertedData);
  };

  // Render only buttons as a separate component
  const Buttons = () => {
    return (
    <Form>
        <div key={`inline-radio`} className="mb-3">
          <Form.Check
            inline
            label="all"
            name="correlation_radios"
            type="radio"
            id="correlation_all"
            onChange={() => { setActiveType("all"); handleTypeSelect("all"); } }
            checked={activeType === "all"}
            disabled={!csvRows.length}
          />
          <Form.Check
            inline
            label="filtered"
            name="correlation_radios"
            type="radio"
            id="correlation_filtered"
            onChange={() => { setActiveType("filtered"); handleTypeSelect("filtered"); } }
            checked={activeType === "filtered"}
            disabled={!csvRows.length}
          />
          <Form.Check
            inline
            label="filtered_true"
            name="correlation_radios"
            type="radio"
            id="correlation_filtered_true"
            onChange={() => { setActiveType("filtered_true"); handleTypeSelect("filtered_true"); } }
            checked={activeType === "filtered_true"}
            disabled={!csvRows.length}
          />
        </div>
    </Form>
    );
  };

  CorrelationLinkButton.Buttons = Buttons;

  return (
    <div>
      <Form.Group controlId="upload_correlation" className="mb-3">
        <Form.Control type="file" onChange={handleFileUpload} size="sm"/>
      </Form.Group>
    </div>
  );
};

export default CorrelationLinkButton;
