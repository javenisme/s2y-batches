#!/usr/bin/env python3
"""
Generate symptom index from histogram files
"""

import json
import os
from collections import defaultdict


def generate_symptom_index():
    symptom_data = defaultdict(lambda: {"total": 0, "batches": {}})
    batch_count = 0

    files = [f for f in os.listdir(".") if f.endswith(".json")][:1000]

    for filename in files:
        batch_code = filename.replace(".json", "")
        batch_count += 1

        try:
            with open(filename, "r") as f:
                data = json.load(f)

            histogram = data.get("histogram", {})
            company = data.get("Company", "")
            deaths = data.get("Deaths", 0)
            reports = data.get("Adverse Reaction Reports", 0)

            for symptom, count in histogram.items():
                symptom_data[symptom]["total"] += count
                symptom_data[symptom]["batches"][batch_code] = {
                    "count": int(count),
                    "company": company,
                    "deaths": int(deaths),
                    "reports": int(reports),
                }
        except Exception as e:
            print(f"Error processing {filename}: {e}")

    result = dict(symptom_data)

    with open("symptom_index.json", "w") as f:
        json.dump(result, f)

    print(
        f"Generated symptom index with {len(result)} symptoms from {batch_count} batches"
    )


if __name__ == "__main__":
    generate_symptom_index()
