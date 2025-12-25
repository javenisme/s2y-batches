# Interactive Map Demo Scenarios

## Visual Demonstration Guide

These scenarios demonstrate the key features of the Leaflet map integration. Use these to create screenshots, GIFs, or demo videos.

---

## Scenario 1: Initial Load and Overview

**Title**: "Geographic Risk Visualization at a Glance"

**Steps**:
1. Navigate to `ZipcodeRiskMap.html`
2. Wait for map to load (< 2 seconds)
3. Observe:
   - Heatmap showing USA with color gradient
   - Clustered markers across the country
   - Statistics cards with totals
   - Legend in bottom-right
   - Controls in top-right

**Screenshot Focus**:
- Full page view showing map + statistics
- Heatmap clearly visible with red/yellow/green areas
- Cluster counts visible

**Key Message**: "17,847 zipcodes visualized instantly with risk-coded heatmap"

---

## Scenario 2: Heatmap Intensity Adjustment

**Title**: "Dynamic Heatmap Control"

**Steps**:
1. Start at default heatmap intensity (50%)
2. Move slider to 20% (low intensity)
   - Colors become more subtle
3. Move slider to 100% (high intensity)
   - Red areas become vivid, clearly showing hotspots
4. Zoom into high-intensity red area

**GIF Opportunity**:
- Record slider adjustment in real-time
- Show heatmap colors changing dynamically
- No page reload needed

**Key Message**: "Adjust visualization intensity on-the-fly to highlight patterns"

---

## Scenario 3: Marker Clustering and Expansion

**Title**: "Smart Marker Clustering for Performance"

**Steps**:
1. Start at zoom level 4 (USA view)
   - Show ~50-100 large clusters
2. Click a cluster in California
   - Map zooms smoothly
   - Cluster expands into smaller clusters
3. Click smaller cluster
   - Further expansion
4. Reach individual markers
   - Markers visible as colored circles

**GIF Opportunity**:
- Record clicking cluster → zoom → expand sequence
- Show cluster count decreasing as zoom increases
- Demonstrate smooth animation

**Key Message**: "17K+ markers, zero lag - intelligent clustering in action"

---

## Scenario 4: Marker Popup Interaction

**Title**: "Detailed Information on Demand"

**Steps**:
1. Zoom to city level (e.g., Honolulu, Hawaii)
2. Hover over marker
   - Tooltip shows: "96746: 973.3 per 100K"
3. Click marker
   - Popup opens with:
     - ZIP Code: 96746
     - Location: Kapaa, HI
     - Risk Level: HIGH (in red)
     - Adverse Events/100K: 973.3
     - Total Doses: 300
     - Total Events: 2.92
     - Batches: 1
4. Highlight "View Batch Details" button

**Screenshot Focus**:
- Popup clearly visible
- All data fields visible
- Button prominent

**Key Message**: "Instant access to detailed statistics with one click"

---

## Scenario 5: Batch Details Modal Flow

**Title**: "Seamless Navigation to Batch Information"

**Steps**:
1. Open marker popup (as in Scenario 4)
2. Click "View Batch Details" button
3. Show:
   - Modal opens over map
   - Zipcode statistics displayed
   - Batch list with batch codes
   - "View Details" links for each batch
4. Scroll page
   - Table automatically filtered to that zipcode
5. Close modal
   - Map state preserved

**GIF Opportunity**:
- Record full flow: click → modal → table scroll
- Show smooth transitions
- Demonstrate no page reload

**Key Message**: "Explore from geography to batch details without leaving the page"

---

## Scenario 6: Risk Level Filtering

**Title**: "Filter by Risk Across All Views"

**Steps**:
1. Start with "All Zipcodes" filter (active)
   - Map shows all markers (green, yellow, red)
   - Table shows all 17,847 rows
2. Click "High Risk" button
   - Button highlighted
   - Map markers reduce to only red markers
   - Heatmap shows only high-risk areas
   - Table filters to HIGH risk rows
   - Statistics remain visible
3. Click "Medium Risk"
   - Map markers change to yellow only
   - Table updates accordingly
4. Click "All Zipcodes"
   - Everything restores

**GIF Opportunity**:
- Record clicking through all filter buttons
- Show map markers appearing/disappearing
- Show table row count changing

**Key Message**: "Synchronized filtering across map, table, and visualizations"

---

## Scenario 7: Table-to-Map Interaction

**Title**: "Bidirectional Exploration"

**Steps**:
1. Scroll down to data table
2. Find a specific zipcode (e.g., 99517 - Anchorage, AK)
3. Click the table row
4. Show:
   - Page auto-scrolls to map
   - Map zooms to Alaska
   - Map centers on that zipcode
   - Marker popup opens automatically
   - Table stays filtered to that zipcode

**Screenshot Focus**:
- Split screen showing table click and map focus result
- Popup open on correct location

**Key Message**: "Click any table row to instantly locate it on the map"

---

## Scenario 8: Map-to-Table Interaction

**Title**: "From Map to Details in Two Clicks"

**Steps**:
1. Start on map, zoomed to Texas
2. Click a HIGH risk marker
3. Popup opens
4. Click "View Batch Details"
5. Show:
   - Page scrolls to table section
   - Table filtered to that single zipcode
   - Modal open with batch information
   - Can click batch links to view full batch details

**GIF Opportunity**:
- Record full interaction flow
- Show smooth scrolling animation
- Demonstrate coordinated updates

**Key Message**: "Geographic discovery to detailed analysis in seconds"

---

## Scenario 9: Mobile Responsive Design

**Title**: "Full Functionality on Any Device"

**Steps**:
1. Open on desktop (show full 600px map)
2. Resize browser to tablet width
   - Map adjusts width
   - Controls remain accessible
   - Touch gestures work
3. Resize to mobile (375px width)
   - Map height reduces to 400px
   - Filter buttons wrap to multiple rows
   - Table becomes horizontally scrollable
   - Pinch to zoom works
   - Tap markers work

**Screenshot Comparison**:
- Desktop view
- Tablet view
- Mobile view
- All showing same data, different layouts

**Key Message**: "Explore vaccine risk data on desktop, tablet, or phone"

---

## Scenario 10: Control Panel Features

**Title**: "Customize Your View"

**Steps**:
1. Show map with both layers enabled
2. Uncheck "Show Heatmap"
   - Heatmap disappears instantly
   - Markers remain
3. Re-check "Show Heatmap"
   - Heatmap reappears
4. Uncheck "Show Markers"
   - Only heatmap visible
   - Clean geographic overview
5. Adjust intensity slider while heatmap-only view
   - Demonstrate subtle vs. vivid visualization

**GIF Opportunity**:
- Record toggling checkboxes
- Show layers appearing/disappearing
- Show slider in action

**Key Message**: "Fully customizable visualization to suit your analysis needs"

---

## Scenario 11: Direct Linking to Zipcode

**Title**: "Share Specific Findings"

**Steps**:
1. Navigate to `ZipcodeRiskMap.html?zipcode=96746`
2. Page loads with:
   - Map centered on Hawaii
   - Zoomed to city level (Kapaa)
   - Marker popup open automatically
   - Modal open with batch details
   - Table filtered to that zipcode
3. Share URL with colleague
4. They see exact same view

**Screenshot Focus**:
- Browser URL bar showing parameter
- Map focused on specific location
- Modal open

**Key Message**: "Share direct links to specific high-risk areas with colleagues"

---

## Scenario 12: Legend and Risk Interpretation

**Title**: "Understand Risk Levels at a Glance"

**Steps**:
1. Zoom to show mix of all three risk levels
2. Highlight legend:
   - GREEN: LOW (< 20 per 100K)
   - YELLOW: MEDIUM (20-50 per 100K)
   - RED: HIGH (> 50 per 100K)
3. Show matching markers on map
4. Show matching rows in table
5. Show matching colors in charts

**Screenshot Focus**:
- Legend prominently displayed
- Markers matching legend colors
- Table rows with same color coding

**Key Message**: "Consistent color coding across all visualizations for easy interpretation"

---

## Scenario 13: Performance with 17K+ Points

**Title**: "Massive Dataset, Zero Lag"

**Steps**:
1. Open performance test page (`test_map_performance.html`)
2. Click "Run Performance Test"
3. Show results:
   - Data Load: ~300-800ms
   - JSON Parse: ~200-400ms
   - Total 17,847 zipcodes loaded
   - Coordinate coverage: 99%+
   - Memory usage: < 20MB
4. Navigate back to main map
5. Demonstrate smooth interactions:
   - Fast zoom
   - Quick pan
   - Instant filter
   - No lag

**Screenshot Focus**:
- Performance test results (all green)
- Console timestamps showing sub-second operations

**Key Message**: "Enterprise-grade performance with thousands of data points"

---

## Scenario 14: Multi-Chart Correlation

**Title**: "Compare Map, Charts, and Table"

**Steps**:
1. Apply "High Risk" filter
2. Observe synchronization:
   - Map shows only red markers (concentrated in specific regions)
   - "Top 20 Highest Risk" bar chart updates
   - Scatter plot highlights red points only
   - Table shows filtered rows
   - Statistics cards remain visible
3. Click top bar in bar chart's zipcode
   - Find it in table
   - Click table row
   - Map focuses on that location

**Screenshot Focus**:
- Full page showing all visualizations
- Consistent filtering across all views

**Key Message**: "Correlate geographic, statistical, and tabular views in real-time"

---

## Scenario 15: State-Level Risk Assessment

**Title**: "Regional Risk Pattern Analysis"

**Steps**:
1. Zoom to state level (e.g., California)
2. Enable heatmap only (disable markers)
3. Observe concentration patterns:
   - Southern California shows higher intensity
   - Bay Area shows medium intensity
   - Northern California shows lower intensity
4. Re-enable markers
5. Click clusters in high-intensity areas
6. Compare specific zipcode risk rates

**GIF Opportunity**:
- Pan across state
- Zoom in to regional clusters
- Show heatmap intensity variations

**Key Message**: "Identify regional risk patterns to guide further investigation"

---

## Screenshot Recommendations

### Hero Image (Main Landing)
- Full page view with map showing USA
- Heatmap visible with clear red/yellow/green distinction
- Statistics cards prominent
- Clean, professional appearance

### Feature Showcase (Grid)
1. Heatmap with intensity slider
2. Marker cluster expansion
3. Popup with details
4. Modal with batch information
5. Filter buttons in action
6. Mobile responsive view

### Technical Showcase
1. Performance test results (all passing)
2. Browser console showing load times
3. Developer tools showing memory usage

---

## Demo Script for Video (3-5 minutes)

**[00:00-00:30] Introduction**
"Welcome to the interactive Zipcode Risk Map. This tool visualizes 17,847 zipcodes across the United States, showing the geographic distribution of COVID-19 vaccine adverse events."

**[00:30-01:00] Heatmap Overview**
"The heatmap provides an instant overview, with red areas indicating high risk, yellow for medium, and green for low risk. We can adjust the intensity to highlight different patterns."

**[01:00-01:30] Marker Interaction**
"Zoom in to see individual zipcodes. Click any marker to view detailed statistics including adverse event rate, total doses, and batches used in that area."

**[01:30-02:00] Batch Details**
"Click 'View Batch Details' to see which specific vaccine batches were distributed in this zipcode, and access full batch information with one more click."

**[02:00-02:30] Filtering**
"Filter by risk level to focus on high-risk areas. Notice how both the map and the data table update simultaneously, maintaining perfect synchronization."

**[02:30-03:00] Table-Map Integration**
"Click any row in the table, and the map instantly focuses on that location. This bidirectional interaction makes exploration seamless."

**[03:00-03:30] Mobile & Performance**
"The entire interface is fully responsive, working perfectly on desktop, tablet, or mobile. Despite handling over 17,000 data points, performance remains instant thanks to intelligent marker clustering."

**[03:30-04:00] Closing**
"Explore vaccine safety data geographically, correlate with batch information, and share findings using direct links. All tools needed for comprehensive analysis in one interactive interface."

---

**END OF DEMO SCENARIOS**
