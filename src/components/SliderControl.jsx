import React from "react";

function SliderControl({ value, setValue }) {
  const handleChange = (event) => {
    setValue(parseFloat(event.target.value));
  };

  return (
    <div style={{ margin: "20px 0" }}>
      <label htmlFor="slider">Schieberegler (0 bis 1): </label>
      <input
        type="range"
        id="slider"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={handleChange}
      />
      <span style={{ marginLeft: "10px" }}>{value.toFixed(2)}</span>
    </div>
  );
}

export default SliderControl;