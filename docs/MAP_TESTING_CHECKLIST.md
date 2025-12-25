# Leaflet Map Integration - Testing Checklist

## Pre-Deployment Testing Checklist

Complete all tests before deploying to production.

---

## 1. Data Loading Tests

### 1.1 Data Fetch
- [ ] ZipcodeRiskSummary.json loads successfully
- [ ] ZipcodeRiskStats.json loads successfully
- [ ] No console errors during data fetch
- [ ] Data loads within 2 seconds

### 1.2 Data Integrity
- [ ] All 17,847+ zipcodes loaded
- [ ] Coordinate data present (lat/lng columns)
- [ ] Risk categories correctly assigned
- [ ] Top batches JSON parsed correctly
- [ ] No null/undefined values in critical fields

---

## 2. Map Initialization Tests

### 2.1 Basic Map
- [ ] Map container renders (no gray box)
- [ ] OpenStreetMap tiles load
- [ ] Initial view centered on USA (39.8, -98.5)
- [ ] Initial zoom level = 4
- [ ] Attribution visible

### 2.2 Heatmap Layer
- [ ] Heatmap visible on load
- [ ] Color gradient visible (green → yellow → red)
- [ ] Heatmap covers expected geographic areas
- [ ] No console errors related to heatmap
- [ ] Heatmap intensity reasonable

### 2.3 Marker Layer
- [ ] Markers load and cluster
- [ ] Cluster counts displayed correctly
- [ ] Cluster icons show different sizes (small/medium/large)
- [ ] Individual markers visible at high zoom
- [ ] Marker colors match risk levels

### 2.4 Performance
- [ ] Initial load completes in < 2 seconds
- [ ] No browser lag/freeze
- [ ] Console shows load time metrics
- [ ] Memory usage acceptable (< 50MB increase)

---

## 3. Interactive Controls Tests

### 3.1 Map Controls
- [ ] Controls panel visible (top-right)
- [ ] "Show Heatmap" checkbox works
- [ ] "Show Markers" checkbox works
- [ ] Heatmap intensity slider works
- [ ] Slider updates heatmap in real-time
- [ ] No map interaction issues when using controls

### 3.2 Legend
- [ ] Legend visible (bottom-right)
- [ ] All risk levels listed
- [ ] Color boxes match actual colors
- [ ] Readable text

---

## 4. Marker Interaction Tests

### 4.1 Clustering
- [ ] Clicking cluster zooms to expand
- [ ] Cluster animation smooth
- [ ] Spiderfy works at max zoom
- [ ] No duplicate markers
- [ ] Cluster counts accurate

### 4.2 Tooltips
- [ ] Hovering marker shows tooltip
- [ ] Tooltip shows correct zipcode
- [ ] Tooltip shows correct risk rate
- [ ] Tooltip disappears on mouse out
- [ ] No tooltip overlap issues

### 4.3 Popups
- [ ] Clicking marker opens popup
- [ ] Popup shows correct zipcode
- [ ] Popup shows city and state
- [ ] Popup shows risk level (colored)
- [ ] Popup shows all metrics
- [ ] "View Batch Details" button visible
- [ ] Clicking button opens modal
- [ ] Closing popup works (X button or map click)
- [ ] Only one popup open at a time

---

## 5. Filter Integration Tests

### 5.1 Filter Buttons
- [ ] All filter buttons visible
- [ ] "All Zipcodes" active by default
- [ ] Clicking "Low Risk" filters map
- [ ] Clicking "Medium Risk" filters map
- [ ] Clicking "High Risk" filters map
- [ ] Active button highlighted
- [ ] Filter updates both table AND map
- [ ] Filter transition smooth

### 5.2 Filter Accuracy
- [ ] Low filter shows only green markers
- [ ] Medium filter shows only yellow markers
- [ ] High filter shows only red markers
- [ ] Marker count matches table row count
- [ ] "All" restores all markers

---

## 6. Map-Table Synchronization Tests

### 6.1 Table → Map
- [ ] Clicking table row focuses map
- [ ] Map zooms to correct zipcode
- [ ] Correct marker highlighted/popup opened
- [ ] Zoom animation smooth
- [ ] Works with filtered table

### 6.2 Map → Table
- [ ] Clicking "View Batch Details" scrolls to table
- [ ] Table filters to selected zipcode
- [ ] Modal opens with correct data
- [ ] Works from any zoom level
- [ ] Works with filtered markers

---

## 7. Modal Integration Tests

### 7.1 Opening Modal
- [ ] Modal opens from table row click
- [ ] Modal opens from map popup button
- [ ] Modal opens from URL parameter
- [ ] Modal background overlay visible
- [ ] Modal content loads correctly

### 7.2 Modal Content
- [ ] Zipcode displayed in title
- [ ] All statistics correct
- [ ] Batch list populated
- [ ] Batch links functional
- [ ] Risk level colored correctly

### 7.3 Closing Modal
- [ ] X button closes modal
- [ ] Clicking outside closes modal
- [ ] Escape key closes modal
- [ ] Map state preserved after close

---

## 8. URL Parameter Tests

### 8.1 Direct Linking
- [ ] `?zipcode=96746` loads correctly
- [ ] Map focuses on specified zipcode
- [ ] Modal opens automatically
- [ ] Table filters to zipcode
- [ ] Works with valid zipcodes
- [ ] Invalid zipcodes handled gracefully

---

## 9. Chart Integration Tests

### 9.1 Charts Load
- [ ] Top 20 bar chart loads
- [ ] Scatter plot loads
- [ ] No chart rendering errors
- [ ] Charts display after map

### 9.2 Chart Interaction
- [ ] Charts don't interfere with map
- [ ] Scrolling works smoothly
- [ ] Charts responsive

---

## 10. Responsive Design Tests

### 10.1 Desktop (1920x1080)
- [ ] Map height = 600px
- [ ] All controls visible
- [ ] Legend positioned correctly
- [ ] No horizontal scroll
- [ ] Table fully visible

### 10.2 Tablet (768x1024)
- [ ] Map adjusts to screen width
- [ ] Controls accessible
- [ ] Touch gestures work
- [ ] Table scrollable

### 10.3 Mobile (375x667)
- [ ] Map height = 400px
- [ ] Controls usable with touch
- [ ] Markers tappable
- [ ] Popups fit screen
- [ ] Filter buttons wrap correctly
- [ ] No layout breaking

---

## 11. Browser Compatibility Tests

### 11.1 Chrome (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Performance acceptable

### 11.2 Firefox (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Performance acceptable

### 11.3 Safari (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Performance acceptable

### 11.4 Edge (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] Performance acceptable

### 11.5 Mobile Safari (iOS)
- [ ] Touch gestures work
- [ ] Map renders correctly
- [ ] Performance acceptable

### 11.6 Chrome Android
- [ ] Touch gestures work
- [ ] Map renders correctly
- [ ] Performance acceptable

---

## 12. Performance Tests

### 12.1 Load Time
- [ ] Data fetch < 1000ms
- [ ] JSON parse < 500ms
- [ ] Map init < 1000ms
- [ ] Total load < 2500ms

### 12.2 Runtime Performance
- [ ] Zoom smooth (no lag)
- [ ] Pan smooth
- [ ] Filter < 300ms
- [ ] No memory leaks (test repeated actions)

### 12.3 Data Volume
- [ ] Handles 17,847+ markers
- [ ] Clustering prevents lag
- [ ] Heatmap renders all points
- [ ] No browser crash

---

## 13. Error Handling Tests

### 13.1 Network Errors
- [ ] Graceful handling of fetch failure
- [ ] User-friendly error message
- [ ] No JavaScript exceptions
- [ ] Retry option available

### 13.2 Data Errors
- [ ] Invalid JSON handled
- [ ] Missing coordinates handled
- [ ] Null values handled
- [ ] Empty arrays handled

### 13.3 User Errors
- [ ] Invalid zipcode in URL handled
- [ ] Clicking disabled elements handled
- [ ] Rapid clicking handled (debouncing)

---

## 14. Accessibility Tests

### 14.1 Keyboard Navigation
- [ ] Tab through controls
- [ ] Enter/Space activate buttons
- [ ] Escape closes modal
- [ ] Focus indicators visible

### 14.2 Screen Reader
- [ ] ARIA labels present
- [ ] Announcements for filter changes
- [ ] Modal accessible
- [ ] Table accessible

### 14.3 Color Contrast
- [ ] Text readable on all backgrounds
- [ ] Meets WCAG AA standards
- [ ] High contrast mode works

---

## 15. Data Accuracy Tests

### 15.1 Coordinate Accuracy
- [ ] Markers in correct states
- [ ] Markers in correct cities
- [ ] Heatmap matches expected patterns
- [ ] Sample 10 random zipcodes manually verify

### 15.2 Statistical Accuracy
- [ ] Risk rates match table data
- [ ] Total doses match
- [ ] Adverse events match
- [ ] Batch counts match

### 15.3 Filter Accuracy
- [ ] Risk categorization correct
- [ ] Filter counts match stats cards
- [ ] No missing/extra markers

---

## 16. Integration Tests

### 16.1 Statistics Cards
- [ ] Cards update with data
- [ ] Numbers formatted correctly
- [ ] Percentages calculated correctly

### 16.2 Navigation Bar
- [ ] Links functional
- [ ] Current page highlighted
- [ ] Opens in same window

### 16.3 Google Analytics
- [ ] Tracking script loads
- [ ] Page view tracked
- [ ] No blocking errors

---

## 17. Edge Case Tests

### 17.1 Empty Data
- [ ] Handles 0 zipcodes gracefully
- [ ] Shows appropriate message

### 17.2 Single Zipcode
- [ ] Map centers correctly
- [ ] No clustering errors

### 17.3 All Same Risk Level
- [ ] Filters work correctly
- [ ] Heatmap still renders

### 17.4 Missing Coordinates
- [ ] Excluded from map
- [ ] Still in table
- [ ] No console errors

---

## 18. Security Tests

### 18.1 XSS Prevention
- [ ] Zipcode input sanitized
- [ ] Batch names sanitized
- [ ] No script injection possible

### 18.2 Data Integrity
- [ ] JSON served with correct MIME type
- [ ] No mixed content warnings
- [ ] HTTPS enforced (on production)

---

## 19. Documentation Tests

### 19.1 User Guide
- [ ] All features documented
- [ ] Examples accurate
- [ ] Troubleshooting helpful

### 19.2 Code Comments
- [ ] Functions documented
- [ ] Complex logic explained
- [ ] TODOs addressed

### 19.3 Technical Report
- [ ] Accurate metrics
- [ ] Complete feature list
- [ ] Known limitations listed

---

## 20. Deployment Readiness

### 20.1 Files
- [ ] All files committed to git
- [ ] No sensitive data in code
- [ ] Build script runs successfully
- [ ] .wranglerignore configured

### 20.2 Configuration
- [ ] CDN URLs correct
- [ ] No localhost references
- [ ] Analytics ID correct

### 20.3 Backup
- [ ] Original files backed up
- [ ] Rollback plan documented

---

## Test Results Summary

**Date Tested**: _______________

**Tester**: _______________

**Total Tests**: 200+

**Passed**: _____ / _____

**Failed**: _____ / _____

**Critical Issues**: _______________

**Minor Issues**: _______________

**Ready for Production**: [ ] Yes [ ] No

**Notes**:
_______________________________________________
_______________________________________________
_______________________________________________

---

## Sign-Off

**Developer**: _______________  Date: _______________

**QA**: _______________  Date: _______________

**Product Owner**: _______________  Date: _______________
