import React, { useMemo } from "react";
import getColorForSchema from "./SchemaColorMapping";

const FilterSchemasLinkability = ({schemasLinkability, setSchemasLinkability, refreshGraph}) => { 
  const handleToggle = (schema) => {
    setSchemasLinkability(prev => ({
      ...prev,
      [schema]: !prev[schema],
    }));
    refreshGraph();
  };

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
      {Object.keys(schemasLinkability).map(schema => (
        <div
          key={schema}
          style={{
            display: "flex",
            alignItems: "center",
            border: `1px solid ${getColorForSchema(schema)}`,
            borderRadius: 4,
            padding: "2px 6px",
            gap: "6px"
          }}
        >
          <label style={{ margin: 0, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={!!schemasLinkability[schema]}
              onChange={() => handleToggle(schema)}
            />
            <span style={{ marginLeft: 4 }}>{schema}</span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default FilterSchemasLinkability;
