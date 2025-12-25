# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

**s2y-batches** ("HowBadIsMyBatch") is a vaccine batch safety surveillance platform. It ingests VAERS and related datasets, runs a Python batch ETL/analytics pipeline, and publishes pre-aggregated JSON artifacts that power a static HTML/JavaScript website hosted on Cloudflare Pages.

High-level flow:

1. **Data acquisition & preprocessing (Python, `src/`)**
   - Downloads VAERS CSVs and other inputs.
   - Normalizes, filters, and enriches data (COVID-only, country, severity, manufacturer, etc.).
2. **Analysis & aggregation (Python, `src/`)**
   - Builds batch-level, symptom-level, geographic, and zipcode-level tables.
   - Writes JSON into `docs/data/` in formats suited for DataTables and Chart.js.
3. **Static site rendering (JavaScript, `docs/`)**
   - HTML entrypoints and JS modules read JSON under `docs/data/` via `fetch()`.
   - Client-side code builds interactive tables and charts (DataTables + Chart.js).
4. **Deployment (Cloudflare Pages)**
   - `wrangler.jsonc` declares `./docs` as the static assets directory.
   - A GitHub Actions workflow regularly regenerates data and pushes updates.

## Common commands

### Node / deployment

From the repo root:

```bash
# Install JS tooling (wrangler)
npm install

# Clean up problematic histogram files and large directories before deployment
npm run build

# Deploy static site in ./docs to Cloudflare Pages
npm run deploy
```

Notes:
- `npm run build` and the `postinstall` script both perform the same cleanup:
  - Remove `docs/SymptomsCausedByDrugs`.
  - Delete files in `docs/data/histograms/Global` whose names contain spaces or certain special characters.
- `.wranglerignore` (both in the repo root and in `docs/`) excludes `SymptomsCausedByDrugs` and `data/histograms/Global` from deployment to keep the asset count manageable.

### Python environment & pipeline execution

Create and activate the conda environment (Python 3.9 + TensorFlow + pandas, etc.):

```bash
conda env create -f environment.yml
conda activate howbadismybatch-venv
```

Optional but recommended for notebook work:

```bash
ipython kernel install --user --name=howbadismybatch-venv-kernel
```

Run the main data processing pipeline (mirrors GitHub Actions):

```bash
cd src
jupyter nbconvert --to script HowBadIsMyBatch.ipynb
python ./HowBadIsMyBatch.py
```

This regenerates the JSON artifacts in `docs/data/` used by the frontend.

### Tests (Python, `unittest`)

Run the full test suite from `src/`:

```bash
cd src
python -m unittest discover -s . -p '*Test.py'
```

Run a single test module (example):

```bash
cd src
python -m unittest BatchCodeTableFactoryTest
```

Any `XxxTest.py` file under `src/` can be run this way (e.g. `SymptomByBatchcodeTableFactoryTest`, `CountriesByBatchcodeProviderTest`).

### One-off analysis scripts

The repo root contains helper scripts such as `analyze_batch_EJ6795.py`, `analyze_ph.py`, `analyze_uk.py`, and `analyze_zip.py` for targeted exploratory analysis. These assume the conda environment is active and the VAERS-derived datasets have been generated.

```bash
conda activate howbadismybatch-venv
python analyze_batch_EJ6795.py
```

## Architecture and code structure

### End-to-end data flow

The core data pipeline follows this pattern (details are spread across many modules and are summarized here):

1. **Download raw datasets**
   - `VAERSFileDownloader.py` (and helpers under `src/captcha/`, `WebDriver.py`) automate VAERS CSV downloads using Selenium and an ML-based captcha solver (TensorFlow MobileNetV3Small).
2. **Read and normalize VAERS data**
   - `VaersReader.py`, `VaersDescrReader.py` read `VAERSDATA`, `VAERSVAX`, and `VAERSSYMPTOMS`.
   - `DataFrameNormalizer.py`, `DataFrameFilter.py`, and related helpers standardize column types, filter for COVID-19 vaccines, and apply reusable filters.
3. **Enrich with derived columns**
   - Country and geography: `CountryColumnAdder.py`, `CountriesColumnAdder.py`, `CountryColumnsMerger.py`, `CountriesMerger.py`.
   - Severity: `SevereColumnAdder.py` derives "severe" flags from `DIED`, `DISABLE`, `L_THREAT`, `HOSPITAL`.
   - Manufacturer & batch mapping: `CompanyColumnAdder.py` and supporting utilities.
4. **Aggregate into analytics tables**
   - Batch-level metrics: `BatchCodeTableFactory.py`, `ADR_by_Batchcode_Table_Factory.py` aggregate by `VAX_LOT` (batch code), computing counts and severity/lethality percentages.
   - Symptom-by-batch: `SymptomByBatchcodeTableFactory.py`, `SymptomHistogramByBatchcodeTableFactory.py` explode multi-dose and multi-symptom fields into histograms.
   - Geographic distribution: `CountryCountsByBatchcodeTable2BarChartDescriptionTableConverter.py`, `CountryCountsByBatchcodeTablesMerger.py`, `CountryCountsByClickedBatchcodeProvider.py`, and `JensenShannonDistance2BarChartDescriptionColumnAdder.py` combine VAERS with geographic metrics.
   - Zipcode-level distribution: `VaccineDistributionByZipcodeSimplifier.py` produces zipcode/provider-level aggregates from Pfizer distribution spreadsheets.
   - Supporting utilities: `SummationTableFactory.py`, `HistogramDescriptionTableFactory.py`, `HistogramTable2DictTableConverter.py`, `MultiIndexExploder.py`, `MultiIndexValuesProvider.py`, `TablesHelper.py` encapsulate common DataFrame transformations and conversions to JSON-friendly structures.
5. **Persist JSON artifacts for the frontend**
   - `IOUtils.py` centralizes file I/O, ensuring directories exist and handling JSON/Excel/HTML persistence.
   - Output targets include (non-exhaustive):
     - `docs/data/batchCodeTables/Global.json` – main batch table.
     - `docs/data/histograms/Global/{batchcode}.json` – per-batch symptom histograms.
     - `docs/data/barChartDescriptionTable.json` – geographic divergence metrics.
     - `docs/data/vaccineDistributionByZipcode/VaccineDistributionByZipcode.json` – zipcode/provider distribution.
6. **Automation & CI**
   - `.github/workflows/buildAndDeployWebsite.yml` provisions the conda env and Chrome, executes `HowBadIsMyBatch.ipynb` as a script (`HowBadIsMyBatch.py`), commits updated data files, and pushes to the repository on a weekly schedule.

### Python pipeline layout (`src/`)

Key structural pieces:

- **Orchestration**
  - `HowBadIsMyBatch.ipynb` is the main notebook orchestrating the full ETL and analytics workflow. It imports many of the modules listed above and coordinates the end-to-end run.
- **Core processing modules**
  - Modules are organized by responsibility rather than by package hierarchy; most live directly under `src/`.
  - Naming patterns:
    - `*Provider.py` – high-level data providers that assemble, filter, or merge DataFrames for specific use cases (e.g. `InternationalVaersCovid19Provider.py`, `CountriesByBatchcodeProvider.py`).
    - `*Factory.py` – create specific tables or aggregated views from normalized data (e.g. `BatchCodeTableFactory.py`, `SymptomByBatchcodeTableFactory.py`, `HistogramDescriptionTableFactory.py`).
    - `*Adder.py` / `*Merger.py` – mutate or combine DataFrames by adding or merging columns (e.g. `SevereColumnAdder.py`, `CountriesColumnMerger.py`).
- **Captcha and web automation (`src/captcha/`, `WebDriver.py`, `AndroidEmulator.py`)**
  - `src/captcha/` encapsulates captcha generation, dataset splitting, TensorFlow model definitions (`MobileNetV3Small`), and decoding logic.
  - `VAERSFileDownloader.py` and `WebDriver.py` use Selenium + Chrome to interact with the VAERS site, leveraging the captcha model to automate downloads.
- **External data integrations**
  - `GoogleAnalyticsReader.py` reads GA exports to correlate click data with batchcodes.
  - `DrugsForPathologies/`, `SymptomsCausedByVaccines/`, and related modules tie in additional pharmacovigilance sources.
- **Testing pattern**
  - Each significant module tends to have a corresponding `XxxTest.py` file (e.g. `BatchCodeTableFactoryTest.py`, `CountryCountsByClickedBatchcodeProviderTest.py`, `MultiIndexExploderTest.py`).
  - Tests focus on verifying DataFrame transformations and JSON shape expectations.

### Frontend layout (`docs/`)

The `docs/` directory contains the static site served by Cloudflare Pages:

- **HTML entrypoints**
  - `batchCodes.html` – main interactive batch code lookup UI.
  - `HowBadIsMyBatch.html` – pre-rendered large batch table.
  - `VaccineDistributionByZipcode.html` – zipcode/provider distribution explorer.
  - `index.html` – landing page linking into the main views.
- **Table and chart initializers**
  - `BatchCodeTableInitializer.js` wires the main batch table, including column definitions, renderers, filters, and URL-parameter-based options (e.g., whether to show the "Countries" column).
  - `VaccineDistributionByZipcodeTableInitializer.js` builds the zipcode distribution table from `docs/data/vaccineDistributionByZipcode/` outputs.
  - `BatchcodeByCountryBarChart.js` and `BatchcodeByCountryBarChartView.js` wire geographic distribution charts using Chart.js.
  - `HistogramTable.js` renders symptom histograms for a selected batch.
- **Data provider modules**
  - `HistoDescrsProvider.js`, `CompanyByBatchcodeProvider.js`, and related files encapsulate `fetch()` calls to JSON endpoints under `docs/data/`.
  - Providers typically return Promises resolving to parsed JSON in the same "split" orientation that pandas uses (`{"columns": [...], "data": [...]}`).
- **UI utilities and search helpers**
  - `BatchCodeSelectInitializer.js`, `Select2.js` – configure autocomplete dropdowns for batchcodes.
  - `ColumnSearch.js`, `DataTablesFilter.js` – column-level and global table filtering atop DataTables.
  - `URLSearchParam.js`, `UrlUtils.js`, `UIUtils.js`, `Utils.js`, `NumberWithBarElementFactory.js` – small helpers for URL parsing, DOM updates, and visual embellishments.
- **Static assets and templates**
  - `GoogleAnalytics.js` – GA tracking integration.
  - `forkMeOnGitHub.css`, `gentelella/` – styling and admin template resources.

### JSON formats and coupling with the frontend

The Python side and frontend are tightly coupled via JSON shapes:

- Batch tables (e.g. `docs/data/batchCodeTables/Global.json`) follow the pandas `orient="split"` convention: top-level `"columns"` and `"data"` arrays. DataTables uses this directly.
- Histogram files under `docs/data/histograms/Global/` contain:
  - batch metadata (`batchcode`, `Company`, `Adverse Reaction Reports`), and
  - one or more histogram entries with `histogram` maps from symptom names to counts.
- `barChartDescriptionTable.json` exposes batch-level geographic metrics such as Jensen–Shannon distance and per-country counts; `BatchcodeByCountryBarChart.js` and related view code expect this structure.

When modifying JSON schemas, update both the factory/producer modules in `src/` and the corresponding DataTables/Chart.js consumers in `docs/`.

### Deployment and automation details

- **Cloudflare Pages**
  - `wrangler.jsonc` declares the project name and sets `assets.directory` to `./docs`.
  - `.wranglerignore` files (root and `docs/`) ensure that very large or unused directories like `SymptomsCausedByDrugs` and `data/histograms/Global` are not uploaded.
- **GitHub Actions (`.github/workflows/buildAndDeployWebsite.yml`)**
  - Scheduled weekly (`cron: "30 1 * * 6"`) plus manual dispatch.
  - Steps:
    1. Check out the repo and configure git.
    2. Create/activate the `howbadismybatch-venv` conda environment from `environment.yml`.
    3. Install Google Chrome for Selenium-based scraping.
    4. Install the IPython kernel.
    5. Convert `HowBadIsMyBatch.ipynb` into `HowBadIsMyBatch.py` and execute it.
    6. `git add -A` and conditionally commit updated data files.
    7. `git push` back to the repository (which then feeds Cloudflare Pages via `npm run deploy` when run locally).

## Working within this architecture

These patterns, adapted from the existing Claude guidance, are important when extending the system:

- **Adding a new analysis**
  - Create a new factory module under `src/` (e.g. `NewAnalysisFactory.py`) that takes in normalized DataFrames and outputs a DataFrame or dict ready for JSON serialization.
  - Add a corresponding `NewAnalysisFactoryTest.py` to cover the new logic and expected JSON shape.
  - Integrate the factory into `HowBadIsMyBatch.ipynb` so it runs as part of the main pipeline.
  - Use `IOUtils` to persist the output into an appropriate subdirectory of `docs/data/`.
  - If the result is user-facing, add a JS provider and view module under `docs/` and wire it into an HTML entrypoint.

- **Changing batch table columns or metrics**
  - Adjust aggregation logic and column definitions in `BatchCodeTableFactory.py` (and helpers like `SummationTableFactory.py`).
  - Update `BatchCodeTableInitializer.js` (and any related table or chart views) to align with the new column order, visibility, and semantics.
  - Run focused tests such as `python -m unittest BatchCodeTableFactoryTest` to verify DataFrame-level behavior before regenerating the full dataset.

- **Introducing new data sources**
  - Implement a dedicated reader/normalizer module (e.g. `NewDataSourceReader.py`) to encapsulate parsing and normalization (uppercase batch codes, standardized Y/N flags, consistent identifiers).
  - Use join utilities such as `DataFrameJoinAndDeduplicate.py` to merge the new data into existing tables.
  - Extend relevant factories and provider modules to incorporate the new columns or metrics and expose them to the frontend as needed.
