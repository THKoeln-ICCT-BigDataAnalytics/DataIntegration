class GraphNode { 
  constructor(id, name, parentId = null, schema) {
    this.id = id;
    this.name = name;
    this.parentId = parentId;
    this.children = [];
    this.schema = schema;
    this.type = "";
    this.parent_id = "";
    this.parent_name	= "";
    this.datatype	= "";
    this.description	= "";
    this.constraints	= "";
    this.instances	= "";
    this.text_sequence	= "";
    this.instance_sequence	= ""; 
    this.dataframe = "";

    // Standardwerte für Attribute setzen
    this.agreeFlags = {};
    this.overall_agreement = 0;
    this.predict_linkability = 0;
    this.confusion = 0;  // Korrigierter Wert
    this.v = 0;

    // Linkages
    this.highestlink = 0;
    this.secondhighestlink = 0;
    this.thirdhighestlink = 0;
    this.allLinks = [];  // Neues Attribut als leeres Array
  }

  addChild(childNode) {
    this.children.push(childNode);
  }

  // Method to set agree flag dynamically
  setAgreeFlag(flagKey, value) {
    this.agreeFlags[flagKey] = value;
  }

  // Method to get agree flag dynamically
  getAgreeFlag(flagKey) {
    return this.agreeFlags[flagKey] || 0;
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