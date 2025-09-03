import React from "react";
import * as d3 from "d3";
import GraphNode from "./GraphNode";
import Form from 'react-bootstrap/Form';

const CsvUploader = ({ onDataLoaded }) => {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsedData = d3.csvParse(text);

      console.log("Eingelesene CSV-Daten:", parsedData); // Debugging

      // Erzeuge eine Map von ID zu GraphNode
      const nodesMap = new Map();
      parsedData.forEach(row => {
        const parentId = row.parent_id && row.parent_id.trim() !== "" ? row.parent_id : null;
        const node = new GraphNode(row.id, row.name, parentId, row.schema);

        // Speichere alle CSV-Spalten als Attribute
        Object.keys(row).forEach(key => {
          node[key] = row[key];
        });
        
        nodesMap.set(row.id, node);
      });

      // Fehlende Elternknoten erkennen und ggf. ergänzen
      const missingParents = new Set();
      nodesMap.forEach(node => {
        if (node.parentId && !nodesMap.has(node.parentId)) {
          console.warn(`Fehlender Elternknoten für ID: ${node.id}, erwartet: ${node.parentId}`);
          missingParents.add(node.parentId);
        }
      });
      
      // Falls gewünscht, Platzhalter für fehlende Eltern erstellen und als virtuelle Entity markieren
      missingParents.forEach(parentId => {
        const placeholder = new GraphNode(parentId, `Platzhalter ${parentId}`);
        placeholder.isVirtual = true; // Virtuelle Entity markieren
        nodesMap.set(parentId, placeholder);
      });

      // Setze Eltern-Kind-Beziehungen
      nodesMap.forEach(node => {
        if (node.parentId && nodesMap.has(node.parentId)) {
          nodesMap.get(node.parentId).addChild(node);
        }
      });

      let rootNodes = Array.from(nodesMap.values()).filter(node => node.parentId === null);
      
      // Falls mehrere unabhängige Graphen existieren, verbinde sie mit einem Base-Knoten
      if (rootNodes.length > 1) {
        const baseNode = new GraphNode("base", "Base Node", null);
        baseNode.isVirtual = true; // Base-Knoten als virtuelle Entity markieren
        rootNodes.forEach(node => baseNode.addChild(node));
        rootNodes = [baseNode];
        console.warn("Mehrere unabhängige Graphen gefunden. Base-Knoten hinzugefügt.", baseNode);
      }
      
      // Debugging: Prüfen, ob die Daten korrekt an Graph gesendet werden
      if (onDataLoaded) {
        console.log("Daten an Graph senden:", rootNodes);
        onDataLoaded(rootNodes);
      } else {
        console.error("onDataLoaded ist nicht definiert!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <Form.Group controlId="upload_schema_graph" className="mb-3">
        <Form.Control type="file" onChange={handleFileUpload} size="sm"/>
      </Form.Group>
    </div>
  );
};

export default CsvUploader;
