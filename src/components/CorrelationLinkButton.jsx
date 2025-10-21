import React, { useState } from "react";
import Papa from "papaparse";
import Form from 'react-bootstrap/Form';

const CorrelationLinkButton = ({ onDataLoaded }) => {
    const [csvRows, setCsvRows] = useState([]);
    // Ensure initial state is defined to avoid unchecked initial state
    const [activeType, setActiveType] = useState("none"); 


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

        setActiveType(type);
        if (type === "none") {
            onDataLoaded("none");
            return; 
        }

        if (!csvRows.length) {
            return;
        }

        const convertedData = csvRows.map(row => ({
            schema_a: (row.source || "").replace("_agree", ""),
            schema_b: (row.target || "").replace("_agree", ""),
            v: Number(row.v),
            correlation_value: parseFloat(row[type]) 
        }));

        onDataLoaded(convertedData);
    };


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
                        onChange={() => {handleTypeSelect("all")}}
                        checked={activeType === "all"}
                        disabled={!csvRows.length}
                    />
                    <Form.Check
                        inline
                        label="filtered"
                        name="correlation_radios"
                        type="radio"
                        id="correlation_filtered"
                        onChange={() => {handleTypeSelect("filtered")}}
                        checked={activeType === "filtered"}
                        disabled={!csvRows.length}
                    />
                    <Form.Check
                        inline
                        label="none"
                        name="correlation_radios"
                        type="radio"
                        id="correlation_none"
                        onChange={() => {handleTypeSelect("none")}}
                        checked={activeType === "none"}
                    />
                </div>
            </Form>
        );
    };

    CorrelationLinkButton.Buttons = Buttons;

    return (
        <div>
            <Form.Group controlId="upload_correlation" className="mb-2">
                <Form.Control type="file" onChange={handleFileUpload} size="sm"/>
            </Form.Group>
        </div>
    );
};

export default CorrelationLinkButton;

          {/* <Form.Check
            inline
            label="filtered_true"
            name="correlation_radios"
            type="radio"
            id="correlation_filtered_true"
            onChange={() => {handleTypeSelect("filtered_true"); } }
            checked={activeType === "filtered_true"}
            disabled={!csvRows.length}
          /> */}

                    {/* <Form.Check
            inline
            label="all_true"
            name="correlation_radios"
            type="radio"
            id="correlation_all_true"
            onChange={() => {handleTypeSelect("all_true")} }
            checked={activeType === "all_true"}
            disabled={!csvRows.length}
          /> */}