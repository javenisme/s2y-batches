import unittest
import os
import json
import pandas as pd
from ZipcodeRiskMapFactory import ZipcodeRiskMapFactory

class ZipcodeRiskMapFactoryTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Set up test data path."""
        cls.data_path = '../docs/data/vaccineDistributionByZipcode/VaccineDistributionByZipcode.json'

        if not os.path.exists(cls.data_path):
            raise FileNotFoundError(f"Test data file not found: {cls.data_path}")

    def test_initialization(self):
        """Test that factory initializes correctly."""
        factory = ZipcodeRiskMapFactory(self.data_path)
        self.assertIsNotNone(factory.df)
        self.assertGreater(len(factory.df), 0)

    def test_createZipcodeRiskSummary(self):
        """Test zipcode risk summary creation."""
        factory = ZipcodeRiskMapFactory(self.data_path)
        summary = factory.createZipcodeRiskSummary()

        # Check DataFrame structure
        expected_columns = [
            'zipcode',
            'total_doses',
            'total_adverse_events',
            'num_batches',
            'num_providers',
            'adverse_events_per_100k',
            'risk_category',
            'top_batches'
        ]

        for col in expected_columns:
            self.assertIn(col, summary.columns, f"Missing column: {col}")

        # Check data types
        self.assertTrue(pd.api.types.is_numeric_dtype(summary['total_doses']))
        self.assertTrue(pd.api.types.is_numeric_dtype(summary['adverse_events_per_100k']))

        # Check risk categories are valid
        valid_categories = {'LOW', 'MEDIUM', 'HIGH'}
        self.assertTrue(set(summary['risk_category'].unique()).issubset(valid_categories))

        # Check top_batches is valid JSON
        for top_batches_str in summary['top_batches'].head(5):
            top_batches = json.loads(top_batches_str)
            self.assertIsInstance(top_batches, list)
            if len(top_batches) > 0:
                self.assertIn('batch', top_batches[0])
                self.assertIn('adverse_events', top_batches[0])

    def test_risk_categorization(self):
        """Test risk categorization logic."""
        factory = ZipcodeRiskMapFactory(self.data_path)

        self.assertEqual(factory._categorize_risk(10), 'LOW')
        self.assertEqual(factory._categorize_risk(19.9), 'LOW')
        self.assertEqual(factory._categorize_risk(20), 'MEDIUM')
        self.assertEqual(factory._categorize_risk(49.9), 'MEDIUM')
        self.assertEqual(factory._categorize_risk(50), 'HIGH')
        self.assertEqual(factory._categorize_risk(100), 'HIGH')

    def test_createRiskDistributionStats(self):
        """Test risk distribution statistics creation."""
        factory = ZipcodeRiskMapFactory(self.data_path)
        summary = factory.createZipcodeRiskSummary()
        stats = factory.createRiskDistributionStats(summary)

        # Check structure
        self.assertIn('total_zipcodes', stats)
        self.assertIn('risk_distribution', stats)
        self.assertIn('adverse_events_per_100k_stats', stats)
        self.assertIn('total_doses', stats)
        self.assertIn('total_adverse_events', stats)

        # Check risk distribution
        risk_dist = stats['risk_distribution']
        self.assertIn('LOW', risk_dist)
        self.assertIn('MEDIUM', risk_dist)
        self.assertIn('HIGH', risk_dist)

        # Check that percentages sum to ~100%
        total_pct = sum(cat['percentage'] for cat in risk_dist.values())
        self.assertAlmostEqual(total_pct, 100.0, delta=0.5)

        # Check stats are reasonable
        stats_data = stats['adverse_events_per_100k_stats']
        self.assertGreater(stats_data['mean'], 0)
        self.assertGreater(stats_data['median'], 0)
        self.assertGreaterEqual(stats_data['max'], stats_data['mean'])
        self.assertLessEqual(stats_data['min'], stats_data['mean'])

    def test_top_batches_format(self):
        """Test that top batches are formatted correctly."""
        factory = ZipcodeRiskMapFactory(self.data_path)

        # Test with a known zipcode (use first one from data)
        test_zipcode = factory.df['ZIP Code'].iloc[0]
        top_batches_json = factory._get_top_batches(test_zipcode)

        # Should be valid JSON
        top_batches = json.loads(top_batches_json)
        self.assertIsInstance(top_batches, list)

        # Should have at most 3 entries
        self.assertLessEqual(len(top_batches), 3)

        # Each entry should have required fields
        for batch_info in top_batches:
            self.assertIn('batch', batch_info)
            self.assertIn('adverse_events', batch_info)
            self.assertIsInstance(batch_info['adverse_events'], (int, float))

if __name__ == '__main__':
    unittest.main()
