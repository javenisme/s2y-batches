import unittest
import json
import os
from LongCovidEconomyAnalyzer import analyze, OUTPUT_FILE

class TestLongCovidEconomyAnalyzer(unittest.TestCase):
    def test_analysis_output_exists(self):
        analyze()
        self.assertTrue(os.path.exists(OUTPUT_FILE))

    def test_json_structure(self):
        analyze()
        with open(OUTPUT_FILE, 'r') as f:
            data = json.load(f)

        self.assertIn("summary", data)
        self.assertIn("countries", data)
        self.assertTrue(len(data["countries"]) > 0)

        first_country = data["countries"][0]
        required_keys = ["country", "gdp", "workforce", "impact_score", "estimated_affected_workers_m"]
        for key in required_keys:
            self.assertIn(key, first_country)

if __name__ == "__main__":
    unittest.main()
