class GraphNode {
    constructor(id, name, parentId = null) {
      this.id = id;
      this.name = name;
      this.parentId = parentId;
      this.children = [];
    }
  
    addChild(childNode) {
      this.children.push(childNode);
    }
  }
  
  export default GraphNode; // <--- Jetzt ein Default-Export!
  