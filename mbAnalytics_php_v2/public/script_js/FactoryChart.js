/*
 * Classe che mi crea un oggetto di tipo grafico 
 * (inteso come entitÃ , filtri ed area di disegno)
 * in base al tipo di grafico selezionato 
 */

function FactoryChart() {
	
	this.createChart = function (chartEntity) {
      
		var visualChart;
 
    if (chartEntity.chartType == ISTOGRAMMA) {
    	visualChart = new Histogram(chartEntity);
    } else if (chartEntity.chartType == BOXPLOT) {
    	visualChart = new Boxplot(chartEntity);
    } else if (chartEntity.chartType == SCATTERPLOT) {
    	visualChart = new Scatterplot(chartEntity);
    } else if (chartEntity.chartType == PARALLEL_COORDINATE_PLOT) {
    	visualChart = new ParallelCoordinatePlot(chartEntity);
    } else if (chartEntity.chartType == PARALLEL_SET_PLOT) {
    	visualChart = new ParallelSetPlot(chartEntity);
    } else if (chartEntity.chartType == SCATTERPLOT_MATRIX) {
    	visualChart = new ScatterplotMatrix(chartEntity);
    }
 
    return visualChart;
	}
}