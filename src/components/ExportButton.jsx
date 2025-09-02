import React from "react";
import Button from 'react-bootstrap/Button';

const ExportButton = ({ svgRef }) => {
  const exportAsPng = () => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const clonedSvg = svgElement.cloneNode(true);
    
    // Berechne die tatsächliche Größe des Graphen
    const bbox = svgElement.getBBox();
    clonedSvg.setAttribute("width", bbox.width);
    clonedSvg.setAttribute("height", bbox.height);
    clonedSvg.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
    
    const svgString = serializer.serializeToString(clonedSvg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = bbox.width;
    canvas.height = bbox.height;

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, bbox.width, bbox.height);
      const png = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = png;
      link.download = "graph.png";
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
  };

  return <Button size="sm" onClick={exportAsPng} variant="secondary">Export as PNG </Button>;
};

export default ExportButton;

