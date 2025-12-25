class AdverseReactionReportsChartView {

    #canvas;
    #chart;

    constructor(canvas) {
        this.#canvas = canvas;
    }

    displayChart(ADRDescr) {
        if (this.#chart != null) {
            this.#chart.destroy();
        }
        this.#chart = new Chart(
            this.#canvas,
            {
                type: 'bar',
                plugins: [ChartDataLabels],
                data: this.#getData(ADRDescr),
                options: this.#getOptions()
            });
    }

    setData(histoDescr) {
        const data = this.#getData(histoDescr);
        this.#chart.config.data = data;
        this.#chart.update();
    }

    #getData(ADRDescr) {
        return {
            labels: [
                'Deaths',
                'Disabilities',
                'Life-Threatening Illnesses',
                'Hospitalizations',
                'Other Adverse Events'
            ],
            datasets: [{
                label: 'Number of Reports',
                data: [
                    ADRDescr['Deaths'],
                    ADRDescr['Disabilities'],
                    ADRDescr['Life-Threatening Illnesses'],
                    ADRDescr['Hospitalizations'],
                    ADRDescr['Adverse Reaction Reports'] - (ADRDescr['Deaths'] + ADRDescr['Disabilities'] + ADRDescr['Life-Threatening Illnesses'] + ADRDescr['Hospitalizations'])
                ],
                backgroundColor: [
                    '#dc3545',  // Deaths - red
                    '#fd7e14',  // Disabilities - orange
                    '#ffc107',  // Life-Threatening - yellow
                    '#17a2b8',  // Hospitalizations - cyan
                    '#6c757d'   // Other - gray
                ],
                borderWidth: 0,
                borderRadius: 4
            }]
        };
    }

    #getOptions() {
        return {
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'top'
                }
            },
            title: {
                display: true,
                position: 'top'
            },
            scales: {
                y: {
                    ticks: {
                        precision: 0
                    },
                    title: {
                        display: true,
                        text: 'Frequency'
                    }
                }
            }
        };
    }
}