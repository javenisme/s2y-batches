# Phase 1 Testing Guide: Batch Details Link Feature

## Implementation Summary

### Modified Files
1. **ZipcodeRiskMap.html**
   - Added modal container for batch details
   - Added comprehensive CSS styles for modal, batch list, and clickable rows
   - Modal includes header, body with zipcode info, and batch list

2. **ZipcodeRiskMapView.js**
   - Added `initializeModal()` function for modal event handling
   - Added `showBatchDetailsModal(zipData)` function to display batch details
   - Added `checkUrlParameters()` function for URL parameter support
   - Modified `initializeTable()` to add click event listeners to table rows
   - Implemented JSON parsing for `top_batches` field

## Features Implemented

### 1. Clickable Table Rows
- All rows in the zipcode table are now clickable
- Hover effect shows the row is interactive
- Clicking any row opens the batch details modal

### 2. Batch Details Modal
- **Header**: Shows ZIP code number
- **Zipcode Statistics Section**:
  - Total Doses distributed
  - Total Adverse Events
  - Adverse Events per 100K
  - Risk Level (with color coding)

- **Batch List Section**:
  - Lists all batches used in the ZIP code
  - Shows batch code and adverse event count
  - Each batch has a "View Details" button linking to batchCodes.html

### 3. Cross-Page Linking
- Batch detail links format: `batchCodes.html?batch=EN6201`
- Opens in new tab (target="_blank")
- URL encoding handles special characters in batch codes

### 4. URL Parameter Support
- Format: `ZipcodeRiskMap.html?zipcode=96746`
- Automatically opens modal for specified zipcode on page load
- Filters table to show the zipcode

### 5. Modal Interaction
- Close via X button
- Close by clicking outside modal
- Close with Escape key
- Smooth animations and transitions

## Testing Steps

### Test 1: Basic Modal Opening
1. Open `ZipcodeRiskMap.html` in browser
2. Wait for data to load
3. Click on any row in the "Detailed Zipcode Data" table
4. **Expected**: Modal opens showing batch details for that zipcode

### Test 2: Modal Content Verification
1. Open modal for zipcode "96746" (HIGH risk)
2. **Expected**:
   - Modal title shows "Batch Details for ZIP Code 96746"
   - Total Doses: 300
   - Total Adverse Events: 2.92
   - Adverse Events per 100K: 973.3
   - Risk Level: HIGH (in red)
   - Batch list shows: FM0173 with 2.92 adverse events

### Test 3: Batch Link Navigation
1. Open modal for any zipcode
2. Click "View Details" button for a batch
3. **Expected**:
   - Opens batchCodes.html in new tab
   - URL contains `?batch=BATCHCODE` parameter
   - (Note: batchCodes.html needs to be updated to handle this parameter)

### Test 4: Multi-Batch Zipcode
1. Open modal for zipcode "99517"
2. **Expected**:
   - Shows 2 batches: FM0173 and FJ9943
   - Each batch has its own adverse event count
   - Both have "View Details" links

### Test 5: Modal Closing
1. Open any modal
2. Test closing methods:
   a. Click the X button - **Expected**: Modal closes
   b. Click outside modal area - **Expected**: Modal closes
   c. Press Escape key - **Expected**: Modal closes

### Test 6: URL Parameter Auto-Open
1. Open URL: `ZipcodeRiskMap.html?zipcode=96746`
2. **Expected**:
   - Page loads normally
   - Modal automatically opens for zipcode 96746
   - Table filters to show that zipcode

### Test 7: URL Parameter with Invalid Zipcode
1. Open URL: `ZipcodeRiskMap.html?zipcode=00000`
2. **Expected**:
   - Page loads normally
   - No modal opens
   - Table shows all data

### Test 8: Filter Interaction
1. Click "High Risk" filter button
2. Click on a filtered row
3. **Expected**:
   - Modal opens correctly
   - All batch details display properly

### Test 9: DataTables Pagination
1. Navigate to page 2 of the table
2. Click on a row
3. **Expected**:
   - Modal opens with correct zipcode data

### Test 10: Responsive Design
1. Resize browser window to mobile size
2. Open a modal
3. **Expected**:
   - Modal is centered and readable
   - Batch list items stack properly
   - Close button is accessible

## Known Limitations

1. **batchCodes.html Integration**: The batch detail links pass parameters, but batchCodes.html needs to be updated to:
   - Read the `?batch=` URL parameter
   - Auto-search/filter for that batch code
   - Highlight the batch in the table

2. **Back Navigation**: URL parameter support is one-way (opening modal doesn't update URL for sharing)

3. **Empty Batches**: Some zipcodes might have empty batch lists if data is missing

## Next Steps for Phase 2

To complete the integration, batchCodes.html should:
1. Parse URL parameters on load
2. Use the batch code to filter the main table
3. Optionally scroll to and highlight the batch row
4. Load histogram data automatically

## Test Results

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Functionality Tests
- [ ] Test 1: Basic Modal Opening
- [ ] Test 2: Modal Content Verification
- [ ] Test 3: Batch Link Navigation
- [ ] Test 4: Multi-Batch Zipcode
- [ ] Test 5: Modal Closing
- [ ] Test 6: URL Parameter Auto-Open
- [ ] Test 7: URL Parameter with Invalid Zipcode
- [ ] Test 8: Filter Interaction
- [ ] Test 9: DataTables Pagination
- [ ] Test 10: Responsive Design

## Sample Test URLs

```
# Normal page load
ZipcodeRiskMap.html

# Auto-open modal for high-risk zipcode
ZipcodeRiskMap.html?zipcode=96746

# Auto-open modal for medium-risk zipcode
ZipcodeRiskMap.html?zipcode=99517

# Expected batch detail link format
batchCodes.html?batch=FM0173
batchCodes.html?batch=EN6201
```

## Code Quality Checklist

- [x] Error handling for JSON parsing
- [x] Null checks for data access
- [x] Keyboard accessibility (Escape key)
- [x] Semantic HTML structure
- [x] Consistent styling with existing design
- [x] No hardcoded values
- [x] Proper event cleanup
- [x] Cross-browser compatible code
