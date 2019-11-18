/**
 * Funzioni di utilitÃ  varia
 */

// Funzione per creare un id univoco
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

// Funzione che mi restituisce il grafico dati:
// - chartList: la lista dei grafici
// - chartId: l'id del grafico
function getChartFromList(chartList, chartId) {
		
	if ((chartList[chartId] == undefined) ||
		  (chartList[chartId] == null)) {
		return null;
	}
	
	return chartList[chartId];
}

// Funzione che dato un numero mi restituisce il numero di decimali
function getDecimalNumber(number) {
  return (number.toString().split('.')[1] || []).length;
}