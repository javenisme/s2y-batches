import pandas as pd
from GoogleAnalytics.CityCountsByClickedBatchcodeProvider import CityCountsByClickedBatchcodeProvider

class RegionCountsByClickedBatchcodeProvider:

    @staticmethod
    def getRegionCountsByClickedBatchcode(file):
        cityCountsByClickedBatchcode = CityCountsByClickedBatchcodeProvider.getCityCountsByClickedBatchcode(file)
        return RegionCountsByClickedBatchcodeProvider._getRegionCountsByClickedBatchcodeFromTable(cityCountsByClickedBatchcode)

    @staticmethod
    def _getRegionCountsByClickedBatchcodeFromTable(cityCountsByClickedBatchcodeTable):
        return (cityCountsByClickedBatchcodeTable
                .groupby(['VAX_LOT', 'COUNTRY', 'REGION'])
                .agg(REGION_COUNT_BY_VAX_LOT =
                      pd.NamedAgg(
                          column = 'CITY_COUNT_BY_VAX_LOT',
                          aggfunc = sum)))
