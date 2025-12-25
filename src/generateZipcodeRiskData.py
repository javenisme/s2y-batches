#!/usr/bin/env python3
"""
Generate zipcode-level risk data for visualization.

This script creates aggregated JSON files for the Zipcode Risk Map:
- ZipcodeRiskSummary.json: Detailed zipcode-level data with coordinates
- ZipcodeRiskStats.json: Statistical summary
"""

import os
import json
from ZipcodeRiskMapFactory import ZipcodeRiskMapFactory
from ZipcodeCoordinateEnricher import ZipcodeCoordinateEnricher

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

    print(f"\n3. Enriching with geographic coordinates...")
    enricher = ZipcodeCoordinateEnricher(summary_df, zipcode_column='zipcode')
    enriched_df = enricher.enrich_with_coordinates()

    # Get and display match statistics
    match_stats = enricher.get_match_statistics(enriched_df)
    print(f"   - Total zipcodes: {match_stats['total_unique_zipcodes']:,}")
    print(f"   - Matched: {match_stats['matched_unique_zipcodes']:,} ({match_stats['match_rate_unique']}%)")
    print(f"   - Unmatched: {match_stats['unmatched_unique_zipcodes']:,}")

    # Validate coordinates
    validation = enricher.validate_coordinates(enriched_df)
    if validation['invalid_count'] > 0:
        print(f"   - Warning: {validation['invalid_count']} records with invalid coordinates")

    # Get unmatched zipcodes
    unmatched = enricher.get_unmatched_zipcodes(enriched_df)
    if unmatched:
        print(f"\n   Unmatched zipcodes (first 20): {', '.join(unmatched[:20])}")
        if len(unmatched) > 20:
            print(f"   ... and {len(unmatched) - 20} more")

    print(f"\n4. Creating risk distribution statistics...")
    stats = factory.createRiskDistributionStats(enriched_df)

    # Add coordinate statistics to stats
    stats['coordinate_statistics'] = match_stats
    stats['coordinate_validation'] = {
        'total_validated': validation['total_validated'],
        'valid_count': validation['valid_count'],
        'invalid_count': validation['invalid_count']
    }

    # Save summary as JSON
    print(f"\n5. Saving zipcode risk summary to {summary_path}...")
    # Convert DataFrame to split-oriented JSON (compatible with DataTables)
    enriched_df.to_json(summary_path, orient='split', index=False, indent=2)

    # Save stats as JSON
    print(f"\n6. Saving risk statistics to {stats_path}...")
    with open(stats_path, 'w') as f:
        json.dump(stats, f, indent=2)

    # Print summary
    print("\n" + "=" * 70)
    print("Generation Complete!")
    print("=" * 70)

    print(f"\nFiles created:")
    print(f"  - {summary_path}")
    print(f"    ({len(enriched_df):,} records, {match_stats['total_unique_zipcodes']:,} unique zipcodes)")
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
