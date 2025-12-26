import pandas as pd
from GoogleAnalytics.GoogleAnalyticsReader import GoogleAnalyticsReader

class CityCountsByClickedBatchcodeProvider:
    """
    Shared provider for reading city-level batch code click data.
    Used by both RegionCountsByClickedBatchcodeProvider and CountryCountsByClickedBatchcodeProvider.
    """

    @staticmethod
    def getCityCountsByClickedBatchcode(file, includeDateRange=False):
        """
        Read city counts by clicked batch code from Google Analytics CSV file.

        Args:
            file: Path to the CSV file
            includeDateRange: Whether to include date range columns in the index

        Returns:
            DataFrame with city-level click counts indexed by COUNTRY, REGION, CITY
        """
        return GoogleAnalyticsReader.read_csv(
            file=file,
            columns={
                'Country': 'COUNTRY',
                'Region': 'REGION',
                'City': 'CITY',
                'Event count': 'CITY_COUNT_BY_VAX_LOT'
            },
            index_columns=['COUNTRY', 'REGION', 'CITY'],
            dateRangeIndexColumns={'startDate': 'START_DATE', 'endDate': 'END_DATE'} if includeDateRange else None)
