class ValidityChecker {
    constructor() {
      this.dataMap = new Map();
    }
  
    // CSV-Daten einlesen und strukturieren
    loadCSVData(csvData) {
      csvData.forEach(entry => {
        const { id, v, predict_liability } = entry;
        if (!this.dataMap.has(id)) {
          this.dataMap.set(id, new Map());
        }
        this.dataMap.get(id).set(Number(v), predict_liability === 'true');
      });
      console.log("Erzeugte DataMap:", this.dataMap);
    }
  
    // Validität basierend auf id und v prüfen
    isValid(id, v) {
      if (this.dataMap.has(id)) {
        const vMap = this.dataMap.get(id);
        return vMap.get(v) ?? null; // Gibt null zurück, wenn kein Eintrag vorhanden
      }
      return null; // ID existiert nicht
    }
  }
  
  export default ValidityChecker;