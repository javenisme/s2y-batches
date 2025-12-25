import pandas as pd
import os


class ZipcodeCoordinateEnricher:
    """
    Enriches zipcode data with geographic coordinates (latitude/longitude).

    This class takes a DataFrame containing US ZIP codes and adds latitude/longitude
    coordinates by merging with a coordinate reference dataset. Handles ZIP+4 format
    by extracting the 5-digit base ZIP code.
    """

    def __init__(self, zipcode_df, zipcode_column='zipcode', coordinates_csv_path=None):
        """
        Initialize the enricher with zipcode data and coordinate reference.

        Args:
            zipcode_df: DataFrame containing zipcode data
            zipcode_column: Name of the column containing ZIP codes
            coordinates_csv_path: Path to CSV file with columns: zipcode, lat, lng
                                If None, uses default path in src/data/
        """
        self.zipcode_df = zipcode_df.copy()
        self.zipcode_column = zipcode_column

        # Default to the GeoNames data in src/data/
        if coordinates_csv_path is None:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            coordinates_csv_path = os.path.join(script_dir, 'data', 'us-zip-coordinates.csv')

        # Load coordinate reference data
        self.coordinates_df = pd.read_csv(coordinates_csv_path, dtype={'zipcode': str})

        # Ensure zipcode is string and 5 digits (pad with zeros if needed)
        self.coordinates_df['zipcode'] = self.coordinates_df['zipcode'].str.zfill(5)

    def enrich_with_coordinates(self):
        """
        Add latitude and longitude columns to the zipcode DataFrame.

        Handles ZIP+4 format (xxxxx-xxxx) by extracting the 5-digit base code.
        Missing coordinates are filled with None.

        Returns:
            DataFrame with added columns: lat, lng, city, state
            Also includes: zipcode_base (5-digit), coordinate_match (boolean)
        """
        # Extract 5-digit base zipcode from ZIP+4 format
        self.zipcode_df['zipcode_base'] = (
            self.zipcode_df[self.zipcode_column]
            .astype(str)
            .str.split('-')
            .str[0]
            .str.zfill(5)  # Pad with leading zeros
        )

        # Merge with coordinate data
        enriched_df = self.zipcode_df.merge(
            self.coordinates_df[['zipcode', 'lat', 'lng', 'city', 'state']],
            left_on='zipcode_base',
            right_on='zipcode',
            how='left',
            suffixes=('', '_coord')
        )

        # Add match indicator
        enriched_df['coordinate_match'] = enriched_df['lat'].notna()

        # Drop the duplicate zipcode column from merge
        if 'zipcode_coord' in enriched_df.columns:
            enriched_df = enriched_df.drop(columns=['zipcode_coord'])

        return enriched_df

    def get_match_statistics(self, enriched_df):
        """
        Calculate statistics about coordinate matching success.

        Args:
            enriched_df: DataFrame returned from enrich_with_coordinates()

        Returns:
            Dictionary with matching statistics
        """
        total_records = len(enriched_df)
        total_unique_zipcodes = enriched_df['zipcode_base'].nunique()
        matched_records = enriched_df['coordinate_match'].sum()
        matched_unique_zipcodes = enriched_df[enriched_df['coordinate_match']]['zipcode_base'].nunique()

        return {
            'total_records': total_records,
            'matched_records': int(matched_records),
            'unmatched_records': total_records - int(matched_records),
            'match_rate_records': round(matched_records / total_records * 100, 2),
            'total_unique_zipcodes': total_unique_zipcodes,
            'matched_unique_zipcodes': matched_unique_zipcodes,
            'unmatched_unique_zipcodes': total_unique_zipcodes - matched_unique_zipcodes,
            'match_rate_unique': round(matched_unique_zipcodes / total_unique_zipcodes * 100, 2)
        }

    def get_unmatched_zipcodes(self, enriched_df):
        """
        Get list of unique zipcodes that could not be matched.

        Args:
            enriched_df: DataFrame returned from enrich_with_coordinates()

        Returns:
            Sorted list of unmatched 5-digit ZIP codes
        """
        unmatched = enriched_df[~enriched_df['coordinate_match']]['zipcode_base'].unique()
        return sorted(unmatched.tolist())

    def validate_coordinates(self, enriched_df):
        """
        Validate that coordinates are within reasonable US bounds.

        US coordinate bounds (approximate):
        - Latitude: 24.5 (FL Keys) to 71.5 (Alaska)
        - Longitude: -179.0 (Alaska) to -66.9 (Maine)

        Args:
            enriched_df: DataFrame returned from enrich_with_coordinates()

        Returns:
            Dictionary with validation results
        """
        matched_df = enriched_df[enriched_df['coordinate_match']].copy()

        if len(matched_df) == 0:
            return {
                'total_validated': 0,
                'valid_count': 0,
                'invalid_count': 0,
                'invalid_coordinates': []
            }

        # Define US bounds (including Alaska, Hawaii, and territories)
        lat_min, lat_max = 10.0, 72.0  # Extended for territories
        lng_min, lng_max = -180.0, -65.0

        # Check bounds
        matched_df['valid_coordinate'] = (
            (matched_df['lat'] >= lat_min) & (matched_df['lat'] <= lat_max) &
            (matched_df['lng'] >= lng_min) & (matched_df['lng'] <= lng_max)
        )

        invalid_coords = matched_df[~matched_df['valid_coordinate']][
            ['zipcode_base', 'lat', 'lng', 'city', 'state']
        ].drop_duplicates().to_dict('records')

        return {
            'total_validated': len(matched_df),
            'valid_count': int(matched_df['valid_coordinate'].sum()),
            'invalid_count': int((~matched_df['valid_coordinate']).sum()),
            'invalid_coordinates': invalid_coords
        }
