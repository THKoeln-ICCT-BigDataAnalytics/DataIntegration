import GraphNode from "./GraphNode"; // Pfad anpassen

class LinkDataManager {
  constructor(csvData, linkData) {
    this.csvData = csvData; // Direkt die Originaldaten verwenden
    this.linkData = linkData;
  }

  // Rekursive Funktion zum Durchlaufen und Aktualisieren aller Nodes (Links hinzufügen)
  updateNodeWithLinks(node) {
    // Suche alle Einträge in linkData, deren entity_a_id mit der node.id übereinstimmt
    const matchingLinks = this.linkData.filter(link => link.entity_a_id === node.id);

    // Wenn es passende Links gibt, füge sie einzeln mit addLink hinzu
    if (matchingLinks.length > 0) {
      matchingLinks.forEach(link => {
        node.addLink(link); // addLink wird für jeden einzelnen Link aufgerufen
        console.log(`Link für Node ${node.id} mit addLink hinzugefügt:`, link);
      });
    }

    // Rekursiv alle Kinder durchlaufen
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => this.updateNodeWithLinks(child));
    }
  }

  // Rekursive Funktion zum Setzen der höchsten Links
  setHighestLinks(node) {
    if (node.allLinks && node.allLinks.length > 0) {
      // Sortiere Links nach cosine_similarity absteigend
      const sortedLinks = [...node.allLinks].sort((a, b) => {
        const valueA = a.cosine_similarity !== undefined ? parseFloat(a.cosine_similarity) : 0;
        const valueB = b.cosine_similarity !== undefined ? parseFloat(b.cosine_similarity) : 0;
        return valueB - valueA; // Höchster Wert zuerst
      });

      // Setze höchsten, zweithöchsten und dritthöchsten Link als String mit cosine_similarity und entity_b_id
      if (sortedLinks[0]) {
        const highestStr = `${sortedLinks[0].cosine_similarity} - ${sortedLinks[0].entity_b_id}`;
        node.setHighestLink(highestStr);
        console.log(`Highest Link für Node ${node.id} gesetzt:`, highestStr);
      }
      if (sortedLinks[1]) {
        const secondStr = `${sortedLinks[1].cosine_similarity} - ${sortedLinks[1].entity_b_id}`;
        node.setSecondHighestLink(secondStr);
        console.log(`Second Highest Link für Node ${node.id} gesetzt:`, secondStr);
      }
      if (sortedLinks[2]) {
        const thirdStr = `${sortedLinks[2].cosine_similarity} - ${sortedLinks[2].entity_b_id}`;
        node.setThirdHighestLink(thirdStr);
        console.log(`Third Highest Link für Node ${node.id} gesetzt:`, thirdStr);
      }
    }

    // Rekursiv alle Kinder durchlaufen
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => this.setHighestLinks(child));
    }
  }

  updateCsvData() {
    console.log("LinkDataManager - Übergebene csvData:", this.csvData);
    console.log("LinkDataManager - Übergebene linkData:", this.linkData);

    // Schritt 1: Füge alle Links hinzu
    this.csvData.forEach(node => this.updateNodeWithLinks(node));

    // Schritt 2: Setze die höchsten Links
    this.csvData.forEach(node => this.setHighestLinks(node));

    return this.csvData;
  }
}

export default LinkDataManager;