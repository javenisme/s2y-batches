# Interactive Zipcode Risk Map - User Guide

## Quick Start

1. **Open the Map Page**
   ```
   http://localhost:8080/ZipcodeRiskMap.html
   ```
   (Or your deployed URL on Cloudflare Pages)

2. **Map will automatically load** showing the United States with:
   - Heatmap overlay (green to red gradient)
   - Clustered markers for all zipcodes

## Features Overview

### 1. Map Navigation
- **Zoom**: Use mouse wheel or +/- buttons
- **Pan**: Click and drag the map
- **Reset View**: Refresh page to return to USA view

### 2. Heatmap Layer
**What it shows**: Geographic density of adverse events

**Color Guide**:
- Green: Low risk areas (< 20 events per 100K)
- Yellow: Medium risk areas (20-50 events per 100K)
- Red: High risk areas (> 50 events per 100K)

**Controls**:
- Toggle on/off: Checkbox in top-right control panel
- Adjust intensity: Slider in control panel

### 3. Marker Layer
**What it shows**: Individual zipcode locations

**Features**:
- Color-coded by risk level (same as heatmap)
- Clusters automatically at low zoom
- Click cluster to zoom and expand
- Hover for quick tooltip

**Marker Interactions**:
1. **Hover**: Shows zipcode and risk rate
2. **Click**: Opens popup with details:
   - Zipcode and location (city, state)
   - Risk level and rate
   - Total doses and adverse events
   - Number of batches used
   - "View Batch Details" button

### 4. Controls Panel (Top Right)
```
[✓] Show Heatmap
[✓] Show Markers
Heatmap Intensity: [====|====]
```

- **Show Heatmap**: Toggle heatmap layer visibility
- **Show Markers**: Toggle marker layer visibility
- **Heatmap Intensity**: Adjust heatmap color intensity (0-100%)

### 5. Legend (Bottom Right)
Shows risk level definitions:
- LOW: < 20 per 100K
- MEDIUM: 20-50 per 100K
- HIGH: > 50 per 100K

### 6. Filter Buttons
Located above the data table:
```
[All Zipcodes] [Low Risk] [Medium Risk] [High Risk]
```

**What they do**:
- Filter BOTH the map markers AND the data table
- Active filter highlighted with shadow
- Click "All Zipcodes" to reset

### 7. Map-Table Synchronization

**From Map to Table**:
1. Click marker on map
2. Click "View Batch Details" in popup
3. Table automatically filters to that zipcode
4. Page scrolls to table
5. Modal opens with batch details

**From Table to Map**:
1. Click any row in the data table
2. Map focuses on that zipcode location
3. Map zooms to city level
4. Marker popup opens automatically

### 8. Direct Linking
Share specific zipcodes using URL parameters:
```
ZipcodeRiskMap.html?zipcode=96746
```

This will:
- Load the page
- Focus map on that zipcode
- Open the batch details modal
- Filter table to that zipcode

## Common Use Cases

### Find High-Risk Areas
1. Click "High Risk" filter button
2. Observe red markers and heatmap concentrations
3. Zoom into clusters to see specific zipcodes
4. Click markers to view details

### Compare Regional Risk
1. Zoom to state or regional level
2. Enable heatmap for geographic overview
3. Enable markers for specific locations
4. Compare color intensity across regions

### Investigate Specific Zipcode
1. Search zipcode in data table (using DataTable search)
2. Click the row
3. Map focuses on location
4. View popup for quick stats
5. Click "View Batch Details" for full information

### Export High-Risk Zipcodes
1. Click "High Risk" filter
2. Use DataTable's built-in copy/export features
3. Data table shows filtered results

## Performance Tips

### For Faster Loading
- Disable heatmap on slow devices (uncheck "Show Heatmap")
- Keep zoom level low (4-8) for overview
- Use filters to reduce visible markers

### For Better Visualization
- Adjust heatmap intensity based on zoom level
  - Low zoom (USA view): Lower intensity (30-50%)
  - High zoom (city view): Higher intensity (60-80%)
- Disable markers when viewing heatmap only
- Disable heatmap when viewing individual markers

### Mobile Usage
- Map height automatically adjusts (400px on mobile)
- Touch gestures supported:
  - Pinch to zoom
  - Drag to pan
  - Tap marker to open popup
- Recommend disabling heatmap on slow mobile connections

## Troubleshooting

### Map Not Loading
**Problem**: Gray box instead of map
**Solution**:
1. Check internet connection (CDN required)
2. Check browser console for errors
3. Ensure JavaScript is enabled
4. Try refreshing page

### Performance Issues
**Problem**: Laggy map movements
**Solution**:
1. Disable heatmap layer
2. Reduce heatmap intensity
3. Keep zoom level low (fewer markers visible)
4. Close other browser tabs

### Markers Not Showing
**Problem**: No markers visible on map
**Solution**:
1. Check "Show Markers" checkbox is enabled
2. Try zooming in (markers may be heavily clustered)
3. Check filter buttons (may be filtering out all markers)
4. Refresh page

### Popup Not Opening
**Problem**: Click marker but no popup
**Solution**:
1. Try clicking directly on marker (not cluster)
2. If clicking cluster, wait for zoom animation
3. Disable heatmap if overlapping
4. Zoom in closer to reduce cluster density

### Data Mismatch
**Problem**: Popup data doesn't match table
**Solution**:
1. Refresh page to reload latest data
2. Clear browser cache
3. Check console for data loading errors

## Data Accuracy Notes

### Coordinate Coverage
- All zipcodes with valid coordinates displayed
- Some zipcodes may lack coordinates (excluded from map)
- Table shows all zipcodes regardless of coordinates

### Risk Calculation
- Based on `adverse_events_per_100k` metric
- Calculated from VAERS reports and Pfizer distribution data
- Updated weekly (check data timestamp in stats section)

### Heatmap Interpretation
- Heatmap shows density AND intensity
- Red areas = high concentration + high risk
- Consider both heatmap and markers for full picture
- Zoom in to see specific zipcodes contributing to hotspots

## Keyboard Shortcuts

**Map Navigation**:
- `+` / `-`: Zoom in/out
- Arrow keys: Pan map (if map focused)
- `Escape`: Close popup/modal

**Browser**:
- `Ctrl/Cmd + F`: Search in data table
- `Ctrl/Cmd + R`: Refresh page

## Accessibility

- Keyboard navigable controls
- Screen reader compatible (ARIA labels)
- High contrast color scheme
- Text alternatives for visual elements
- Zoom functionality for low vision users

## Integration with Other Pages

### From Batch Codes Page
Link to zipcode distribution:
```
batchCodes.html → ZipcodeRiskMap.html
```
- View geographic distribution of batch usage

### To Full Data Table
Navigate to comprehensive view:
```
ZipcodeRiskMap.html → HowBadIsMyBatch.html
```
- Access all batch code details

### Navigation Bar
Use top navigation for quick access:
- Batch Codes (main lookup)
- Zipcode Risk Map (geographic view)
- Full Data Table (comprehensive data)

## Advanced Features

### Clustering Behavior
- **Zoom 1-6**: Heavy clustering (10-50 clusters visible)
- **Zoom 7-10**: Medium clustering (50-500 markers)
- **Zoom 11+**: Light clustering (500+ markers)
- **Zoom 15+**: Individual markers (no clustering)

### Heatmap Algorithm
- Uses Leaflet.heat plugin
- Intensity based on `adverse_events_per_100k`
- Gradient: Green (0%) → Yellow (50%) → Red (100%)
- Radius: 25 pixels
- Blur: 15 pixels
- Max zoom for heatmap: Level 10

### Marker Details
- Custom div icons (12px circles)
- Color: Risk-based (#28a745, #ffc107, #dc3545)
- White border + shadow for visibility
- Tooltip: Permanent=false, Direction=top

## Support

For issues or questions:
1. Check this user guide
2. Check browser console for errors
3. Verify data files exist in `/docs/data/zipcodeRiskMap/`
4. Contact developer/administrator

## Version History

**v1.0** (2025-12-25)
- Initial release with Leaflet.js integration
- Heatmap layer
- Marker clustering
- Bidirectional table-map sync
- Filter integration
- Mobile responsive design
