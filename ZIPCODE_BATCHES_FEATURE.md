# Zipcode-to-Batches Lookup Feature

## Overview

This feature adds the ability to search for vaccine batches distributed to specific ZIP codes. Users can now enter a ZIP code and see all vaccine batches that were shipped to that area, along with detailed safety information.

## Components

### Backend (Python)

#### 1. ZipcodeBatchesFactory (`src/ZipcodeBatchesFactory.py`)

Factory class that creates zipcode-to-batches mappings from vaccine distribution data.

**Key Methods:**
- `createZipcodeBatchesMapping()` - Creates full mapping with batch details, doses, and adverse report statistics
- `createCompactZipcodeBatchesMapping()` - Creates lightweight mapping with just batch codes per zipcode

**Input:** DataFrame from `VaccineDistributionByZipcode.json` with columns:
- `Provider` (or `PROVIDER_NAME`)
- `ZIP Code` (or `ZIPCODE_SHP`)
- `Lot Number` (or `LOT_NUMBER`)
- `Doses Shipped` (or `DOSES_SHIPPED`)
- `Statistical Number of Adverse Reaction Reports` (optional)
- `Statistical Number of Adverse Reaction Reports (per 100,000)` (optional)

**Output Format (Full Mapping):**
```json
{
  "zipcodes": {
    "12345": [
      {
        "batch": "ABC123",
        "provider": "Provider Name",
        "doses": 1000,
        "adverseReports": 5.2,
        "adverseReportsPer100k": 520
      },
      ...
    ]
  },
  "metadata": {
    "totalZipcodes": 15000,
    "totalBatches": 5000
  }
}
```

**Output Format (Compact Mapping):**
```json
{
  "12345": ["ABC123", "DEF456", "GHI789"],
  "67890": ["JKL012", "MNO345"],
  ...
}
```

**Features:**
- Automatic sorting of batches by adverse reports (highest first)
- Normalization of column names for flexibility
- Handles missing adverse report data gracefully

#### 2. ZipcodeBatchesFactoryTest (`src/ZipcodeBatchesFactoryTest.py`)

Comprehensive test suite with 10 test cases covering:
- Data structure validation
- Zipcode grouping
- Batch information completeness
- Sorting by adverse reports
- Metadata accuracy
- Compact mapping format
- Missing data handling
- Column name normalization

**Running Tests:**
```bash
cd src
python3 -m unittest ZipcodeBatchesFactoryTest
```

#### 3. generateZipcodeBatchesData.py (`src/generateZipcodeBatchesData.py`)

Standalone script to generate the zipcode-batches JSON files.

**Usage:**
```bash
cd src
python3 generateZipcodeBatchesData.py
```

**Output Files:**
- `docs/data/zipcodeBatches/ZipcodeBatches.json` - Full data (18-20 MB)
- `docs/data/zipcodeBatches/ZipcodeBatchesCompact.json` - Compact version (3-5 MB)

**Console Output:**
- Loading progress
- Dataset statistics
- File sizes and compression ratio
- Sample data for verification

### Frontend (JavaScript)

#### 4. ZipcodeBatchesProvider (`docs/ZipcodeBatchesProvider.js`)

Provider class following the same pattern as `HistoDescrsProvider`.

**Key Methods:**

```javascript
// Get full batch information for a zipcode
ZipcodeBatchesProvider.getBatchesByZipcode("12345")
  .then(batches => {
    // batches is an array of batch objects with all details
  });

// Get just batch codes (uses compact file)
ZipcodeBatchesProvider.getCompactBatchesByZipcode("12345")
  .then(batchCodes => {
    // batchCodes is an array of strings
  });

// Find all zipcodes that received a specific batch
ZipcodeBatchesProvider.getZipcodesByBatch("ABC123")
  .then(zipcodes => {
    // zipcodes is a sorted array of zipcode strings
  });

// Get metadata about the dataset
ZipcodeBatchesProvider.getMetadata()
  .then(metadata => {
    // { totalZipcodes: 15000, totalBatches: 5000 }
  });

// Get all available zipcodes
ZipcodeBatchesProvider.getAllZipcodes()
  .then(zipcodes => {
    // sorted array of all zipcodes
  });
```

**Features:**
- Automatic zipcode normalization (removes spaces, hyphens)
- Caching for improved performance
- Lazy loading of full dataset
- Error handling

#### 5. BatchesByZipcode.html (`docs/BatchesByZipcode.html`)

User-facing interface for zipcode lookup.

**Features:**
- Clean, intuitive search interface
- ZIP code validation (5-digit format)
- Real-time search results
- Batch cards showing:
  - Batch code
  - Provider name
  - Doses shipped
  - Adverse reaction reports
  - Reports per 100,000 doses
- Color-coded warning levels:
  - Green: < 50 reports per 100k
  - Orange: 50-100 reports per 100k
  - Red: > 100 reports per 100k
- Loading states
- Error handling for invalid/not-found zipcodes
- Responsive design
- Integrated navigation to other pages

**User Flow:**
1. Enter ZIP code (e.g., "12345")
2. Click "Search" or press Enter
3. View all batches distributed to that area
4. See adverse event statistics for each batch

## Integration

### Navigation Updates

Updated navigation bars in:
- `docs/batchCodes.html` - Added "📍 Batches by Zipcode" link
- `docs/ZipcodeRiskMap.html` - Added "📍 Batches by Zipcode" link

Navigation appears on all main pages for easy access.

### Data Generation Pipeline

To integrate into the main pipeline, add to `HowBadIsMyBatch.ipynb`:

```python
# After vaccine distribution data is processed
from ZipcodeBatchesFactory import ZipcodeBatchesFactory
import json

# Load the vaccine distribution data
vaccine_dist_df = pd.read_json(
    '../docs/data/vaccineDistributionByZipcode/VaccineDistributionByZipcode.json',
    orient='split'
)

# Create factory and generate mappings
factory = ZipcodeBatchesFactory(vaccine_dist_df)

# Generate full mapping
full_mapping = factory.createZipcodeBatchesMapping()
with open('../docs/data/zipcodeBatches/ZipcodeBatches.json', 'w') as f:
    json.dump(full_mapping, f, indent=2)

# Generate compact mapping
compact_mapping = factory.createCompactZipcodeBatchesMapping()
with open('../docs/data/zipcodeBatches/ZipcodeBatchesCompact.json', 'w') as f:
    json.dump(compact_mapping, f, indent=2)
```

## File Structure

```
s2y-batches/
├── src/
│   ├── ZipcodeBatchesFactory.py            # Factory class
│   ├── ZipcodeBatchesFactoryTest.py        # Unit tests
│   └── generateZipcodeBatchesData.py       # Data generation script
├── docs/
│   ├── ZipcodeBatchesProvider.js           # JavaScript provider
│   ├── BatchesByZipcode.html               # User interface
│   ├── batchCodes.html                     # Updated with nav link
│   ├── ZipcodeRiskMap.html                 # Updated with nav link
│   └── data/
│       └── zipcodeBatches/
│           ├── ZipcodeBatches.json         # Full mapping (to be generated)
│           └── ZipcodeBatchesCompact.json  # Compact mapping (to be generated)
└── ZIPCODE_BATCHES_FEATURE.md             # This file
```

## Usage Examples

### Python

```python
from ZipcodeBatchesFactory import ZipcodeBatchesFactory
import pandas as pd

# Load data
df = pd.read_json('docs/data/vaccineDistributionByZipcode/VaccineDistributionByZipcode.json', orient='split')

# Create factory
factory = ZipcodeBatchesFactory(df)

# Get full mapping
full_data = factory.createZipcodeBatchesMapping()
print(f"Total zipcodes: {full_data['metadata']['totalZipcodes']}")

# Get batches for a specific zipcode
zipcode = "12345"
if zipcode in full_data['zipcodes']:
    batches = full_data['zipcodes'][zipcode]
    print(f"Found {len(batches)} batches for zipcode {zipcode}")
    for batch in batches[:5]:  # Show first 5
        print(f"  - {batch['batch']}: {batch['doses']} doses, {batch.get('adverseReports', 'N/A')} reports")
```

### JavaScript

```javascript
// Simple zipcode lookup
ZipcodeBatchesProvider.getBatchesByZipcode("90210")
  .then(batches => {
    console.log(`Found ${batches.length} batches`);
    batches.forEach(batch => {
      console.log(`${batch.batch}: ${batch.doses} doses from ${batch.provider}`);
    });
  })
  .catch(error => {
    console.error("Error:", error);
  });

// Find where a batch was distributed
ZipcodeBatchesProvider.getZipcodesByBatch("EN6201")
  .then(zipcodes => {
    console.log(`Batch EN6201 was distributed to ${zipcodes.length} zipcodes`);
    console.log(zipcodes.slice(0, 10).join(", ")); // Show first 10
  });
```

## Performance Considerations

1. **File Sizes:**
   - Full mapping: ~18-20 MB (detailed batch information)
   - Compact mapping: ~3-5 MB (batch codes only)
   - Use compact mapping when only batch codes are needed

2. **Caching:**
   - Provider caches individual zipcode lookups
   - Full dataset cached after first load
   - Use `clearCache()` to force reload if needed

3. **Lazy Loading:**
   - Full dataset only loaded when needed
   - Individual zipcode results cached separately
   - Minimal initial page load

4. **Data Processing:**
   - Generation script processes ~18MB JSON file
   - Takes 30-60 seconds depending on system
   - Should be run during build process, not on-demand

## Future Enhancements

Possible additions:
1. Auto-complete for zipcode search
2. Nearby zipcode suggestions
3. Batch comparison between zipcodes
4. Heat map visualization of batch distribution
5. Export functionality (CSV, PDF)
6. Batch-specific filtering (by manufacturer, date range)
7. Integration with batch details page (click-through)

## Testing

### Unit Tests
```bash
cd src
python3 -m unittest ZipcodeBatchesFactoryTest
# Should show: OK (10 tests passed)
```

### Manual Testing
1. Generate data: `cd src && python3 generateZipcodeBatchesData.py`
2. Start local server: `cd docs && python3 -m http.server 8000`
3. Open: http://localhost:8000/BatchesByZipcode.html
4. Test zipcodes: 12345, 90210, 37209 (from sample data)
5. Verify batch cards display correctly
6. Check warning colors for high adverse report batches

## Troubleshooting

### Data generation fails
- Ensure `VaccineDistributionByZipcode.json` exists in `docs/data/vaccineDistributionByZipcode/`
- Check file is valid JSON with `orient='split'` format
- Verify pandas is installed: `pip install pandas`

### UI shows "No batches found"
- Run data generation script first
- Check JSON files exist in `docs/data/zipcodeBatches/`
- Verify files are not empty: `ls -lh docs/data/zipcodeBatches/`
- Check browser console for fetch errors

### Tests fail
- Ensure pandas is installed
- Check Python version >= 3.7
- Run from `src/` directory
- Check file permissions

## License & Attribution

This feature is part of the HowBadIsMyBatch project by Craig Paardekooper.

Data sources:
- VAERS (Vaccine Adverse Event Reporting System)
- Pfizer vaccine distribution data (FOIA request)
