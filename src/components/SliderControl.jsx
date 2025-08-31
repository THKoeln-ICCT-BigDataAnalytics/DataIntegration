import React from "react";
//Aktualisierung triggert automatisch ohne weitere Implementierung die Veränderung der Verlinkungen. Wird auch hier refreshGraph ausgelöst
function SliderControl({ value, setValue }) {
  const handleChange = (event) => {
    setValue(parseFloat(event.target.value));
  };

  return (
    <div id="sim_selector" 
          style={{
          display: "flex",
          alignItems: "center",  // vertically center items
          justifyContent: "flex-end", // Align items to the right horizontally
          gap: "5px"            // optional spacing between items
        }}>
      <label htmlFor="slider"><i>Similarity Threshold</i></label>
      <input
        type="range"
        id="slider"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={handleChange}
      />
      <span>{value.toFixed(2)}</span>
    </div>
  );
}

export default SliderControl;