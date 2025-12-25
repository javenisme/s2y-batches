# Quick Start Guide - Batch Details Modal

## What's New?

The ZipcodeRiskMap now has clickable rows that show batch details in a modal popup.

## How to Use

### 1. View Batch Details
1. Open `ZipcodeRiskMap.html` in your browser
2. Click on any row in the "Detailed Zipcode Data" table
3. A modal will pop up showing:
   - Zipcode statistics
   - List of all batches used in that zipcode
   - Adverse event counts for each batch

### 2. Navigate to Batch Details
1. In the modal, click "View Details" next to any batch
2. Opens `batchCodes.html?batch=BATCHCODE` in a new tab
3. (Note: batchCodes.html needs Phase 2 update to auto-filter)

### 3. Use Direct Links
Share or bookmark specific zipcodes:
```
ZipcodeRiskMap.html?zipcode=96746
```
This will:
- Load the page
- Automatically open the modal for that zipcode
- Filter the table to show that zipcode

### 4. Close the Modal
Three ways to close:
- Click the X button
- Click outside the modal
- Press the Escape key

## Example URLs

```bash
# High-risk zipcode with 1 batch
ZipcodeRiskMap.html?zipcode=96746

# High-risk zipcode with 2 batches
ZipcodeRiskMap.html?zipcode=99517

# Batch detail link (from modal)
batchCodes.html?batch=FM0173
```

## Visual Guide

```
┌─────────────────────────────────────────┐
│  ZIP Code Risk Map                      │
│  ┌───────────────────────────────────┐  │
│  │ ZIP | Risk  | Events | Doses     │  │
│  ├───────────────────────────────────┤  │
│  │ 96746 | HIGH | 973.3 | 300  ◄────┼──┼─ Click this row
│  │ 99517 | HIGH | 498.3 | 600       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                   │
                   ▼
         ┌──────────────────────────────┐
         │ Batch Details for 96746      │
         │ ┌──────────────────────────┐ │
         │ │ Total Doses: 300         │ │
         │ │ Risk Level: HIGH         │ │
         │ └──────────────────────────┘ │
         │                              │
         │ Batches:                     │
         │ ┌──────────────────────────┐ │
         │ │ FM0173                   │ │
         │ │ Events: 2.92             │ │
         │ │      [View Details] ◄────┼─┼─ Click to open batch
         │ └──────────────────────────┘ │
         └──────────────────────────────┘
                   │
                   ▼
         Opens: batchCodes.html?batch=FM0173
```

## Troubleshooting

### Modal doesn't open
- Check browser console for errors
- Ensure ZipcodeRiskSummary.json loaded correctly
- Verify JavaScript is enabled

### Batch list is empty
- Check if `top_batches` field exists in data
- Verify JSON parsing in browser console

### Link doesn't work
- Batch links work, but batchCodes.html needs Phase 2 update
- Links pass the correct parameter

## For Developers

### Key Functions

```javascript
// Show modal for a zipcode
showBatchDetailsModal(zipData)

// Check URL for zipcode parameter
checkUrlParameters()

// Initialize modal event handlers
initializeModal()
```

### Data Structure

```javascript
// Zipcode row data
{
  zipcode: "96746",
  total_doses: 300.0,
  total_adverse_events: 2.92,
  risk_category: "HIGH",
  top_batches: "[{\"batch\": \"FM0173\", \"adverse_events\": 2.92}]"
}

// Parsed batch list
[
  { batch: "FM0173", adverse_events: 2.92 }
]
```

### CSS Classes

```css
.clickable-row       /* Hover effect on table rows */
.modal               /* Modal overlay */
.batch-item          /* Individual batch in list */
.risk-HIGH           /* Risk level styling */
```

## Next Steps

See `PHASE1_TESTING.md` for comprehensive testing guide.

Phase 2 will update `batchCodes.html` to:
- Read URL parameters
- Auto-filter for batch code
- Highlight the batch row
- Load histogram automatically
