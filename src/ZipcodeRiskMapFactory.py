import pandas as pd
import json

class ZipcodeRiskMapFactory:
    """
    Creates zipcode-level risk aggregation data from vaccine distribution records.

    This factory processes vaccine distribution and adverse event data to generate
    a zipcode-level risk summary suitable for visualization.
    """

    def __init__(self, vaccine_distribution_json_path):
        """
        Initialize the factory with vaccine distribution data.

        Args:
            vaccine_distribution_json_path: Path to VaccineDistributionByZipcode.json
        """
        with open(vaccine_distribution_json_path, 'r') as f:
            data = json.load(f)

        self.df = pd.DataFrame(data['data'], columns=data['columns'])

    def createZipcodeRiskSummary(self):
        """
        Create zipcode-level risk summary with aggregated statistics.

        Returns:
            DataFrame with columns:
            - zipcode: ZIP code
            - total_doses: Total doses shipped to this zipcode
            - total_adverse_events: Total adverse reaction reports
            - adverse_events_per_100k: Adverse events per 100,000 doses
            - num_batches: Number of unique batch codes
            - num_providers: Number of unique providers
            - risk_category: LOW, MEDIUM, or HIGH
            - top_batches: List of top 3 batches by adverse events (JSON string)
        """
        # Aggregate by zipcode
        zipcode_agg = self.df.groupby('ZIP Code').agg({
            'Doses Shipped': 'sum',
            'Statistical Number of Adverse Reaction Reports': 'sum',
            'Lot Number': 'nunique',
            'Provider': 'nunique'
        }).reset_index()

        zipcode_agg.columns = [
            'zipcode',
            'total_doses',
            'total_adverse_events',
            'num_batches',
            'num_providers'
        ]

        # Calculate adverse events per 100K
        zipcode_agg['adverse_events_per_100k'] = (
            (zipcode_agg['total_adverse_events'] / zipcode_agg['total_doses']) * 100000
        ).round(1)

        # Categorize risk
        zipcode_agg['risk_category'] = zipcode_agg['adverse_events_per_100k'].apply(
            self._categorize_risk
        )

        # Get top batches for each zipcode
        zipcode_agg['top_batches'] = zipcode_agg['zipcode'].apply(
            self._get_top_batches
        )

        # Round numerical columns
        zipcode_agg['total_doses'] = zipcode_agg['total_doses'].round(0)
        zipcode_agg['total_adverse_events'] = zipcode_agg['total_adverse_events'].round(2)

        # Sort by risk descending
        zipcode_agg = zipcode_agg.sort_values('adverse_events_per_100k', ascending=False)

        return zipcode_agg

    def _categorize_risk(self, adverse_events_per_100k):
        """Categorize risk level based on adverse events per 100K doses."""
        if adverse_events_per_100k < 20:
            return 'LOW'
        elif adverse_events_per_100k < 50:
            return 'MEDIUM'
        else:
            return 'HIGH'

    def _get_top_batches(self, zipcode):
        """Get top 3 batches by adverse events for a given zipcode."""
        zipcode_data = self.df[self.df['ZIP Code'] == zipcode]

        top_batches = (
            zipcode_data
            .groupby('Lot Number')['Statistical Number of Adverse Reaction Reports']
            .sum()
            .sort_values(ascending=False)
            .head(3)
        )

        result = [
            {
                'batch': batch,
                'adverse_events': round(events, 2)
            }
            for batch, events in top_batches.items()
        ]

        return json.dumps(result)

    def createRiskDistributionStats(self, zipcode_summary_df):
        """
        Create summary statistics about risk distribution.

        Args:
            zipcode_summary_df: DataFrame from createZipcodeRiskSummary()

        Returns:
            Dictionary with statistical summaries
        """
        total_zipcodes = len(zipcode_summary_df)

        risk_counts = zipcode_summary_df['risk_category'].value_counts()

        stats = {
            'total_zipcodes': total_zipcodes,
            'risk_distribution': {
                'LOW': {
                    'count': int(risk_counts.get('LOW', 0)),
                    'percentage': round(risk_counts.get('LOW', 0) / total_zipcodes * 100, 1)
                },
                'MEDIUM': {
                    'count': int(risk_counts.get('MEDIUM', 0)),
                    'percentage': round(risk_counts.get('MEDIUM', 0) / total_zipcodes * 100, 1)
                },
                'HIGH': {
                    'count': int(risk_counts.get('HIGH', 0)),
                    'percentage': round(risk_counts.get('HIGH', 0) / total_zipcodes * 100, 1)
                }
            },
            'adverse_events_per_100k_stats': {
                'mean': round(zipcode_summary_df['adverse_events_per_100k'].mean(), 1),
                'median': round(zipcode_summary_df['adverse_events_per_100k'].median(), 1),
                'std': round(zipcode_summary_df['adverse_events_per_100k'].std(), 1),
                'min': round(zipcode_summary_df['adverse_events_per_100k'].min(), 1),
                'max': round(zipcode_summary_df['adverse_events_per_100k'].max(), 1)
            },
            'total_doses': float(zipcode_summary_df['total_doses'].sum()),
            'total_adverse_events': float(zipcode_summary_df['total_adverse_events'].sum())
        }

        return stats
