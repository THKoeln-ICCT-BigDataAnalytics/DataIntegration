import React from "react";

const VSelector = ({ vValue, setVValue, validityData, graphNodes = [] }) => {
  const handleVChange = (newV) => {
    setVValue(newV);

    if (graphNodes && graphNodes.length > 0) {
      graphNodes.forEach((node) => {
        const matchingData = validityData.find(
          (data) => data.id === node.id && data.v === newV
        );

        if (matchingData) {
          node.setOverallAgreement(matchingData.overall_agreement);
          node.setPredictLinkability(matchingData.predict_linkability);
          node.setConfusion(matchingData.confusion);
          node.setV(matchingData.v);
        }
      });

      console.log("GraphNodes nach V-Update:", graphNodes);
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
        style={{ width: "300px", marginLeft: "10px" }}
      />
    </div>
  );
};

export default VSelector;
