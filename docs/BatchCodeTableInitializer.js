class BatchCodeTableInitializer {

    #chartInstances = new Map();

    initialize({ batchCodeTableElement, showCountriesColumn, showDataTablesFilter }) {
        // Show loading indicator
        this.#showLoadingIndicator(batchCodeTableElement);

        this.#loadBarChartDescriptions(showCountriesColumn)
            .then(barChartDescriptions => {
                const batchCodeTable = this.#createEmptyBatchCodeTable(batchCodeTableElement, showCountriesColumn, barChartDescriptions);
                this.#setVisibilityOfCountriesColumn(batchCodeTable, showCountriesColumn);
                this.#setDataTablesFilter(showDataTablesFilter);
                fetch('data/batchCodeTables/Global.json')
                    .then(response => response.json())
                    .then(json => {
                        this.#addCountriesColumn(json);
                        return json;
                    })
                    .then(json => {
                        this.#setTableRows(batchCodeTable, json.data);
                        this.#makeCompanyColumnSearchable(batchCodeTable);
                        // Hide loading indicator after data is loaded
                        this.#hideLoadingIndicator(batchCodeTableElement);
                    })
                    .catch(error => {
                        console.error('Error loading batch code table:', error);
                        this.#hideLoadingIndicator(batchCodeTableElement);
                    });
            });
    }

    #showLoadingIndicator(tableElement) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'batch-table-loading';
        loadingDiv.style.cssText = 'text-align: center; padding: 20px; font-size: 16px; color: #666;';
        loadingDiv.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Loading batch code data...';
        
        // Get the actual DOM element whether it's jQuery or DOM
        const el = tableElement[0] || tableElement;
        if (el && el.parentElement) {
            el.parentElement.insertBefore(loadingDiv, el);
            el.style.display = 'none';
        }
    }

    #hideLoadingIndicator(tableElement) {
        const loadingDiv = document.getElementById('batch-table-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
        // Get the actual DOM element whether it's jQuery or DOM
        const el = tableElement[0] || tableElement;
        if (el) {
            el.style.display = '';
        }
    }

    #loadBarChartDescriptions(shallLoad) {
        return shallLoad ?
            fetch('data/barChartDescriptionTable.json').then(response => response.json()) :
            Promise.resolve({});
    }

    #createEmptyBatchCodeTable(batchCodeTableElement, showCountriesColumn, barChartDescriptions) {
        const table = batchCodeTableElement.DataTable(
            {
                language:
                {
                    searchPlaceholder: "Enter Batch Code"
                },
                searching: true,
                search:
                {
                    return: false
                },
                processing: true,
                deferRender: true,
                order: [[this.#getColumnIndex('Adverse Reaction Reports'), "desc"]],
                columnDefs:
                    [
                        {
                            searchable: false,
                            targets: [
                                this.#getColumnIndex('Adverse Reaction Reports'),
                                this.#getColumnIndex('Deaths'),
                                this.#getColumnIndex('Disabilities'),
                                this.#getColumnIndex('Life-Threatening Illnesses'),
                                this.#getColumnIndex('Hospitalizations'),
                                this.#getColumnIndex('Severe reports'),
                                this.#getColumnIndex('Lethality')
                            ]
                        },
                        {
                            orderable: false,
                            targets:
                                [
                                    this.#getColumnIndex('Batch'),
                                    this.#getColumnIndex('Company')
                                ]
                        },
                        {
                            render: data => {
                                const numberInPercent = parseFloat(data);
                                return !isNaN(numberInPercent) ? numberInPercent.toFixed(2) + "%" : '';
                            },
                            targets: [
                                this.#getColumnIndex('Severe reports'),
                                this.#getColumnIndex('Lethality')
                            ]
                        },
                        {
                            width: "1000px",
                            render: (data, type, row, meta) => {
                                if (type === 'sort') {
                                    return this.#getJensenShannonDistance(
                                        row[this.#getColumnIndex('Batch')],
                                        barChartDescriptions);
                                }
                                return data;
                            },
                            createdCell: (cell, cellData, row, rowIndex, colIndex) => {
                                if (showCountriesColumn) {
                                    this.#displayBatchcodeByCountryBarChart(
                                        row[this.#getColumnIndex('Batch')],
                                        barChartDescriptions,
                                        cell);
                                }
                            },
                            className: "dt-head-center",
                            targets: [this.#getColumnIndex('Countries')]
                        }
                    ]
            });

        // Add row click handler to expand symptom details
        batchCodeTableElement.on('click', 'tbody tr', (e) => {
            const tr = $(e.currentTarget);
            const row = table.row(tr);
            const batchcode = row.data()[this.#getColumnIndex('Batch')];

            if (row.child.isShown()) {
                // Close the row with animation
                tr.find('.batch-details-container').fadeOut(200, () => {
                    row.child.hide();
                    tr.removeClass('shown');

                    // Cleanup: destroy DataTable if exists
                    const histogramTableId = `#histogram-${batchcode}`;
                    if ($.fn.DataTable.isDataTable(histogramTableId)) {
                        $(histogramTableId).DataTable().destroy();
                    }
                });
            } else {
                // Open the row
                const company = row.data()[this.#getColumnIndex('Company')];
                row.child(this.#createDetailRow(batchcode, company)).show();
                tr.addClass('shown');

                // Load and display histogram data
                this.#loadAndDisplayHistogram(batchcode, tr.next());
            }
        });

        return table;
    }

    #createDetailRow(batchcode, company) {
        return `
            <div class="batch-details-container" style="padding: 20px; background: #f8f9fa;">
                <h3 style="margin-top: 0;">Batch ${batchcode} (${company}) - Symptom Details</h3>
                <div class="loading-message">Loading symptom data...</div>
                <div class="chart-container" style="display: none;">
                    <canvas id="chart-${batchcode}" style="max-height: 300px;"></canvas>
                </div>
                <div class="table-container" style="display: none; margin-top: 20px;">
                    <table id="histogram-${batchcode}" class="display" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Symptom</th>
                                <th>Frequency</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `;
    }

    #loadAndDisplayHistogram(batchcode, detailRow) {
        HistoDescrsProvider.getHistoDescrs(batchcode)
            .then(histoDescrs => {
                const container = detailRow.find('.batch-details-container');
                container.find('.loading-message').hide();

                // Show and populate chart
                const chartContainer = container.find('.chart-container');
                chartContainer.show();
                this.#createAdverseReactionChart(batchcode, histoDescrs);

                // Show and populate symptom table
                const tableContainer = container.find('.table-container');
                tableContainer.show();
                this.#createHistogramTable(batchcode, histoDescrs);
            })
            .catch(error => {
                console.error('Error loading histogram data:', error);
                const container = detailRow.find('.batch-details-container');
                container.find('.loading-message').text('Error loading symptom data. Please try again.');
            });
    }

    #createAdverseReactionChart(batchcode, histoDescrs) {
        const canvas = document.getElementById(`chart-${batchcode}`);
        if (!canvas) return;

        // Destroy existing chart if it exists
        if (this.#chartInstances.has(batchcode)) {
            this.#chartInstances.get(batchcode).destroy();
        }

        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [
                    'Deaths',
                    'Disabilities',
                    'Life-Threatening',
                    'Hospitalizations',
                    'Other Events'
                ],
                datasets: [{
                    label: 'Adverse Events',
                    data: [
                        histoDescrs['Deaths'],
                        histoDescrs['Disabilities'],
                        histoDescrs['Life-Threatening Illnesses'],
                        histoDescrs['Hospitalizations'],
                        histoDescrs['Adverse Reaction Reports'] - (
                            histoDescrs['Deaths'] +
                            histoDescrs['Disabilities'] +
                            histoDescrs['Life-Threatening Illnesses'] +
                            histoDescrs['Hospitalizations']
                        )
                    ],
                    backgroundColor: [
                        '#dc3545',
                        '#fd7e14',
                        '#ffc107',
                        '#17a2b8',
                        '#6c757d'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });

        // Store chart instance for cleanup
        this.#chartInstances.set(batchcode, chart);
    }

    #createHistogramTable(batchcode, histoDescrs) {
        const histogram = histoDescrs.histogram;
        const symptomFrequencyPairs = Object.entries(histogram)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 50); // Show top 50 symptoms

        const sumFrequencies = symptomFrequencyPairs.reduce((sum, pair) => sum + pair[1], 0);

        $(`#histogram-${batchcode}`).DataTable({
            data: symptomFrequencyPairs,
            pageLength: 10,
            order: [[1, "desc"]],
            columnDefs: [
                {
                    targets: 1,
                    render: (frequency) => {
                        const barWidth = (frequency / sumFrequencies * 100).toFixed(1);
                        return `
                            <div style="display: flex; align-items: center;">
                                <span style="min-width: 40px;">${frequency}</span>
                                <div style="flex: 1; margin-left: 10px; background: #e9ecef; border-radius: 3px;">
                                    <div style="background: #007bff; height: 20px; width: ${barWidth}%; border-radius: 3px;"></div>
                                </div>
                            </div>
                        `;
                    }
                }
            ]
        });
    }

    #getColumnIndex(columnName) {
        switch (columnName) {
            case 'Batch':
                return 0;
            case 'Adverse Reaction Reports':
                return 1;
            case 'Deaths':
                return 2;
            case 'Disabilities':
                return 3;
            case 'Life-Threatening Illnesses':
                return 4;
            case 'Hospitalizations':
                return 5;
            case 'Company':
                return 6;
            case 'Severe reports':
                return 7;
            case 'Lethality':
                return 8;
            case 'Countries':
                return 9;
        }
    }

    #getJensenShannonDistance(batchcode, barChartDescriptions) {
        const barChartDescription = this.#getBarChartDescription(barChartDescriptions, batchcode);
        const maximally_different = 1;
        if (barChartDescription === null) {
            return maximally_different;
        }
        const jensenShannonDistance = barChartDescription['Jensen-Shannon distance'];
        return jensenShannonDistance === null ? maximally_different : jensenShannonDistance;
    }

    #displayBatchcodeByCountryBarChart(batchcode, barChartDescriptions, uiContainer) {
        const barChartDescription = this.#getBarChartDescription(barChartDescriptions, batchcode);
        if (barChartDescription !== null) {
            new BatchcodeByCountryBarChartView(uiContainer).displayBatchcodeByCountryBarChart(barChartDescription);
        }
    }

    #getBarChartDescription(barChartDescriptions, batchcode) {
        if (!(batchcode in barChartDescriptions.barChartDescriptions)) {
            return null;
        }
        const barChartDescription = barChartDescriptions.barChartDescriptions[batchcode];
        barChartDescription.batchcode = batchcode;
        barChartDescription['date range guessed'] = barChartDescriptions['date range guessed'];
        barChartDescription['date range known'] = barChartDescriptions['date range known'];
        return barChartDescription;
    }

    #setVisibilityOfCountriesColumn(batchCodeTable, showCountriesColumn) {
        batchCodeTable
            .column(this.#getColumnIndex('Countries'))
            .visible(showCountriesColumn);
    }

    #setDataTablesFilter(isEnabled) {
        DataTablesFilter.setDataTablesFilter(
            isEnabled ?
                DataTablesFilter.FilterState.Enabled :
                DataTablesFilter.FilterState.Disabled);
    }

    #addCountriesColumn(json) {
        json.columns.push('Countries');
        json.data.forEach(row => row.push(null));
    }

    #setTableRows(batchCodeTable, rows) {
        batchCodeTable
            .clear()
            .rows.add(rows)
            .draw();
    }

    #makeCompanyColumnSearchable(batchCodeTable) {
        const companyColumnSearch = new ColumnSearch(batchCodeTable.column(this.#getColumnIndex('Company')));
        companyColumnSearch.columnContentUpdated();
    }
}
