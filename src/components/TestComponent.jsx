import React, { useState } from "react";

const TestComponent = ({ node }) => {
  if (!node) {
    return <p>Kein Knoten ausgewählt.</p>;
  }

  const [showDetails, setShowDetails] = useState(true); // Details standardmäßig sichtbar

  return (
    <div>
      <h3>{node.name}</h3>
      {showDetails && (
        <table>
          <tbody>
            {Object.entries(node).map(([key, value]) => (
              <tr key={key}>
                <td><strong>{key}</strong></td>
                <td>{typeof value === "object" ? "[Objekt]" : value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TestComponent;