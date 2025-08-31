import React, { useState, useEffect } from "react";
import CsvUploader from "./components/CsvUploader";
import Graph from "./components/Graph";
import TestComponent from "./components/TestComponent";
import ValidityCheckerButton from "./components/ValidityCheckerButton";
import CorrelationLinkButton from "./components/CorrelationLinkButton"; 
import LinkDataButton from "./components/LinkDataButton";
import VSelector from "./components/VSelector";
import LinkDataManager from "./components/LinkDataManager";
import SliderControl from "./components/SliderControl";

function App() {
  const [csvData, setCsvData] = useState([]);
  const [validityData, setValidityData] = useState([]);
  const [linkData, setLinkData] = useState([]);
  const [correlationData, setCorrelationData] = useState([]); 
  const [selectedNode, setSelectedNode] = useState(null);
  const [showTest, setShowTest] = useState(false);
  const [vValue, setVValue] = useState(1);
  const [graphKey, setGraphKey] = useState(0);
  const [sliderValue, setSliderValue] = useState(0.5);

  const refreshGraph = () => {
    setGraphKey(prevKey => prevKey + 1);
    console.log("🔄 Graph wird neu gezeichnet!");
  };

  useEffect(() => {
    if (csvData.length > 0 && linkData.length > 0) {
      const manager = new LinkDataManager(csvData, linkData);
      const newCsvData = manager.updateCsvData();
      setCsvData([...newCsvData]);
      if (selectedNode) {
        const updatedNode = findNodeById(newCsvData, selectedNode.id);
        if (updatedNode) {
          setSelectedNode(updatedNode);
        }
      }
    }
  }, [linkData]);

  const findNodeById = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children && node.children.length > 0) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

    // Files info for download + auto upload
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

  const files_IMDbSakilaMovieLens = [
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/IMDbSakilaMovieLens/schema_graph.csv",
      filename: "IMDbSakilaMovieLens_schema_graph.csv",
      uploadInputId: "upload_schema_graph",
    },
    {
      url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/IMDbSakilaMovieLens/collaborative_scoping.csv",
      filename: "IMDbSakilaMovieLens_collaborative_scoping.csv",
      uploadInputId: "upload_collaborative_scoping",
    },
    // {
    //   url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO/correlation.csv",
    //   filename: "IMDbSakilaMovieLens_correlation.csv",
    //   uploadInputId: "upload_correlation",
    // },
    // {
    //   url: "https://raw.githubusercontent.com/THKoeln-ICCT-BigDataAnalytics/DataIntegration/refs/heads/main/data/OC3FO/linkages.csv",
    //   filename: "IMDbSakilaMovieLens_linkages.csv",
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

  const instructionText = (
    <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", maxWidth: 1800, margin: "15px auto" }}>
      ⚙️ Features: Zoom, Drag & Drop, Export, interactive nodes.<br />
      ℹ️ Note: Shift + click on a table opens a detailed view of the connected objects.<br />
      {/* Double-click opens a detailed view of the linkages<br /><br /> */}
    </p>
  );

  const cellStyle = {
    border: "1px solid #ccc",
    padding: "6px",
    textAlign: "center"
  };

  return (
  <div style={{ textAlign: "center", padding: "20px", minHeight: "100vh", background: "#f8f9fa" }}>
    <h2>Collaborative Scoping in Action</h2>

    {/* Wrap both scenario divs in a flex container */}
    <div style={{ 
      display: "flex", 
      justifyContent: "space-around", 
      alignItems: "flex-start", 
      gap: "20px", 
      width: "100%", 
      maxWidth: "1800px", 
      margin: "20px auto" 
    }}>
      <div 
        id="custom_schema_matching_scenarios"
        style={{ 
          flex: 1,
          padding: "12px 20px", 
          background: "#ecf0f1", 
          borderRadius: 9, 
          boxShadow: "0 2px 8px rgba(44,62,80,.06)",
          textAlign: "center",
        }}
      >
        <h3 style={{ marginBottom: "0.5rem" }}>
          Load Schema Matching Scenarios
        </h3>

        <table style={{ 
          borderSpacing: "0 8px", 
          marginTop: "10px", 
          marginLeft: "auto",
          marginRight: "auto",
          color: "#34495e",
          textAlign: "center",
          borderCollapse: "collapse",  // collapse borders for clean grid
          width:"90%",
          border: "1px solid #ccc",
          fontSize: "12px",
         }}>

          <thead>
            <tr>
              <th style={cellStyle}> Domain </th>
              <th style={cellStyle}> Related Schema</th>
              <th style={cellStyle}> + Unrelated Schema <br></br><a href="https://github.com/jolpica/jolpica-f1" target="_blank">Formula-One (jolpica-f1)</a> </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cellStyle}> Orders-Customers: <a href="https://github.com/oracle-samples/db-sample-schemas" target="_blank">CO (Oracle)</a>, 
                <a href="https://www.mysqltutorial.org/getting-started-with-mysql/mysql-sample-database/" target="_blank">classismodels (MySQL)</a>, <br></br>
                <a href="https://developers.sap.com/tutorials/hxe-ua-dbfundamentals-sample-project..html" target="_blank">Sample Project (SAP HANA Academy)</a> </td>
              <td style={cellStyle}> 
                OC3 ☑</td>
              <td style={cellStyle}> 
                <button style={{padding: "10px 20px", backgroundColor: "#3498db", color: "#fff", cursor: "pointer", marginRight: "18px"}}
                onClick={() => downloadAndUpload(files_OC3FO)}> OC3-FO ☑</button> 
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>Movies: <a href="https://developer.imdb.com/non-commercial-datasets/" target="_blank">IMDb</a>, 
                <a href="https://dev.mysql.com/doc/sakila/en/sakila-installation.html" target="_blank">Sakila (MySQL)</a>,  
                <a href="https://grouplens.org/datasets/movielens/" target="_blank">MovieLens</a> </td>
              <td style={cellStyle}> 
                <button style={{padding: "10px 20px", backgroundColor: "#27ae60", color: "#fff", cursor: "pointer", marginRight: "18px"}} 
                onClick={() => downloadAndUpload(files_IMDbSakilaMovieLens)}> IMDbSakilaMovieLens ☑</button>
              </td>
              <td style={cellStyle}> 
                IMDbSakilaMovieLens-FO ☑
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>Import your own Schemas</td>
              <td style={cellStyle}>Schema Import Python Wizard <br></br>(Automated via .csv dumps)
              </td>
              <td style={cellStyle}> 
                
              </td>
            </tr>

          </tbody>
        </table>
        
        <span style={{ fontSize: "12px", color: "#555" }}>
          ☑ Downloads and auto-uploads schema_graph.csv, collaborative_scoping.csv, correlation.csv, and linkages.csv.
          </span>
        
      </div>

      <div 
        id="individual_schema_matching_scenarios" 
        style={{ 
          flex: 1,
          padding: "12px 20px", 
          background: "#ecf0f1", 
          borderRadius: 9, 
          boxShadow: "0 2px 8px rgba(44,62,80,.06)",
          textAlign: "center",
          color: "#34495e"
        }}>
        
        <h3>
          Visualize your Schema Graph, Collaborative Scoping, Correlation, and Linkages.
        </h3>

        
        <table style={{ 
          borderSpacing: "0 8px", 
          marginTop: "10px", 
          marginLeft: "auto",
          color: "#34495e",
          fontSize: "12px"
         }}>
          <tbody>
            <tr>
              <td style={{ fontWeight: "bold", paddingRight: "12px" }}>Schema Graph</td>
              <td><CsvUploader onDataLoaded={setCsvData} /></td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold", paddingRight: "12px" }}>Collaborative Scoping</td>
              <td>
                <ValidityCheckerButton 
                  onDataLoaded={data => data.length > 0 && setValidityData(data)} 
                />
              </td>
              <td>
                <VSelector 
                  validityData={validityData} 
                  graphNodes={csvData} 
                  vValue={vValue} 
                  setVValue={setVValue} 
                  refreshGraph={refreshGraph}
                />
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold", paddingRight: "12px" }}>Correlation</td>
              <td>
                <CorrelationLinkButton onDataLoaded={data => data.length > 0 && setCorrelationData(data)} />
              </td>
              <td>
                <CorrelationLinkButton.Buttons/>
              </td>
            </tr>
            <tr>
              <td style={{ fontWeight: "bold", paddingRight: "12px" }}>Linkages</td>
              <td>
                <LinkDataButton 
                  onDataLoaded={data => data.length > 0 && setLinkData(data)} 
                />
              </td>
              <td>
                <SliderControl value={sliderValue} setValue={setSliderValue} />
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>


      {/* Main Graph and controls */}
            
      <Graph 
        key={graphKey} 
        data={csvData} 
        onNodeClick={setSelectedNode} 
        sliderValue={sliderValue} 
        correlationData={correlationData}
        currentV={vValue}
      />

      {instructionText}
      

      {/* Clicked Node Information */}
      {selectedNode && (
        <div>
          <button onClick={() => setShowTest(!showTest)}>
            {showTest ? "Hide Details" : "Show Details"}
          </button>
          {showTest && <TestComponent node={selectedNode} />}
        </div>
      )}
    </div>
  );
}

export default App;
