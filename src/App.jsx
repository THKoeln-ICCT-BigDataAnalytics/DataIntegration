import React, { useState, useEffect, useRef } from "react";
import Graph from "./components/Graph";
import DatasetsPanel from "./components/DatasetsPanel";
import TestComponent from "./components/TestComponent";
import LinkDataManager from "./components/LinkDataManager";
import CsvUploader from "./components/CsvUploader";
import ValidityCheckerButton from "./components/ValidityCheckerButton";
import CorrelationLinkButton from "./components/CorrelationLinkButton"; 
import LinkDataButton from "./components/LinkDataButton";
import VSelector from "./components/VSelector";
import SliderControl from "./components/SliderControl";
import ExportButton from "./components/ExportButton";
import FilterSchemas from "./components/FilterSchemas";
import FilterSchemasLinkability from "./components/FilterSchemasLinkability";
import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from 'react-bootstrap/Navbar';


function App() {
  const [csvData, setCsvData] = useState([]);
  const [validityData, setValidityData] = useState([]);
  const [correlationData, setCorrelationData] = useState([]); 
  const [linkData, setLinkData] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [vValue, setVValue] = useState(null);
  const [graphKey, setGraphKey] = useState(0);
  const [tValue, setTValue] = useState(0.5);
  const svgRef = useRef(null);


  const [schemas, setSchemas] = useState([]);
  const [schemasLinkability, setSchemasLinkability] = useState([]);
  const [processedNodes, setProcessedNodes] = useState([]);

  const refreshGraph = () => {
    setGraphKey(prevKey => prevKey + 1);
    console.log("🔄 Graph wird neu gezeichnet!");
  };

  // After nodes are processed in Graph, receive them via callback
  // const handleNodesUpdate = (nodes) => {
    // setProcessedNodes(nodes);

  //   // Initialize visibleSchemaLinkability to all schemas on first load
  //   if (visibleSchemaLinkability.length === 0) {
  //     const schemas = Array.from(new Set(nodes.filter(n => n.data.type === "schema").map(n => n.data.schema)));
  //     setVisibleSchemaLinkability(schemas);
  //   }
  // };

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



  return (
    <div className="container-fluid my-4">
    {/* // <div style={{  minHeight: "100vh", background: "#f8f9fa" }}> */}
      {/* <GenNavbar/> */}
      {/*  mt-5 */}
      <div className="container-fluid my-4" style={{ minHeight: "100vh", background: "#f8f9fa" }}> 
        <div className="row">
              <div className="col-xl-7 mb-2">
                <DatasetsPanel
                  vValue={vValue}
                  schemas={schemas}
                  validityData={validityData.filter(d => Number(d.v) === Number(vValue))}
                  correlationData={correlationData.filter(d => Number(d.v) === Number(vValue))} 
                />
              </div>          
              
          {/* Second Column: import_data */}
          <div className="col-xl-5 mb-2" id="import_data">
            <div style={{
              padding: "12px 20px",
              background: "#ecf0f1",
              borderRadius: 9,
              boxShadow: "0 2px 8px rgba(44,62,80,.06)",
              textAlign: "center"
            }}>
            <h5>Explore and Filter your Polystore</h5>

            
            <table style={{ 
              borderSpacing: "0 8px", 
              marginTop: "10px", 
              marginLeft: "auto",
              color: "#34495e",
              fontSize: "14px"
            }}>
              <tbody>
                <tr>
                  <td style={{color: "#555", fontFamily: "Roboto Mono, monospace", paddingRight: "5px" }}>a)SchemasToGraph</td>

                  <td><CsvUploader onDataLoaded={setCsvData} /></td>
                  <td>
                     <FilterSchemas
                      schemas={schemas}
                      setSchemas={setSchemas}
                      refreshGraph={refreshGraph}
                    />                    
                  </td>
                </tr>
                <tr>
                  <td style={{color: "#555", fontFamily: "Roboto Mono, monospace", paddingRight: "5px" }}>b)LinkabilityAssessor</td>
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
                    <FilterSchemasLinkability
                      vValue={vValue}
                      schemasLinkability={schemasLinkability}
                      setSchemasLinkability={setSchemasLinkability}
                      refreshGraph={refreshGraph}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{color: "#555", fontFamily: "Roboto Mono, monospace", paddingRight: "5px" }}>c)LinkabilityCorrelator</td>
                  <td>
                    <CorrelationLinkButton onDataLoaded={data => data.length > 0 && setCorrelationData(data)} />
                  </td>
                  <td>
                    <CorrelationLinkButton.Buttons/>
                  </td>
                </tr>
                <tr>
                  <td style={{color: "#555", fontFamily: "Roboto Mono, monospace", paddingRight: "5px" }}>d)SemanticMatcher</td>
                  <td>
                    <LinkDataButton 
                      onDataLoaded={data => data.length > 0 && setLinkData(data)} 
                    />
                  </td>
                  <td>
                    <SliderControl tValue={tValue} setTValue={setTValue} />
                  </td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>
    


      {/* Main Graph and controls */}
              
      <Graph
          key={graphKey} 
          data={csvData} 
          onNodesUpdate={setProcessedNodes}
          onNodeClick={setSelectedNode} 
          tValue={tValue}
          vValue={vValue}
          schemas={schemas}
          setSchemas={setSchemas}
          schemasLinkability={schemasLinkability}
          setSchemasLinkability={setSchemasLinkability}
          correlationData={correlationData}
          svgRef={svgRef}
      />
      
      <Navbar fixed="bottom">
        <p style={{ fontSize: "14px", color: "#555", fontFamily: "Roboto Mono, monospace", margin: "15px auto" }}>
          Features: 
          📷 <ExportButton svgRef={svgRef} />
          ⚙️ Zoom, Drag & Drop 
          ⭕ Note: Shift + click on a table pulls its columns closer.
          ℹ️ <TestComponent node={selectedNode} /> 
        </p>
      </Navbar>
      
      

      {/* Clicked Node Information */}
      
    </div>
  </div>
  );
}

export default App;
