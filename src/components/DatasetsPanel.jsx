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
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3/correlation.csv",
      filename: "OC3_correlation.csv",
      uploadInputId: "upload_correlation",
    },
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3/linkages.csv",
      filename: "OC3_linkages.csv",
      uploadInputId: "upload_linkages",
    },
    
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
      filename: "OC3FO_linkages.csv",
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
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/ISM/correlation.csv",
      filename: "ISM_correlation.csv",
      uploadInputId: "upload_correlation",
    },
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/ISM/linkages.csv",
      filename: "ISM_linkages.csv",
      uploadInputId: "upload_linkages",
    },
    
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
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/ISMFO/correlation.csv",
      filename: "ISMFO_correlation.csv",
      uploadInputId: "upload_correlation",
    },
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/ISMFO/linkages.csv",
      filename: "ISMFO_linkages.csv",
      uploadInputId: "upload_linkages",
    },
    
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




const DatasetsPanel = ({ vValue,  schemas, validityData, correlationData}) => {
  return (   
    <div>
        <Tabs defaultActiveKey="load_schemas" id="data_tab" className="mb-3" justify>
            <Tab eventKey="contact" title="SCOPER" disabled>
            </Tab>
            
            <Tab eventKey="load_schemas" title="Preload Schemas (DEMO)">
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th><p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "5px auto" }}>Domain</p></th>
                            <th><p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "5px auto" }}>Related Schemas</p></th>
                            <th><p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "5px auto" }}>+Irrelevant</p>
                              <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "5px auto" }}> 
                                <a href="https://github.com/jolpica/jolpica-f1" target="_blank" rel="noreferrer"> Formula-One</a> </p>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                            <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "5px auto" }}>
                            Orders-Customers:{" "}
                            <a href="https://github.com/oracle-samples/db-sample-schemas" target="_blank" rel="noreferrer">CO (Oracle)</a>,{" "}
                            <a href="https://www.mysqltutorial.org/getting-started-with-mysql/mysql-sample-database/" target="_blank" rel="noreferrer">classismodels (MySQL)</a>, {" "}
                            <a href="https://developers.sap.com/tutorials/hxe-ua-dbfundamentals-sample-project..html" target="_blank" rel="noreferrer">Sample Project (SAP HANA Academy)</a>
                            </p>
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
                            <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "5px auto" }}>
                            Films-Artists:{" "}
                            <a href="https://developer.imdb.com/non-commercial-datasets/" target="_blank" rel="noreferrer">IMDb</a>,{" "}
                            <a href="https://dev.mysql.com/doc/sakila/en/sakila-installation.html" target="_blank" rel="noreferrer">Sakila (MySQL)</a>, {" "} 
                            <a href="https://grouplens.org/datasets/movielens/" target="_blank" rel="noreferrer">MovieLens</a>
                            </p> 
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
                    <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "5px auto" }}>
                        ☑ Auto-imports a) schema_graph.csv, b) collaborative_scoping.csv, c) correlation.csv, and d) linkages.csv.
                    </p>
            </Tab>
            <Tab eventKey="import_schemas" title="Import Schemas">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item">
                     <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "3px auto" }}>
                        #1 Download <a href="https://github.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/blob/main/python/Scoper.py" target="_blank">Scoper.py</a> and navigate to its folder in your comand shell (e.g., <kbd>cmd.exe</kbd>).
                     </p>
                  </li>
                  {/* <li class="list-group-item">
                    <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "3px auto" }}>
                        #2 Open your comand shell (e.g., <kbd>cmd.exe</kbd>)
                     </p>
                  </li> */}
                  <li class="list-group-item">
                     <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "3px auto" }}>
                        #2 Run Scoper along with the Polystore path (e.g., "C:\...\polystore") containing named schema folders with tables as .csv files.
                      </p>
                     <pre><code>python Scoper.py "C:\...\polystore"</code> </pre>
                  </li>
                  <li class="list-group-item">
                    <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "3px auto" }}>
                        #3 Import a) schema_graph.csv, b) collaborative_scoping.csv, c) correlation.csv, and d) linkages.csv to explore your Polystore.
                    </p> 
                  </li>
                </ul>
            </Tab>

            <Tab eventKey="linkability_statistics" title="Linkability Statistics">
              <div className="container-fluid my-4"> 
                <div className="row">
                  {/* vValue: {vValue} */}
                
                  <div id="linkability_statistics_assesor" className="col-xl-8 mb-2">
                    {validityData && validityData.length > 0 ? (
                      <Table striped bordered hover style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "5px auto" }}>
                        <thead>
                          <tr>
                            <th style={cellStyle}></th>
                            {Object.keys(schemas).map(schema => (
                              <th style={cellStyle} key={schema}>{schema}</th>
                            ))}
                            <th style={cellStyle}>∑ {validityData.filter(d => String(d.predict_linkability).toUpperCase() === "TRUE").length} / {validityData.length} 
                               &nbsp; ({(100 - validityData.filter(d => String(d.predict_linkability).toUpperCase() === "TRUE").length / validityData.length * 100).toFixed(2)}%)
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {Object.keys(schemas).map((schema_a, i) => (
                            <tr key={schema_a}>
                              <td style={cellStyle}>{schema_a}</td>
                              {Object.keys(schemas).map((schema_b) => (
                                schema_a !== schema_b ? (
                                  <td key={schema_b} style={cellStyle}>
                                    {validityData.filter(d => d.schema === schema_a && d[(schema_b + "_agree")] === "1").length}
                                    :
                                    {validityData.filter(d => d.schema === schema_a && d[schema_b + "_agree"] === "0").length}
                                  </td>
                                ) : (
                                  <td key={schema_b} style={cellStyle}>
                                    -
                                  </td>
                                )
                              ))}
                            
                              <td style={cellStyle}>
                                {validityData.filter(d => d.schema === schema_a && String(d.predict_linkability).toUpperCase() === "TRUE").length} / {validityData.filter(d => d.schema === schema_a).length}
                                &nbsp; ({(100 - validityData.filter(d => d.schema === schema_a && String(d.predict_linkability).toUpperCase() === "TRUE").length / validityData.filter(d => d.schema === schema_a).length * 100).toFixed(2)}%)
                              </td>
                            </tr>
                          ))}
                          {/* <tr>
                            <td>∑</td>
                            <td colSpan={Object.keys(schemas).length}></td>
                          </tr> */}
                        </tbody>
                      </Table>
                    ) : ("Upload collaborative_scoping.csv")}
                    <center>
                      <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "5px auto" }}>
                        Linkable:Unlinkable and ∑ Linkable/All (Reduction in %) Ratios (LinkabilityAssessor)
                      </p>
                    </center>
                  </div>

                  <div id="linkability_statistics_correlator" className="col-xl-4 mb-2">
                    
                    {correlationData && correlationData.length > 0 ? (
                      <Table size="sm" striped bordered hover style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "5px auto" }}>
                        {/* <thead>
                          <tr>
                            <th>Schema A</th>
                            <th>Schema B</th>
                            <th>Correlation</th>
                          </tr>
                        </thead> */}
                        <tbody>
                          {correlationData.slice().sort((a, b) => b.correlation_value - a.correlation_value).map((item, index) => (
                            <tr key={index}>
                              <td>{index+1}</td>
                              <td style={cellStyle}>{item.schema_a}</td>
                              <td style={cellStyle}>{item.schema_b}</td>
                              <td style={{cellStyle, color: item.correlation_value > 0 ? "#28a745" : (item.correlation_value < 0 ? "#dc3545" : "inherit")}}>{item.correlation_value.toFixed(2)}</td> 
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : ("Upload correlation.csv")}
                    <center>
                      <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "5px auto" }}>
                        Schema-Pair Ranking (LinkabilityCorrelator)
                      </p>
                    </center>
                  </div>
                </div>
              </div>

            </Tab>
        </Tabs>

    </div>
  );
};

export default DatasetsPanel;