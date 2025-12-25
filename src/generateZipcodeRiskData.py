#!/usr/bin/env python3
"""
Generate zipcode-level risk data for visualization.

This script creates aggregated JSON files for the Zipcode Risk Map:
- ZipcodeRiskSummary.json: Detailed zipcode-level data
- ZipcodeRiskStats.json: Statistical summary
"""

import os
import json
from ZipcodeRiskMapFactory import ZipcodeRiskMapFactory

def main():
    print("=" * 70)
    print("Generating Zipcode Risk Map Data")
    print("=" * 70)

    # Input path
    input_path = '../docs/data/vaccineDistributionByZipcode/VaccineDistributionByZipcode.json'

    # Output paths
    output_dir = '../docs/data/zipcodeRiskMap'
    summary_path = os.path.join(output_dir, 'ZipcodeRiskSummary.json')
    stats_path = os.path.join(output_dir, 'ZipcodeRiskStats.json')

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # Create factory and generate data
    print(f"\n1. Loading data from {input_path}...")
    factory = ZipcodeRiskMapFactory(input_path)

    print(f"\n2. Creating zipcode risk summary...")
    summary_df = factory.createZipcodeRiskSummary()

    print(f"\n3. Creating risk distribution statistics...")
    stats = factory.createRiskDistributionStats(summary_df)

    # Save summary as JSON
    print(f"\n4. Saving zipcode risk summary to {summary_path}...")
    # Convert DataFrame to split-oriented JSON (compatible with DataTables)
    summary_df.to_json(summary_path, orient='split', index=False, indent=2)

    # Save stats as JSON
    print(f"\n5. Saving risk statistics to {stats_path}...")
    with open(stats_path, 'w') as f:
        json.dump(stats, f, indent=2)

    # Print summary
    print("\n" + "=" * 70)
    print("Generation Complete!")
    print("=" * 70)

    print(f"\nFiles created:")
    print(f"  - {summary_path}")
    print(f"    ({len(summary_df):,} zipcodes)")
    print(f"  - {stats_path}")

    print(f"\nRisk Distribution:")
    for risk_level, data in stats['risk_distribution'].items():
        print(f"  - {risk_level:7s}: {data['count']:>6,} zipcodes ({data['percentage']:>5.1f}%)")

    print(f"\nAdverse Events per 100K Doses:")
    stats_data = stats['adverse_events_per_100k_stats']
    print(f"  - Mean:   {stats_data['mean']:>6.1f}")
    print(f"  - Median: {stats_data['median']:>6.1f}")
    print(f"  - Range:  {stats_data['min']:>6.1f} - {stats_data['max']:>6.1f}")

    print("\n" + "=" * 70)

if __name__ == '__main__':
    main()
