import pandas as pd
import json

class ZipcodeBatchesFactory:
    """
    Factory to create a zipcode-to-batches mapping from vaccine distribution data.
    Inverts the provider/zipcode/batch relationship to enable zipcode-based batch lookup.
    """

    def __init__(self, vaccineDistributionByZipcode):
        """
        Args:
            vaccineDistributionByZipcode: DataFrame with columns:
                - PROVIDER_NAME (or Provider)
                - ZIPCODE_SHP (or ZIP Code)
                - LOT_NUMBER (or Lot Number)
                - DOSES_SHIPPED (or Doses Shipped)
        """
        self.vaccineDistributionByZipcode = vaccineDistributionByZipcode

    def createZipcodeBatchesMapping(self):
        """
        Creates a dictionary mapping zipcodes to lists of batch information.

        Returns:
            dict: {
                "zipcodes": {
                    "12345": [
                        {
                            "batch": "ABC123",
                            "provider": "Provider Name",
                            "doses": 1000,
                            "adverseReports": 5.2,
                            "adverseReportsPer100k": 520
                        },
                        ...
                    ]
                },
                "metadata": {
                    "totalZipcodes": 1000,
                    "totalBatches": 5000
                }
            }
        """
        df = self.vaccineDistributionByZipcode.copy()

        # Normalize column names
        column_mapping = {
            'Provider': 'PROVIDER_NAME',
            'ZIP Code': 'ZIPCODE_SHP',
            'Lot Number': 'LOT_NUMBER',
            'Doses Shipped': 'DOSES_SHIPPED',
            'Statistical Number of Adverse Reaction Reports': 'ADVERSE_REPORTS',
            'Statistical Number of Adverse Reaction Reports (per 100,000)': 'ADVERSE_REPORTS_PER_100K'
        }
        df = df.rename(columns=column_mapping)

        # Group by zipcode and aggregate batch information
        result = {"zipcodes": {}, "metadata": {}}

        for zipcode in df['ZIPCODE_SHP'].unique():
            zipcode_data = df[df['ZIPCODE_SHP'] == zipcode]

            batches = []
            for _, row in zipcode_data.iterrows():
                batch_info = {
                    "batch": row['LOT_NUMBER'],
                    "provider": row['PROVIDER_NAME'],
                    "doses": float(row['DOSES_SHIPPED']) if pd.notna(row['DOSES_SHIPPED']) else 0
                }

                # Add adverse reaction data if available
                if 'ADVERSE_REPORTS' in row and pd.notna(row['ADVERSE_REPORTS']):
                    batch_info['adverseReports'] = float(row['ADVERSE_REPORTS'])

                if 'ADVERSE_REPORTS_PER_100K' in row and pd.notna(row['ADVERSE_REPORTS_PER_100K']):
                    batch_info['adverseReportsPer100k'] = float(row['ADVERSE_REPORTS_PER_100K'])

                batches.append(batch_info)

            # Sort batches by adverse reports (highest first) if available
            if batches and 'adverseReports' in batches[0]:
                batches.sort(key=lambda x: x.get('adverseReports', 0), reverse=True)

            result["zipcodes"][str(zipcode)] = batches

        # Add metadata
        result["metadata"] = {
            "totalZipcodes": len(result["zipcodes"]),
            "totalBatches": len(df['LOT_NUMBER'].unique())
        }

        return result

    def createCompactZipcodeBatchesMapping(self):
        """
        Creates a more compact version that only includes batch codes per zipcode.
        Useful for smaller file size when detailed info isn't needed.

        Returns:
            dict: {
                "12345": ["ABC123", "DEF456", ...],
                "67890": ["GHI789", ...],
                ...
            }
        """
        df = self.vaccineDistributionByZipcode.copy()

        # Normalize column names
        column_mapping = {
            'ZIP Code': 'ZIPCODE_SHP',
            'Lot Number': 'LOT_NUMBER'
        }
        df = df.rename(columns=column_mapping)

        # Group by zipcode and collect unique batch codes
        result = {}
        for zipcode in df['ZIPCODE_SHP'].unique():
            batches = df[df['ZIPCODE_SHP'] == zipcode]['LOT_NUMBER'].unique().tolist()
            result[str(zipcode)] = sorted(batches)

        return result
