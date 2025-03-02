import React, { useState } from "react";

const TestComponent = ({ node }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div>
      <h3>{node.name}</h3>
      <button onClick={() => setShowDetails(!showDetails)}>
        Test
      </button>
      {showDetails && (
        <table>
          <tbody>
            {Object.entries(node).map(([key, value]) => (
              <tr key={key}>
                <td><strong>{key}</strong></td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TestComponent;
