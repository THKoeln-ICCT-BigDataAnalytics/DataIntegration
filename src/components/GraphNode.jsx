class GraphNode {
    constructor(id, name, parentId = null, schema) {
      this.id = id;
      this.name = name;
      this.parentId = parentId;
      this.children = []
      this.schema = schema;
    }
  
    addChild(childNode) {
      this.children.push(childNode);
    }
  }
  
  export default GraphNode; // <--- Jetzt ein Default-Export!
  