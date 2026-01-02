#!/usr/bin/env python3
"""
Generate zipcode-to-batches mapping data for batch lookup by zipcode.

This script creates JSON files that enable users to search for vaccine batches
distributed to specific ZIP codes:
- ZipcodeBatches.json: Full data with batch details, doses, and adverse reports
- ZipcodeBatchesCompact.json: Compact version with just batch codes per zipcode
"""

import os
import json
import pandas as pd
from ZipcodeBatchesFactory import ZipcodeBatchesFactory

def main():
    print("=" * 70)
    print("Generating Zipcode-Batches Mapping Data")
    print("=" * 70)

    # Input path
    input_path = '../docs/data/vaccineDistributionByZipcode/VaccineDistributionByZipcode.json'

    # Output paths
    output_dir = '../docs/data/zipcodeBatches'
    full_path = os.path.join(output_dir, 'ZipcodeBatches.json')
    compact_path = os.path.join(output_dir, 'ZipcodeBatchesCompact.json')

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    print(f"\n1. Loading vaccine distribution data from {input_path}...")

    # Load the vaccine distribution data
    df = pd.read_json(input_path, orient='split')
    print(f"   - Loaded {len(df):,} records")
    print(f"   - Unique zipcodes: {df['ZIP Code'].nunique():,}")
    print(f"   - Unique batches: {df['Lot Number'].nunique():,}")

    # Create factory
    factory = ZipcodeBatchesFactory(df)

    print(f"\n2. Creating full zipcode-batches mapping...")
    full_mapping = factory.createZipcodeBatchesMapping()

    print(f"\n3. Creating compact zipcode-batches mapping...")
    compact_mapping = factory.createCompactZipcodeBatchesMapping()

    # Save full mapping
    print(f"\n4. Saving full mapping to {full_path}...")
    with open(full_path, 'w') as f:
        json.dump(full_mapping, f, indent=2)

    # Get file size
    full_size_mb = os.path.getsize(full_path) / (1024 * 1024)

    # Save compact mapping
    print(f"\n5. Saving compact mapping to {compact_path}...")
    with open(compact_path, 'w') as f:
        json.dump(compact_mapping, f, indent=2)

    # Get file size
    compact_size_mb = os.path.getsize(compact_path) / (1024 * 1024)

    # Print summary
    print("\n" + "=" * 70)
    print("Generation Complete!")
    print("=" * 70)

    metadata = full_mapping['metadata']
    print(f"\nDataset Statistics:")
    print(f"  - Total ZIP codes: {metadata['totalZipcodes']:,}")
    print(f"  - Total batches: {metadata['totalBatches']:,}")
    print(f"  - Avg batches per ZIP: {metadata['totalBatches'] / metadata['totalZipcodes']:.1f}")

    print(f"\nFiles created:")
    print(f"  - {full_path}")
    print(f"    Size: {full_size_mb:.2f} MB")
    print(f"  - {compact_path}")
    print(f"    Size: {compact_size_mb:.2f} MB")
    print(f"    Space saved: {((1 - compact_size_mb/full_size_mb) * 100):.1f}%")

    # Sample data for verification
    print(f"\nSample data (first ZIP code):")
    sample_zip = list(full_mapping['zipcodes'].keys())[0]
    sample_batches = full_mapping['zipcodes'][sample_zip][:3]  # First 3 batches
    print(f"  ZIP Code: {sample_zip}")
    print(f"  Total batches: {len(full_mapping['zipcodes'][sample_zip])}")
    print(f"  First 3 batches:")
    for batch in sample_batches:
        print(f"    - {batch['batch']}: {batch['doses']:.0f} doses, {batch.get('adverseReports', 'N/A')} adverse reports")

    print("\n" + "=" * 70)

if __name__ == '__main__':
    main()
