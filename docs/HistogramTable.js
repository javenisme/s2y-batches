class HistogramTable {

    #tableElement;
    #table;
    #sumFrequencies;

    constructor(tableElement) {
        this.#tableElement = tableElement;
    }

    initialize() {
        this.#table = this.#createEmptyTable();
    }

    display(frequencyBySymptom) {
        const symptom_frequency_pairs = Object.entries(frequencyBySymptom);
        this.#setTableRows(symptom_frequency_pairs);
    }

    #createEmptyTable() {
        return this.#tableElement.DataTable(
            {
                language:
                {
                    searchPlaceholder: "Enter Symptom"
                },
                search:
                {
                    return: false
                },
                processing: true,
                deferRender: true,
                order: [[this.#getColumnIndex('Frequency'), "desc"]],
                columnDefs:
                    [
                        {
                            searchable: true,
                            targets: [
                                this.#getColumnIndex('Symptom')
                            ]
                        },
                        {
                            render: frequency => {
                                const barLenInPercent = frequency / this.#sumFrequencies * 100;
                                // Color code based on frequency
                                let color = '#4caf50'; // Low frequency - green
                                if (barLenInPercent > 10) {
                                    color = '#ff9800'; // Medium frequency - orange
                                }
                                if (barLenInPercent > 20) {
                                    color = '#f44336'; // High frequency - red
                                }

                                return `
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <span style="min-width: 50px; font-weight: bold;">${frequency}</span>
                                        <div style="flex: 1; background: #e0e0e0; border-radius: 4px; height: 24px; position: relative; overflow: hidden;">
                                            <div style="background: ${color}; height: 100%; width: ${barLenInPercent}%; border-radius: 4px; transition: width 0.3s ease;">
                                            </div>
                                        </div>
                                        <span style="min-width: 50px; font-size: 0.9em; color: #666;">${barLenInPercent.toFixed(1)}%</span>
                                    </div>
                                `;
                            },
                            targets: [this.#getColumnIndex('Frequency')]
                        }
                    ]
            });
    }

    #getColumnIndex(columnName) {
        switch (columnName) {
            case 'Symptom':
                return 0;
            case 'Frequency':
                return 1;
        }
    }

    #setTableRows(symptom_frequency_pairs) {
        this.#sumFrequencies = this.#getSumFrequencies(symptom_frequency_pairs);
        this.#table
            .clear()
            .rows.add(symptom_frequency_pairs)
            .draw();
    }

    #getSumFrequencies(symptom_frequency_pairs) {
        const frequencies = symptom_frequency_pairs.map(symptom_frequency_pair => symptom_frequency_pair[1])
        return Utils.sum(frequencies);
    }
}
