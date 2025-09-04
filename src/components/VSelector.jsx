import React from "react";
// import useVisibilityManager from "./VisibilityManager"; // Neuer Import

const VSelector = ({ vValue, setVValue, validityData, graphNodes = [], refreshGraph }) => {
  // const { updateHiddenNodes } = useVisibilityManager(); // Hook verwenden

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
      if ((node.type === "schema") | (node.id === "base")) {
        return; // Skip update for schema type nodes
      }
      if (matchingData) {
        node.setOverallAgreement(matchingData.overall_agreement);
        node.setPredictLinkability(matchingData.predict_linkability);
        node.setConfusion(matchingData.confusion);
        node.setV(matchingData.v);


        // Dynamically assign agree flags
        Object.keys(matchingData).forEach(key => {
          if (key.endsWith('_agree')) {
            const value = matchingData[key];
            node.setAgreeFlag(key, value);
          }
        });

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
      // updateHiddenNodes(graphNodes);
      // console.log("Versteckte Nodes nach Update:", updateHiddenNodes(graphNodes));
    } else {
      console.warn("Keine GraphNodes zum Aktualisieren vorhanden.");
    }
  };

  return (
    <div id="v_selector"style={{
          display: "flex",
          alignItems: "center",   // vertically center items
          justifyContent: "flex-end", // Align items to the right horizontally
          gap: "5px"            // optional spacing between items
        }}>
      <label htmlFor="vRange"><i>Model Variance</i></label>
      <input
        type="range"
        id="vRange"
        min="1"
        max="99"
        value={vValue}
        onChange={(e) => handleVChange(Number(e.target.value))}
      />
      <span>{(vValue/100).toFixed(2)}</span> 
    </div> 
  );
};

export default VSelector;



