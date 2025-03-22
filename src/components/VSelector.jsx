import React from "react";
import useVisibilityManager from "./VisibilityManager"; // Neuer Import

const VSelector = ({ vValue, setVValue, validityData, graphNodes = [], refreshGraph }) => {
  const { updateHiddenNodes } = useVisibilityManager(); // Hook verwenden

  const handleVChange = (newV) => {
    setVValue(newV);

    console.log("--- Debugging VSelector ---");
    console.log("V-Wert geändert auf:", newV);
    console.log("Validity Data:", validityData);
    console.log("Graph Nodes vor Update:", graphNodes);

    const updateNodeRecursively = (node) => {
      // Zuerst Kinder aktualisieren (falls vorhanden)
      if (node.children && node.children.length > 0) {
        node.children.forEach(updateNodeRecursively);
      }

      // Dann sich selbst aktualisieren
      const matchingData = validityData.find(
        (data) => data.id === node.id && Number(data.v) === newV
      );

      if (matchingData) {
        node.setOverallAgreement(matchingData.overall_agreement);
        node.setPredictLinkability(matchingData.predict_linkability);
        node.setConfusion(matchingData.confusion);
        node.setV(matchingData.v);

        node.setOCOracle(matchingData.OC_ORACLE);
        node.setOCMySQL(matchingData.OC_MYSQL);
        node.setOCSAP(matchingData.OC_SAP);
        node.setFormula(matchingData.FORMULA);

        node.setOCOracleAgree(matchingData.OC_ORACLE_agree);
        node.setOCMySQLAgree(matchingData.OC_MYSQL_agree);
        node.setOCSAPAgree(matchingData.OC_SAP_agree);
        node.setFormulaAgree(matchingData.FORMULA_agree);

        // Debugging für aktualisierte Knoten
        console.log(`Node ${node.id} aktualisiert:`, matchingData);
      } else {
        console.warn(`Keine Übereinstimmung für Node ${node.id} mit v=${newV}`);
      }
    };

    if (graphNodes && graphNodes.length > 0) {
      graphNodes.forEach(updateNodeRecursively);

      console.log("GraphNodes nach V-Update:", graphNodes);

      // ❗❗❗ Graph aktualisieren, damit die Änderungen sichtbar werden
      refreshGraph();

      // **Visibility-Manager aufrufen und Debugging-Log hinzufügen**
      updateHiddenNodes(graphNodes);
      console.log("Versteckte Nodes nach Update:", updateHiddenNodes(graphNodes));
    } else {
      console.warn("Keine GraphNodes zum Aktualisieren vorhanden.");
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <label htmlFor="vRange">Wähle V-Wert: {vValue}</label>
      <input
        id="vRange"
        type="range"
        min="1"
        max="99"
        value={vValue}
        onChange={(e) => handleVChange(Number(e.target.value))}
        style={{ width: "300px", marginLeft: "10px", cursor: "pointer" }}
      />
    </div>
  );
};

export default VSelector;
