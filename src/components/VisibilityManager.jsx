//durch neuen Lösungsansatz ungenutzt aber es existieren noch ungenutzte Verweise.

import React, { useState } from "react";

const useVisibilityManager = () => {
    const [hiddenNodes, setHiddenNodes] = useState(new Set());

    // Bestimmte Nodes ausblenden, wenn predict_linkability explizit false ist
    const updateHiddenNodes = (graphNodes) => {
        const newHiddenNodes = new Set();
        graphNodes.forEach(node => {
            if (node.predict_linkability === false) {
                newHiddenNodes.add(node.id);
            }
        });
        setHiddenNodes(newHiddenNodes);
        console.log("Versteckte Nodes aktualisiert:", newHiddenNodes);
    };

    // Prüfen, ob eine Node versteckt ist
    const isNodeHidden = (node) => hiddenNodes.has(node.id);

    return { hiddenNodes, updateHiddenNodes, isNodeHidden };
};

export default useVisibilityManager;
