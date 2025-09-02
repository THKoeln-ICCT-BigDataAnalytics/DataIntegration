import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Table from 'react-bootstrap/Table';

const cellStyle = {
  textAlign: "center"
};

const TestComponent = ({ node }) => {
  if (!node) {
    return (
      <Button variant="light" size="sm">
        Click on a node to show Details 
      </Button>
    )
  }

  const [showDetails, setShowDetails] = useState(true); // Details standardmäßig sichtbar
  const [show, setShow] = useState(true);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="primary" onClick={handleShow} size="sm">
        Show Details of {node.name} 
      </Button>

      <Offcanvas show={show} onHide={handleClose} placement='end'>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{node.name}</Offcanvas.Title> 
          {/* Instead Node Details as string I would like to show the node.name attribute value */}
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Table>
          <tbody>
            <tr key="metadata-header"><td colSpan={2} style={cellStyle}><strong>Metadata Overview</strong></td></tr>
            {Object.entries(node).flatMap(([key, value]) => {
              if (key === "agreeFlags" && typeof value === "object" && value !== null) {
                // For agreeFlags object, return one <tr> per key inside it
                return [<tr key="linkability-header"><td colSpan={2} style={cellStyle}><strong>Linkability Assessment</strong></td></tr>,
                   Object.entries(value).map(([agreeKey, agreeValue]) => (
                  <tr key={agreeKey}>
                    <td><strong>{agreeKey}</strong></td>
                    <td>{agreeValue}</td>
                  </tr>
                ))]
              } else {
                // For all other keys, render a single row
                return (
                  <tr key={key}>
                    <td><strong>{key}</strong></td>
                    <td>{typeof value === "object" ? "[Objekt]" : value}</td>
                  </tr>
                );
              }
            })}
          </tbody>
        </Table>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default TestComponent;

    // <div>
    //   <h3>{node.name}</h3>
    //   {showDetails && (
    //     <table>
    //       <tbody>
    //         {Object.entries(node).map(([key, value]) => (
    //           <tr key={key}>
    //             <td><strong>{key}</strong></td>
    //             <td>{typeof value === "object" ? "[Objekt]" : value}</td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   )}
    // </div>

