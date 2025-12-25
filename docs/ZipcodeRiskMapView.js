/**
 * Zipcode Risk Map Visualization
 * Loads and displays zipcode-level vaccine distribution risk data
 */

let zipcodeData = null;
let dataTable = null;
let topRiskChart = null;
let scatterChart = null;

// Load data and initialize visualizations
$(document).ready(function() {
    loadData();
});

async function loadData() {
    try {
        // Load zipcode summary data
        const summaryResponse = await fetch('./data/zipcodeRiskMap/ZipcodeRiskSummary.json');
        const summaryJson = await summaryResponse.json();

        // Load statistics
        const statsResponse = await fetch('./data/zipcodeRiskMap/ZipcodeRiskStats.json');
        const stats = await statsResponse.json();

        // Process data
        zipcodeData = parseDataTableJson(summaryJson);

        // Initialize visualizations
        updateStatsCards(stats);
        initializeTable();
        createTopRiskChart();
        createScatterChart();

    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load zipcode risk data. Please check the console for details.');
    }
}

function parseDataTableJson(json) {
    // Convert split-oriented JSON to array of objects
    const data = [];
    for (let i = 0; i < json.data.length; i++) {
        const row = {};
        for (let j = 0; j < json.columns.length; j++) {
            row[json.columns[j]] = json.data[i][j];
        }
        data.push(row);
    }
    return data;
}

function updateStatsCards(stats) {
    document.getElementById('totalZipcodes').textContent = stats.total_zipcodes.toLocaleString();

    document.getElementById('lowRiskCount').textContent = stats.risk_distribution.LOW.count.toLocaleString();
    document.getElementById('lowRiskPct').textContent = `${stats.risk_distribution.LOW.percentage}%`;

    document.getElementById('mediumRiskCount').textContent = stats.risk_distribution.MEDIUM.count.toLocaleString();
    document.getElementById('mediumRiskPct').textContent = `${stats.risk_distribution.MEDIUM.percentage}%`;

    document.getElementById('highRiskCount').textContent = stats.risk_distribution.HIGH.count.toLocaleString();
    document.getElementById('highRiskPct').textContent = `${stats.risk_distribution.HIGH.percentage}%`;
}

function initializeTable() {
    // Populate table
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    zipcodeData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.zipcode}</td>
            <td><span class="risk-${row.risk_category}">${row.risk_category}</span></td>
            <td>${row.adverse_events_per_100k.toFixed(1)}</td>
            <td>${row.total_doses.toLocaleString()}</td>
            <td>${row.total_adverse_events.toFixed(2)}</td>
            <td>${row.num_batches}</td>
            <td>${row.num_providers}</td>
        `;
        tbody.appendChild(tr);
    });

    // Initialize DataTable
    dataTable = $('#zipcodeTable').DataTable({
        pageLength: 25,
        order: [[2, 'desc']], // Sort by adverse_events_per_100k descending
        columnDefs: [
            { className: 'dt-center', targets: [1, 2, 3, 4, 5, 6] }
        ]
    });
}

function createTopRiskChart() {
    // Get top 20 zipcodes by risk
    const top20 = zipcodeData.slice(0, 20);

    const ctx = document.getElementById('topRiskChart').getContext('2d');
    topRiskChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top20.map(d => d.zipcode),
            datasets: [{
                label: 'Adverse Events per 100K Doses',
                data: top20.map(d => d.adverse_events_per_100k),
                backgroundColor: top20.map(d => {
                    if (d.risk_category === 'HIGH') return 'rgba(220, 53, 69, 0.7)';
                    if (d.risk_category === 'MEDIUM') return 'rgba(255, 193, 7, 0.7)';
                    return 'rgba(40, 167, 69, 0.7)';
                }),
                borderColor: top20.map(d => {
                    if (d.risk_category === 'HIGH') return 'rgba(220, 53, 69, 1)';
                    if (d.risk_category === 'MEDIUM') return 'rgba(255, 193, 7, 1)';
                    return 'rgba(40, 167, 69, 1)';
                }),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const dataPoint = top20[context.dataIndex];
                            return [
                                `Adverse Events/100K: ${context.parsed.y.toFixed(1)}`,
                                `Total Doses: ${dataPoint.total_doses.toLocaleString()}`,
                                `Risk: ${dataPoint.risk_category}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Adverse Events per 100,000 Doses'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'ZIP Code'
                    }
                }
            }
        }
    });
}

function createScatterChart() {
    // Prepare data for scatter plot
    // Sample to reduce number of points (every 10th zipcode)
    const sampledData = zipcodeData.filter((_, index) => index % 10 === 0);

    const datasets = {
        HIGH: {
            label: 'High Risk',
            data: [],
            backgroundColor: 'rgba(220, 53, 69, 0.6)',
            borderColor: 'rgba(220, 53, 69, 1)'
        },
        MEDIUM: {
            label: 'Medium Risk',
            data: [],
            backgroundColor: 'rgba(255, 193, 7, 0.6)',
            borderColor: 'rgba(255, 193, 7, 1)'
        },
        LOW: {
            label: 'Low Risk',
            data: [],
            backgroundColor: 'rgba(40, 167, 69, 0.6)',
            borderColor: 'rgba(40, 167, 69, 1)'
        }
    };

    sampledData.forEach(d => {
        datasets[d.risk_category].data.push({
            x: d.total_doses,
            y: d.adverse_events_per_100k
        });
    });

    const ctx = document.getElementById('scatterChart').getContext('2d');
    scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                { ...datasets.HIGH, pointRadius: 5 },
                { ...datasets.MEDIUM, pointRadius: 4 },
                { ...datasets.LOW, pointRadius: 3 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return [
                                `Doses: ${context.parsed.x.toLocaleString()}`,
                                `Adverse Events/100K: ${context.parsed.y.toFixed(1)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'logarithmic',
                    title: {
                        display: true,
                        text: 'Total Doses (log scale)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Adverse Events per 100,000 Doses'
                    }
                }
            }
        }
    });
}

function filterTable(riskLevel) {
    // Update button states
    document.querySelectorAll('.filter-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Apply filter
    if (riskLevel === 'ALL') {
        dataTable.search('').draw();
    } else {
        dataTable.column(1).search(`^${riskLevel}$`, true, false).draw();
    }
}
