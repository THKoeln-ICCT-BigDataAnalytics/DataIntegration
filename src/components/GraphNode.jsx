class GraphNode {
  constructor(id, name, parentId = null, schema) {
    this.id = id;
    this.name = name;
    this.parentId = parentId;
    this.children = [];
    this.schema = schema;
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
}

export default GraphNode;
