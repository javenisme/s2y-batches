# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**s2y-batches** (HowBadIsMyBatch) is a vaccine batch safety surveillance platform that analyzes VAERS (Vaccine Adverse Event Reporting System) data to generate static HTML/JavaScript web applications. The project processes millions of adverse event reports and deploys them via Cloudflare Pages.

**Architecture**: Python batch ETL pipeline (src/) → Static JSON datasets (docs/data/) → Client-side JavaScript rendering (docs/*.html, docs/*.js) → Cloudflare Pages deployment

## Common Commands

### Build & Deploy
```bash
# Clean up invalid files before build/deploy
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Both commands also run automatically via postinstall hook
```

### Python Development
```bash
# Create conda environment (required)
conda env create -f environment.yml
conda activate howbadismybatch-venv

# Install Jupyter kernel
ipython kernel install --user --name=howbadismybatch-venv-kernel

# Execute main data processing pipeline
cd src
jupyter nbconvert --to script HowBadIsMyBatch.ipynb
python ./HowBadIsMyBatch.py

# Run tests (unittest framework)
python -m unittest BatchCodeTableFactoryTest
python -m unittest SymptomByBatchcodeTableFactoryTest
# etc. - test files end with Test.py
```

### Running Individual Modules
```python
# In Python REPL or Jupyter:
from BatchCodeTableFactory import BatchCodeTableFactory
from IOUtils import IOUtils
import pandas as pd

# Create batch code table from DataFrame
factory = BatchCodeTableFactory(vaers_dataframe)
global_table = factory.createGlobalBatchCodeTable()

# Persist to JSON
IOUtils.saveDataFrameAsJson(global_table, 'docs/data/batchCodeTables/Global.json')
```

## Core Architecture

### Data Processing Pipeline (Python)

**Entry point**: `src/HowBadIsMyBatch.ipynb` (main orchestration notebook)

**Key processing stages:**

1. **VAERS Data Acquisition** (`VAERSFileDownloader.py`)
   - Automated downloads with ML-based captcha solving (TensorFlow MobileNetV3Small)
   - Uses Selenium WebDriver for automation
   - Downloads VAERSDATA, VAERSVAX, VAERSSYMPTOMS CSV files

2. **Data Filtering & Enrichment**
   - `InternationalVaersCovid19Provider`: Filters for COVID-19 vaccines only
   - `CountryColumnAdder`: Enriches with country data from SPLTTYPE column
   - `SevereColumnAdder`: Calculates severity metrics
   - `CompanyColumnAdder`: Maps batch codes to manufacturers

3. **Batch Code Analysis** (`BatchCodeTableFactory.py`)
   - Groups by VAX_LOT (batch code)
   - Aggregates: Deaths, Disabilities, Life-Threatening Illnesses, Hospitalizations
   - Calculates "Severe reports" percentage and "Lethality" percentage
   - Output: `docs/data/batchCodeTables/Global.json`

4. **Symptom-by-Batch Analysis** (`SymptomByBatchcodeTableFactory.py`)
   - Multi-index processing: up to 10 doses × 5 symptoms per report
   - Creates histograms of symptom frequencies per batch
   - Output: `docs/data/histograms/Global/{batchcode}.json` (1 file per batch)

5. **Geographic Distribution** (`CountryCountsByBatchcodeProvider`)
   - Jensen-Shannon distance calculation for geographic divergence
   - Merges Google Analytics click data with VAERS data
   - Output: `docs/data/barChartDescriptionTable.json`

6. **Zipcode-Level Analysis**
   - Reads Pfizer distribution Excel file
   - Calculates adverse reaction estimates per provider/zipcode
   - Output: `docs/data/vaccineDistributionByZipcode/VaccineDistributionByZipcode.json`

### Frontend Architecture (JavaScript)

**Entry points:**
- `docs/batchCodes.html` - Main batch code lookup interface
- `docs/HowBadIsMyBatch.html` - Pre-rendered large batch table
- `docs/VaccineDistributionByZipcode.html` - Zipcode distribution viewer

**Key patterns:**

**Data loading** (lazy loading for performance):
```javascript
// Histograms loaded on-demand when batch clicked
class HistoDescrsProvider {
  static getHistoDescrs(batchcode) {
    return fetch(`data/histograms/Global/${batchcode}.json`)
      .then(response => response.json())
  }
}
```

**DataTables initialization**:
```javascript
// BatchCodeTableInitializer.js
BatchCodeTableInitializer.initialize(
  showCountriesColumn,  // from URL params
  dataTablesFilter      // optional column visibility
)
```

**Key JavaScript modules:**
- `BatchCodeTableInitializer.js`: Main table setup with custom column renderers
- `HistogramTable.js`: Symptom frequency visualization
- `BatchcodeByCountryBarChart.js`: Geographic distribution charts (Chart.js)
- `ColumnSearch.js`: Per-column filtering for DataTables
- `Select2.js`: Batch code autocomplete dropdown

### Common Patterns

**Python:**
- All factory classes follow pattern: `__init__(dataFrame)` → `create...()` methods
- Use `IOUtils` for all file I/O (ensures directories exist, handles JSON/Excel/HTML)
- DataFrames use specific column names: `VAX_LOT`, `VAERS_ID`, `COUNTRY`, `DIED`, etc.
- Test files mirror implementation: `XxxFactory.py` → `XxxFactoryTest.py`
- Aggregation via `SummationTableFactory.createSummationTable(grouped_df)`

**JavaScript:**
- Provider pattern for data fetching: `XxxProvider.getXxx(params)`
- View classes for rendering: `XxxView.render(data)`
- DataTables uses `orient="split"` JSON format from pandas
- All charts use Chart.js library
- URL parameters control column visibility and initial state

**Data flow:**
```
VAERS CSV files
  ↓ (VAERSFileDownloader + VaersDescrReader)
pandas DataFrame
  ↓ (Filter, Normalize, Enrich)
Aggregated DataFrames
  ↓ (Factory classes)
JSON files in docs/data/
  ↓ (Fetch API in browser)
DataTables + Chart.js rendering
```

## Critical Data Structures

### VAERS Schema
- **VAERSDATA**: `VAERS_ID`, `DIED`, `DISABLE`, `L_THREAT`, `HOSPITAL`, `SPLTTYPE`
- **VAERSVAX**: `VAERS_ID`, `VAX_DOSE_SERIES`, `VAX_TYPE`, `VAX_MANU`, `VAX_LOT`
- **VAERSSYMPTOMS**: `VAERS_ID`, `SYMPTOM1`, `SYMPTOM2`, `SYMPTOM3`, `SYMPTOM4`, `SYMPTOM5`

### Output JSON Formats

**Batch Code Table** (`Global.json`):
```json
{
  "columns": ["Adverse Reaction Reports", "Deaths", "Disabilities", ...],
  "data": [["ABC123", 1250, 45, 300, ...], ...]
}
```

**Histogram** (`Global/{batchcode}.json`):
```json
{
  "batchcode": "ABC123",
  "Company": "Pfizer",
  "Adverse Reaction Reports": 1250,
  "histograms": [{
    "batchcodes": ["ABC123"],
    "histogram": {"Headache": 342, "Chest pain": 156, ...}
  }]
}
```

**Bar Chart Description** (`barChartDescriptionTable.json`):
```json
{
  "barChartDescriptions": {
    "ABC123": {
      "Jensen-Shannon distance": 0.45,
      "countries": {"United States": 800, "Canada": 150}
    }
  },
  "date range known": "2020-12-01 to 2023-06-30"
}
```

## Important Implementation Details

### Build System Peculiarities

The `postinstall` and `build` scripts perform critical cleanup:
```bash
rm -rf docs/SymptomsCausedByDrugs
find docs/data/histograms/Global -type f \( -name '* *' -o -name '*[#%;]*' \) -delete
```

**Why**: Cloudflare Pages has asset count limits. Invalid filenames (with spaces or special chars) are removed to prevent deployment failures.

**Wrangler ignore** (`.wranglerignore`): Excludes large directories from deployment while keeping them for local processing.

### Captcha Automation

The `captcha/` module contains a TensorFlow model for solving VAERS website captchas:
- Model: `captcha/MobileNetV3Small/` (SavedModel format)
- Usage: `CaptchaReader.py` (called by `VAERSFileDownloader`)
- Allows fully automated weekly data updates via GitHub Actions

### Multi-Index DataFrames

`SymptomByBatchcodeTableFactory` creates DataFrames with up to 11 index levels:
```python
# Index: (VAX_LOT1, VAX_LOT2, ..., VAX_LOT10, SYMPTOM)
# Exploded via MultiIndexExploder for JSON output
```

### Testing

Run all tests from `src/` directory:
```bash
python -m unittest discover -s . -p '*Test.py'
```

Test naming: `SomeClassTest.py` tests `SomeClass.py`

### GitHub Actions Automation

Weekly scheduled job (Saturday 01:30 UTC):
1. Sets up conda environment
2. Installs Google Chrome (for Selenium)
3. Executes `HowBadIsMyBatch.ipynb` → `HowBadIsMyBatch.py`
4. Commits updated JSON files
5. Pushes to GitHub Pages branch

## Deployment

**Current**: Cloudflare Pages via Wrangler
- Config: `wrangler.jsonc`
- Assets directory: `./docs`
- Deploy: `npm run deploy`

**Previous**: GitHub Pages (static files)

## Data Sources

1. **VAERS**: https://vaers.hhs.gov/data/datasets.html (CSV downloads)
2. **Pfizer Distribution**: `data/Amended-22-01962-Pfizer-2022-0426-pulled-2022-0823.xlsx`
3. **EudraVigilance**: 7z-compressed PRR data (SymptomsCausedByDrugs)
4. **Google Analytics**: CSV exports with batch code click tracking
5. **Pathologies DB**: `1000-pathologies.xlsx`

## Key Dependencies

**Python**:
- pandas 1.4.0 (DataFrame processing)
- tensorflow 2.11 (captcha model)
- selenium 4.19.* (web automation)
- jupyter, numpy, simplejson

**JavaScript** (loaded from CDN):
- jQuery 3.5.1
- DataTables 1.13.1
- Chart.js 4.2.0
- Select2 (autocomplete)
- noUiSlider 15.5.1 (range filters)

**Deployment**:
- wrangler ^3.0.0 (Cloudflare CLI)

## Performance Considerations

- **Lazy loading**: Histogram JSON files loaded only when batch code clicked
- **Pre-aggregation**: All statistics computed in Python; no runtime calculations
- **Deferred rendering**: DataTables uses `deferRender=true` for large tables
- **Optional columns**: Countries column (2MB) toggleable via query params
- **Browser caching**: Static JSON files cached aggressively

## Working with This Codebase

### Adding New Analysis Features

1. Create factory class in `src/` (e.g., `NewAnalysisFactory.py`)
2. Add corresponding test file (`NewAnalysisFactoryTest.py`)
3. Update `HowBadIsMyBatch.ipynb` to call new factory
4. Persist output via `IOUtils` to `docs/data/`
5. Create JavaScript loader in `docs/` if needed
6. Update HTML to wire up new functionality

### Modifying Batch Code Table Columns

1. Update `BatchCodeTableFactory._postProcess()` column list
2. Update `SummationTableFactory` if adding new aggregations
3. Update `BatchCodeTableInitializer.js` column definitions
4. Test with: `python -m unittest BatchCodeTableFactoryTest`

### Adding New Data Sources

1. Create reader class (e.g., `NewDataSourceReader.py`)
2. Add normalization in reader (uppercase batch codes, Y/N → 1/0)
3. Use `DataFrameJoinAndDeduplicate` to merge with existing data
4. Update relevant factory classes to use new columns

### Debugging DataTables Issues

Enable browser console logging in `BatchCodeTableInitializer.js`:
```javascript
console.log('columns:', columns);
console.log('data:', data);
```

Check JSON format: `orient="split"` requires `{columns: [...], data: [[...]]}`

### Working with GitHub Actions

Test notebook conversion locally:
```bash
cd src
jupyter nbconvert --to script HowBadIsMyBatch.ipynb
python ./HowBadIsMyBatch.py
```

Monitor action logs for captcha solving failures (may need manual intervention).
