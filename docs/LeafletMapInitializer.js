/**
 * Leaflet Map Initializer for Zipcode Risk Visualization
 * Handles map rendering, heatmap layer, marker clustering, and interactivity
 */

class LeafletMapInitializer {
    constructor(containerId, zipcodeData) {
        this.containerId = containerId;
        this.zipcodeData = zipcodeData;
        this.map = null;
        this.heatLayer = null;
        this.markersLayer = null;
        this.currentFilter = 'ALL';
        this.showHeatmap = true;
        this.showMarkers = true;
        this.heatmapIntensity = 0.5;
    }

    initialize() {
        // Initialize map centered on US
        this.map = L.map(this.containerId, {
            center: [39.8, -98.5],
            zoom: 4,
            minZoom: 3,
            maxZoom: 18
        });

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add legend
        this.addLegend();

        // Add controls
        this.addControls();

        // Add layers
        this.addHeatLayer();
        this.addMarkerLayer();

        return this.map;
    }

    addLegend() {
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML = `
                <h4>Risk Level</h4>
                <div class="legend-item">
                    <div class="legend-color" style="background-color: #28a745;"></div>
                    <span>LOW (&lt;20 per 100K)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background-color: #ffc107;"></div>
                    <span>MEDIUM (20-50 per 100K)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background-color: #dc3545;"></div>
                    <span>HIGH (&gt;50 per 100K)</span>
                </div>
            `;
            return div;
        };

        legend.addTo(this.map);
    }

    addControls() {
        const controls = L.control({ position: 'topright' });
        const self = this;

        controls.onAdd = function() {
            const div = L.DomUtil.create('div', 'map-controls');
            div.innerHTML = `
                <label>
                    <input type="checkbox" id="toggleHeatmap" checked>
                    Show Heatmap
                </label>
                <label>
                    <input type="checkbox" id="toggleMarkers" checked>
                    Show Markers
                </label>
                <div style="margin-top: 10px;">
                    <label style="display: block; margin-bottom: 5px;">
                        Heatmap Intensity
                    </label>
                    <input type="range" id="heatmapIntensity" min="0" max="1" step="0.1" value="0.5">
                </div>
            `;

            // Prevent map interactions when using controls
            L.DomEvent.disableClickPropagation(div);
            L.DomEvent.disableScrollPropagation(div);

            return div;
        };

        controls.addTo(this.map);

        // Bind control events after map is ready
        setTimeout(() => {
            document.getElementById('toggleHeatmap').addEventListener('change', (e) => {
                self.showHeatmap = e.target.checked;
                self.updateLayers();
            });

            document.getElementById('toggleMarkers').addEventListener('change', (e) => {
                self.showMarkers = e.target.checked;
                self.updateLayers();
            });

            document.getElementById('heatmapIntensity').addEventListener('input', (e) => {
                self.heatmapIntensity = parseFloat(e.target.value);
                self.updateHeatmapIntensity();
            });
        }, 100);
    }

    addHeatLayer() {
        // Filter out data points without coordinates
        const validData = this.zipcodeData.filter(d => d.lat && d.lng);

        // Create heatmap points: [lat, lng, intensity]
        const heatPoints = validData.map(d => {
            // Normalize intensity based on adverse events per 100k
            // Scale: 0-100 -> 0-1, with higher values getting more weight
            const normalizedIntensity = Math.min(d.adverse_events_per_100k / 200, 1);
            return [d.lat, d.lng, normalizedIntensity];
        });

        // Create heat layer
        this.heatLayer = L.heatLayer(heatPoints, {
            radius: 25,
            blur: 15,
            maxZoom: 10,
            max: 1.0,
            gradient: {
                0.0: '#28a745',
                0.25: '#90ee90',
                0.5: '#ffc107',
                0.75: '#ff8c00',
                1.0: '#dc3545'
            }
        }).addTo(this.map);

        console.log(`Heatmap initialized with ${heatPoints.length} points`);
    }

    addMarkerLayer() {
        const self = this;

        // Create marker cluster group with custom icon creation
        this.markersLayer = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            iconCreateFunction: function(cluster) {
                const childCount = cluster.getChildCount();
                let className = 'marker-cluster-';

                if (childCount < 10) {
                    className += 'small';
                } else if (childCount < 100) {
                    className += 'medium';
                } else {
                    className += 'large';
                }

                return new L.DivIcon({
                    html: '<div><span>' + childCount + '</span></div>',
                    className: 'marker-cluster ' + className,
                    iconSize: new L.Point(40, 40)
                });
            }
        });

        // Filter and add markers based on current filter
        this.updateMarkers();

        this.markersLayer.addTo(this.map);
        console.log(`Markers initialized`);
    }

    updateMarkers() {
        if (!this.markersLayer) return;

        // Clear existing markers
        this.markersLayer.clearLayers();

        // Filter data based on current filter
        let filteredData = this.zipcodeData.filter(d => d.lat && d.lng);

        if (this.currentFilter !== 'ALL') {
            filteredData = filteredData.filter(d => d.risk_category === this.currentFilter);
        }

        // Add markers for filtered data
        const self = this;
        filteredData.forEach(zipData => {
            const marker = self.createMarker(zipData);
            this.markersLayer.addLayer(marker);
        });

        console.log(`Updated markers: ${filteredData.length} displayed`);
    }

    createMarker(zipData) {
        const self = this;

        // Determine marker color based on risk category
        const color = this.getRiskColor(zipData.risk_category);

        // Create custom icon
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        // Create marker
        const marker = L.marker([zipData.lat, zipData.lng], { icon: icon });

        // Create popup content
        const popupContent = `
            <div style="min-width: 200px;">
                <h3 style="margin: 0 0 10px 0; color: #333; font-size: 16px;">
                    ZIP Code: ${zipData.zipcode}
                </h3>
                <div style="margin: 5px 0;">
                    <strong>Location:</strong> ${zipData.city}, ${zipData.state}
                </div>
                <div style="margin: 5px 0;">
                    <strong>Risk Level:</strong>
                    <span style="color: ${color}; font-weight: bold;">${zipData.risk_category}</span>
                </div>
                <div style="margin: 5px 0;">
                    <strong>Adverse Events/100K:</strong> ${zipData.adverse_events_per_100k.toFixed(1)}
                </div>
                <div style="margin: 5px 0;">
                    <strong>Total Doses:</strong> ${zipData.total_doses.toLocaleString()}
                </div>
                <div style="margin: 5px 0;">
                    <strong>Total Events:</strong> ${zipData.total_adverse_events.toFixed(2)}
                </div>
                <div style="margin: 5px 0;">
                    <strong>Batches:</strong> ${zipData.num_batches}
                </div>
                <button
                    onclick="window.showBatchDetailsFromMap('${zipData.zipcode}')"
                    style="margin-top: 10px; padding: 8px 16px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
                    View Batch Details
                </button>
            </div>
        `;

        marker.bindPopup(popupContent, {
            maxWidth: 300
        });

        // Add tooltip for hover
        marker.bindTooltip(`${zipData.zipcode}: ${zipData.adverse_events_per_100k.toFixed(1)} per 100K`, {
            permanent: false,
            direction: 'top',
            opacity: 0.9
        });

        return marker;
    }

    getRiskColor(riskCategory) {
        switch (riskCategory) {
            case 'HIGH':
                return '#dc3545';
            case 'MEDIUM':
                return '#ffc107';
            case 'LOW':
                return '#28a745';
            default:
                return '#6c757d';
        }
    }

    updateLayers() {
        if (this.showHeatmap && !this.map.hasLayer(this.heatLayer)) {
            this.map.addLayer(this.heatLayer);
        } else if (!this.showHeatmap && this.map.hasLayer(this.heatLayer)) {
            this.map.removeLayer(this.heatLayer);
        }

        if (this.showMarkers && !this.map.hasLayer(this.markersLayer)) {
            this.map.addLayer(this.markersLayer);
        } else if (!this.showMarkers && this.map.hasLayer(this.markersLayer)) {
            this.map.removeLayer(this.markersLayer);
        }
    }

    updateHeatmapIntensity() {
        if (this.heatLayer) {
            // Update heatmap max value based on intensity slider
            this.heatLayer.setOptions({
                max: this.heatmapIntensity * 2
            });
        }
    }

    filterByRiskLevel(riskLevel) {
        this.currentFilter = riskLevel;
        this.updateMarkers();
    }

    focusOnZipcode(zipcode) {
        const zipData = this.zipcodeData.find(d => d.zipcode === zipcode);
        if (zipData && zipData.lat && zipData.lng) {
            this.map.setView([zipData.lat, zipData.lng], 12);

            // Open popup for this zipcode if marker exists
            this.markersLayer.eachLayer((layer) => {
                if (layer.getLatLng().lat === zipData.lat && layer.getLatLng().lng === zipData.lng) {
                    layer.openPopup();
                }
            });
        }
    }

    getMap() {
        return this.map;
    }
}

// Make it available globally
window.LeafletMapInitializer = LeafletMapInitializer;
