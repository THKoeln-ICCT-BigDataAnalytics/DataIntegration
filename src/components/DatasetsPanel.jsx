import React from "react";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

      // Files info for download + auto upload

    const files_OC3 = [
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3/schema_graph.csv",
      filename: "OC3_schema_graph.csv",
      uploadInputId: "upload_schema_graph",
    },
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3/collaborative_scoping.csv",
      filename: "OC3_collaborative_scoping.csv",
      uploadInputId: "upload_collaborative_scoping",
    },
    // {
    //   url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO/correlation.csv",
    //   filename: "OC3_correlation.csv",
    //   uploadInputId: "upload_correlation",
    // },
    // {
    //   url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO/linkages.csv",
    //   filename: "OC3_linkages.csv",
    //   uploadInputId: "upload_linkages",
    // },
    
  ];

  const files_OC3FO = [
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO/schema_graph.csv",
      filename: "OC3FO_schema_graph.csv",
      uploadInputId: "upload_schema_graph",
    },
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO/collaborative_scoping.csv",
      filename: "OC3FO_collaborative_scoping.csv",
      uploadInputId: "upload_collaborative_scoping",
    },
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO/correlation.csv",
      filename: "OC3FO_correlation.csv",
      uploadInputId: "upload_correlation",
    },
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO/linkages.csv",
      filename: "OC3_linkages.csv",
      uploadInputId: "upload_linkages",
    },
    
  ];

  const files_ISM = [
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/ISM/schema_graph.csv",
      filename: "ISM_schema_graph.csv",
      uploadInputId: "upload_schema_graph",
    },
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/ISM/collaborative_scoping.csv",
      filename: "ISM_collaborative_scoping.csv",
      uploadInputId: "upload_collaborative_scoping",
    },
    // {
    //   url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO/correlation.csv",
    //   filename: "ISM_correlation.csv",
    //   uploadInputId: "upload_correlation",
    // },
    // {
    //   url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO/linkages.csv",
    //   filename: "ISM_linkages.csv",
    //   uploadInputId: "upload_linkages",
    // },
    
  ];

  const files_ISMFO = [
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/ISMFO/schema_graph.csv",
      filename: "ISMFO_schema_graph.csv",
      uploadInputId: "upload_schema_graph",
    },
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/ISMFO/collaborative_scoping.csv",
      filename: "ISMFO_collaborative_scoping.csv",
      uploadInputId: "upload_collaborative_scoping",
    },
    // {
    //   url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO/correlation.csv",
    //   filename: "ISMFO_correlation.csv",
    //   uploadInputId: "upload_correlation",
    // },
    // {
    //   url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO/linkages.csv",
    //   filename: "ISMFO_linkages.csv",
    //   uploadInputId: "upload_linkages",
    // },
    
  ];

  // Async function to download files and trigger upload inputs
  const downloadAndUpload= async (files) => {
    for (const file of files) {
      try {
        const response = await fetch(file.url);
        if (!response.ok) throw new Error(`Failed to fetch ${file.url}`);
        const blob = await response.blob();

        // Trigger user file download (you can comment out if not needed)
        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = file.filename;
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        a.remove();

        // Prepare File object for input upload simulation
        const fileObject = new File([blob], file.filename, { type: blob.type });

        const uploadInput = document.getElementById(file.uploadInputId);
        if (uploadInput) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(fileObject);
          uploadInput.files = dataTransfer.files;

          // Dispatch change event to trigger your handler
          const event = new Event("change", { bubbles: true });
          uploadInput.dispatchEvent(event);
        } else {
          console.warn(`Upload input with id '${file.uploadInputId}' not found.`);
        }

        // Wait a short time before next file to avoid conflicts
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error processing ${file.filename}:`, error);
      }
    }
  };

const cellStyle = {
  textAlign: "center"
};

const DatasetsPanel = () => {
  return (   
    <div>
        <Tabs defaultActiveKey="load_schemas" id="data_tab" className="mb-3">
            <Tab eventKey="load_schemas" title="Preload Schemas">
                {/* <span style={{ fontSize: "12px", color: "#555" }}> */}
                    <p style={{ fontSize: "12px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "15px auto" }}>
                        ☑ Downloads and auto-uploads schema_graph.csv, collaborative_scoping.csv, correlation.csv, and linkages.csv.
                    </p>
                        
                    {/* </span> */}

                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Domain</th>
                            <th>Related Schemas</th>
                            <th>Added Unrelated Schema: <a href="https://github.com/jolpica/jolpica-f1" target="_blank" rel="noreferrer"> Formula-One (jolpica-f1)</a> 
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                            Orders-Customers:{" "}
                            <a href="https://github.com/oracle-samples/db-sample-schemas" target="_blank" rel="noreferrer">CO (Oracle)</a>,{" "}
                            <a href="https://www.mysqltutorial.org/getting-started-with-mysql/mysql-sample-database/" target="_blank" rel="noreferrer">classismodels (MySQL)</a>, 
                            <a href="https://developers.sap.com/tutorials/hxe-ua-dbfundamentals-sample-project..html" target="_blank" rel="noreferrer">Sample Project (SAP HANA Academy)</a>
                            </td>
                            <td style={cellStyle}>
                                <Button size="sm" onClick={() => downloadAndUpload(files_OC3)}>
                                    OC3 ☑
                                </Button>
                            </td>
                            <td style={cellStyle}>
                                <Button size="sm" onClick={() => downloadAndUpload(files_OC3FO)}>
                                    OC3-FO ☑
                                </Button>
                            </td>
                        </tr>
                        <tr>
                            <td>
                            Movies:{" "}
                            <a href="https://developer.imdb.com/non-commercial-datasets/" target="_blank" rel="noreferrer">IMDb</a>,{" "}
                            <a href="https://dev.mysql.com/doc/sakila/en/sakila-installation.html" target="_blank" rel="noreferrer">Sakila (MySQL)</a>, 
                            <a href="https://grouplens.org/datasets/movielens/" target="_blank" rel="noreferrer">MovieLens</a>
                            </td>
                            <td style={cellStyle}>
                                <Button size="sm" onClick={() => downloadAndUpload(files_ISM)}>
                                    ISM ☑
                                    {/* IMDbSakilaMovieLens ☑ */}
                                </Button>
                            </td>
                            <td style={cellStyle}>
                                <Button size="sm" onClick={() => downloadAndUpload(files_ISMFO)}>
                                    ISM-FO ☑
                                    {/* IMDbSakilaMovieLens-FO ☑ */}
                                </Button>
                            </td>
                        </tr>
                        </tbody>
                    </Table>
            </Tab>
            <Tab eventKey="import_schemas" title="Import Schemas">
                Import your own Schemas (as .csv dumps) using the Schema Import Python Wizard! 
            </Tab>
        </Tabs>

    </div>
  );
};

export default DatasetsPanel;