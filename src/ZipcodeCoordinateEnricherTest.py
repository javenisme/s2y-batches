import unittest
import pandas as pd
import os
import tempfile
from ZipcodeCoordinateEnricher import ZipcodeCoordinateEnricher


class ZipcodeCoordinateEnricherTest(unittest.TestCase):
    """Unit tests for ZipcodeCoordinateEnricher class."""

    def setUp(self):
        """Set up test fixtures."""
        # Create sample coordinate reference data
        self.coordinates_data = pd.DataFrame({
            'zipcode': ['10001', '90210', '60601', '02108', '33139'],
            'lat': [40.7506, 34.1030, 41.8781, 42.3584, 25.7907],
            'lng': [-73.9971, -118.4107, -87.6298, -71.0598, -80.1300],
            'city': ['New York', 'Beverly Hills', 'Chicago', 'Boston', 'Miami Beach'],
            'state': ['NY', 'CA', 'IL', 'MA', 'FL']
        })

        # Create temporary CSV file
        self.temp_csv = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv')
        self.coordinates_data.to_csv(self.temp_csv.name, index=False)
        self.temp_csv.close()

    def tearDown(self):
        """Clean up temporary files."""
        if os.path.exists(self.temp_csv.name):
            os.unlink(self.temp_csv.name)

    def test_basic_enrichment(self):
        """Test basic coordinate enrichment with 5-digit zipcodes."""
        # Input data with 5-digit zipcodes
        test_df = pd.DataFrame({
            'zipcode': ['10001', '90210', '99999'],  # Last one doesn't exist
            'value': [100, 200, 300]
        })

        enricher = ZipcodeCoordinateEnricher(
            test_df,
            zipcode_column='zipcode',
            coordinates_csv_path=self.temp_csv.name
        )

        result = enricher.enrich_with_coordinates()

        # Check that lat/lng columns were added
        self.assertIn('lat', result.columns)
        self.assertIn('lng', result.columns)
        self.assertIn('city', result.columns)
        self.assertIn('state', result.columns)
        self.assertIn('coordinate_match', result.columns)

        # Check specific matches
        self.assertEqual(result.loc[0, 'lat'], 40.7506)
        self.assertEqual(result.loc[0, 'lng'], -73.9971)
        self.assertEqual(result.loc[0, 'city'], 'New York')
        self.assertTrue(result.loc[0, 'coordinate_match'])

        # Check unmatched zipcode
        self.assertTrue(pd.isna(result.loc[2, 'lat']))
        self.assertFalse(result.loc[2, 'coordinate_match'])

    def test_zip_plus_4_format(self):
        """Test enrichment with ZIP+4 format (xxxxx-xxxx)."""
        test_df = pd.DataFrame({
            'zipcode': ['10001-1234', '90210-5678', '60601'],
            'value': [100, 200, 300]
        })

        enricher = ZipcodeCoordinateEnricher(
            test_df,
            zipcode_column='zipcode',
            coordinates_csv_path=self.temp_csv.name
        )

        result = enricher.enrich_with_coordinates()

        # Check that ZIP+4 was correctly parsed
        self.assertEqual(result.loc[0, 'zipcode_base'], '10001')
        self.assertEqual(result.loc[1, 'zipcode_base'], '90210')

        # Check that coordinates matched
        self.assertEqual(result.loc[0, 'lat'], 40.7506)
        self.assertEqual(result.loc[1, 'lat'], 34.1030)
        self.assertTrue(result.loc[0, 'coordinate_match'])
        self.assertTrue(result.loc[1, 'coordinate_match'])

    def test_leading_zeros(self):
        """Test that leading zeros are preserved."""
        test_df = pd.DataFrame({
            'zipcode': ['2108', '02108-1234'],  # Boston zipcode with/without leading zero
            'value': [100, 200]
        })

        enricher = ZipcodeCoordinateEnricher(
            test_df,
            zipcode_column='zipcode',
            coordinates_csv_path=self.temp_csv.name
        )

        result = enricher.enrich_with_coordinates()

        # Both should match to 02108
        self.assertEqual(result.loc[0, 'zipcode_base'], '02108')
        self.assertEqual(result.loc[1, 'zipcode_base'], '02108')
        self.assertTrue(result.loc[0, 'coordinate_match'])
        self.assertTrue(result.loc[1, 'coordinate_match'])
        self.assertEqual(result.loc[0, 'lat'], 42.3584)
        self.assertEqual(result.loc[1, 'lat'], 42.3584)

    def test_match_statistics(self):
        """Test match statistics calculation."""
        test_df = pd.DataFrame({
            'zipcode': ['10001', '90210', '99999', '99998', '10001-1234'],
            'value': [100, 200, 300, 400, 500]
        })

        enricher = ZipcodeCoordinateEnricher(
            test_df,
            zipcode_column='zipcode',
            coordinates_csv_path=self.temp_csv.name
        )

        result = enricher.enrich_with_coordinates()
        stats = enricher.get_match_statistics(result)

        # 3 matched (10001, 90210, 10001-1234), 2 unmatched (99999, 99998)
        self.assertEqual(stats['total_records'], 5)
        self.assertEqual(stats['matched_records'], 3)
        self.assertEqual(stats['unmatched_records'], 2)
        self.assertEqual(stats['match_rate_records'], 60.0)

        # Unique zipcodes: 10001, 90210, 99999, 99998
        self.assertEqual(stats['total_unique_zipcodes'], 4)
        self.assertEqual(stats['matched_unique_zipcodes'], 2)
        self.assertEqual(stats['unmatched_unique_zipcodes'], 2)
        self.assertEqual(stats['match_rate_unique'], 50.0)

    def test_get_unmatched_zipcodes(self):
        """Test getting list of unmatched zipcodes."""
        test_df = pd.DataFrame({
            'zipcode': ['10001', '99999', '99998', '10001-1234'],
            'value': [100, 200, 300, 400]
        })

        enricher = ZipcodeCoordinateEnricher(
            test_df,
            zipcode_column='zipcode',
            coordinates_csv_path=self.temp_csv.name
        )

        result = enricher.enrich_with_coordinates()
        unmatched = enricher.get_unmatched_zipcodes(result)

        self.assertEqual(unmatched, ['99998', '99999'])

    def test_validate_coordinates(self):
        """Test coordinate validation for US bounds."""
        # Create test data with some invalid coordinates
        invalid_coords_data = pd.DataFrame({
            'zipcode': ['10001', '90210', '99999', '99998'],
            'lat': [40.7506, 34.1030, 200.0, -50.0],  # Last two are invalid
            'lng': [-73.9971, -118.4107, -73.0, -73.0],
            'city': ['New York', 'Beverly Hills', 'Invalid1', 'Invalid2'],
            'state': ['NY', 'CA', 'XX', 'YY']
        })

        temp_csv2 = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv')
        invalid_coords_data.to_csv(temp_csv2.name, index=False)
        temp_csv2.close()

        try:
            test_df = pd.DataFrame({
                'zipcode': ['10001', '90210', '99999', '99998'],
                'value': [100, 200, 300, 400]
            })

            enricher = ZipcodeCoordinateEnricher(
                test_df,
                zipcode_column='zipcode',
                coordinates_csv_path=temp_csv2.name
            )

            result = enricher.enrich_with_coordinates()
            validation = enricher.validate_coordinates(result)

            # 4 matched, 2 valid, 2 invalid
            self.assertEqual(validation['total_validated'], 4)
            self.assertEqual(validation['valid_count'], 2)
            self.assertEqual(validation['invalid_count'], 2)
            self.assertEqual(len(validation['invalid_coordinates']), 2)

        finally:
            if os.path.exists(temp_csv2.name):
                os.unlink(temp_csv2.name)

    def test_empty_dataframe(self):
        """Test handling of empty DataFrame."""
        test_df = pd.DataFrame({
            'zipcode': [],
            'value': []
        })

        enricher = ZipcodeCoordinateEnricher(
            test_df,
            zipcode_column='zipcode',
            coordinates_csv_path=self.temp_csv.name
        )

        result = enricher.enrich_with_coordinates()

        self.assertEqual(len(result), 0)
        self.assertIn('lat', result.columns)
        self.assertIn('lng', result.columns)

    def test_all_unmatched(self):
        """Test when no zipcodes match."""
        test_df = pd.DataFrame({
            'zipcode': ['99999', '99998', '99997'],
            'value': [100, 200, 300]
        })

        enricher = ZipcodeCoordinateEnricher(
            test_df,
            zipcode_column='zipcode',
            coordinates_csv_path=self.temp_csv.name
        )

        result = enricher.enrich_with_coordinates()
        stats = enricher.get_match_statistics(result)

        self.assertEqual(stats['matched_records'], 0)
        self.assertEqual(stats['match_rate_records'], 0.0)
        self.assertTrue(result['lat'].isna().all())


if __name__ == '__main__':
    unittest.main()
