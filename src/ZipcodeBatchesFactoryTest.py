import unittest
import pandas as pd
from ZipcodeBatchesFactory import ZipcodeBatchesFactory


class ZipcodeBatchesFactoryTest(unittest.TestCase):

    def setUp(self):
        # Create sample data matching the vaccine distribution format
        self.sample_data = pd.DataFrame({
            'Provider': ['Provider A', 'Provider A', 'Provider B', 'Provider C'],
            'ZIP Code': ['12345', '12345', '67890', '12345'],
            'Lot Number': ['ABC123', 'DEF456', 'GHI789', 'JKL012'],
            'Doses Shipped': [1000.0, 500.0, 750.0, 300.0],
            'Statistical Number of Adverse Reaction Reports': [5.2, 2.1, 3.5, 1.0],
            'Statistical Number of Adverse Reaction Reports (per 100,000)': [520, 420, 467, 333]
        })

    def test_createZipcodeBatchesMapping_basic_structure(self):
        factory = ZipcodeBatchesFactory(self.sample_data)
        result = factory.createZipcodeBatchesMapping()

        # Check top-level structure
        self.assertIn('zipcodes', result)
        self.assertIn('metadata', result)
        self.assertIsInstance(result['zipcodes'], dict)
        self.assertIsInstance(result['metadata'], dict)

    def test_createZipcodeBatchesMapping_zipcode_grouping(self):
        factory = ZipcodeBatchesFactory(self.sample_data)
        result = factory.createZipcodeBatchesMapping()

        # Check that zipcodes are correctly grouped
        self.assertIn('12345', result['zipcodes'])
        self.assertIn('67890', result['zipcodes'])

        # Zipcode 12345 should have 3 batches
        self.assertEqual(len(result['zipcodes']['12345']), 3)

        # Zipcode 67890 should have 1 batch
        self.assertEqual(len(result['zipcodes']['67890']), 1)

    def test_createZipcodeBatchesMapping_batch_data_structure(self):
        factory = ZipcodeBatchesFactory(self.sample_data)
        result = factory.createZipcodeBatchesMapping()

        batch = result['zipcodes']['12345'][0]

        # Check required fields
        self.assertIn('batch', batch)
        self.assertIn('provider', batch)
        self.assertIn('doses', batch)
        self.assertIn('adverseReports', batch)
        self.assertIn('adverseReportsPer100k', batch)

    def test_createZipcodeBatchesMapping_sorting_by_adverse_reports(self):
        factory = ZipcodeBatchesFactory(self.sample_data)
        result = factory.createZipcodeBatchesMapping()

        batches = result['zipcodes']['12345']

        # Should be sorted by adverse reports (highest first)
        self.assertEqual(batches[0]['batch'], 'ABC123')  # 5.2 adverse reports
        self.assertEqual(batches[1]['batch'], 'DEF456')  # 2.1 adverse reports
        self.assertEqual(batches[2]['batch'], 'JKL012')  # 1.0 adverse reports

    def test_createZipcodeBatchesMapping_metadata(self):
        factory = ZipcodeBatchesFactory(self.sample_data)
        result = factory.createZipcodeBatchesMapping()

        metadata = result['metadata']

        # Check metadata fields
        self.assertIn('totalZipcodes', metadata)
        self.assertIn('totalBatches', metadata)

        # Verify counts
        self.assertEqual(metadata['totalZipcodes'], 2)  # 12345 and 67890
        self.assertEqual(metadata['totalBatches'], 4)  # ABC123, DEF456, GHI789, JKL012

    def test_createCompactZipcodeBatchesMapping_structure(self):
        factory = ZipcodeBatchesFactory(self.sample_data)
        result = factory.createCompactZipcodeBatchesMapping()

        # Should be a simple dict mapping zipcodes to batch lists
        self.assertIsInstance(result, dict)
        self.assertIn('12345', result)
        self.assertIn('67890', result)

    def test_createCompactZipcodeBatchesMapping_batch_lists(self):
        factory = ZipcodeBatchesFactory(self.sample_data)
        result = factory.createCompactZipcodeBatchesMapping()

        # Check zipcode 12345 has correct batches (sorted)
        self.assertEqual(len(result['12345']), 3)
        self.assertIn('ABC123', result['12345'])
        self.assertIn('DEF456', result['12345'])
        self.assertIn('JKL012', result['12345'])

        # Check zipcode 67890 has correct batch
        self.assertEqual(len(result['67890']), 1)
        self.assertIn('GHI789', result['67890'])

    def test_createCompactZipcodeBatchesMapping_sorted_batches(self):
        factory = ZipcodeBatchesFactory(self.sample_data)
        result = factory.createCompactZipcodeBatchesMapping()

        # Batches should be sorted alphabetically
        batches = result['12345']
        self.assertEqual(batches, sorted(batches))

    def test_handles_missing_adverse_report_data(self):
        # Test with data missing adverse report columns
        minimal_data = pd.DataFrame({
            'Provider': ['Provider A', 'Provider B'],
            'ZIP Code': ['12345', '12345'],
            'Lot Number': ['ABC123', 'DEF456'],
            'Doses Shipped': [1000.0, 500.0]
        })

        factory = ZipcodeBatchesFactory(minimal_data)
        result = factory.createZipcodeBatchesMapping()

        batch = result['zipcodes']['12345'][0]

        # Should have basic fields but not adverse report fields
        self.assertIn('batch', batch)
        self.assertIn('provider', batch)
        self.assertIn('doses', batch)
        # Adverse report fields should not be present
        self.assertNotIn('adverseReports', batch)
        self.assertNotIn('adverseReportsPer100k', batch)

    def test_handles_normalized_column_names(self):
        # Test with already normalized column names
        normalized_data = pd.DataFrame({
            'PROVIDER_NAME': ['Provider A', 'Provider B'],
            'ZIPCODE_SHP': ['12345', '67890'],
            'LOT_NUMBER': ['ABC123', 'DEF456'],
            'DOSES_SHIPPED': [1000.0, 500.0]
        })

        factory = ZipcodeBatchesFactory(normalized_data)
        result = factory.createZipcodeBatchesMapping()

        # Should work correctly with normalized names
        self.assertIn('12345', result['zipcodes'])
        self.assertIn('67890', result['zipcodes'])


if __name__ == '__main__':
    unittest.main()
