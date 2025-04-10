class GraphNode { 
  constructor(id, name, parentId = null, schema) {
    this.id = id;
    this.name = name;
    this.parentId = parentId;
    this.children = [];
    this.schema = schema;
    
    // Standardwerte für Attribute setzen
    this.OC_ORACLE = 0;
    this.OC_MYSQL = 0;
    this.OC_SAP = 0;
    this.FORMULA = 0;
    this.OC_ORACLE_agree = 0;
    this.OC_MYSQL_agree = 0;
    this.OC_SAP_agree = 0;
    this.FORMULA_agree = 0;
    this.overall_agreement = 0;
    this.predict_linkability = 0;
    this.confusion = 0;  // Korrigierter Wert
    this.v = 0;
    this.highestlink = 0;
    this.secondhighestlink = 0;
    this.thirdhighestlink = 0;
    this.allLinks = [];  // Neues Attribut als leeres Array
  }

  addChild(childNode) {
    this.children.push(childNode);
  }

  setOCOracle(value) {
    this.OC_ORACLE = value;
  }

  setOCMySQL(value) {
    this.OC_MYSQL = value;
  }

  setOCSAP(value) {
    this.OC_SAP = value;
  }

  setFormula(value) {
    this.FORMULA = value;
  }

  setOCOracleAgree(value) {
    this.OC_ORACLE_agree = value;
  }

  setOCMySQLAgree(value) {
    this.OC_MYSQL_agree = value;
  }

  setOCSAPAgree(value) {
    this.OC_SAP_agree = value;
  }

  setFormulaAgree(value) {
    this.FORMULA_agree = value;
  }

  setOverallAgreement(value) {
    this.overall_agreement = value;
  }

  setPredictLinkability(value) {
    this.predict_linkability = value;
  }

  setConfusion(value) {
    this.confusion = value;
  }

  setV(value) {
    this.v = value;
  }

  setHighestLink(value) {
    this.highestlink = value;
  }

  setSecondHighestLink(value) {
    this.secondhighestlink = value;
  }

  setThirdHighestLink(value) {
    this.thirdhighestlink = value;
  }

  // Methode zum Hinzufügen eines einzelnen Links
  addLink(linkNode) {
    this.allLinks.push(linkNode);
  }

  // Neue Methode zum Hinzufügen einer Teilmenge aus einem Array
  addLinksFromArray(linkArray, filterCondition = () => true) {
    const filteredLinks = linkArray.filter(filterCondition);
    this.allLinks.push(...filteredLinks);
  }
}

export default GraphNode;