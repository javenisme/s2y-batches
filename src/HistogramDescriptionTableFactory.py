import pandas as pd

class HistogramDescriptionTableFactory:

    @staticmethod
    def createHistogramDescriptionTable(dictByBatchcodeTable):
        histogramDescriptionTable = HistogramDescriptionTableFactory._createHistogramDescriptionTable(dictByBatchcodeTable)
        histogramDescriptionTable = histogramDescriptionTable.rename(columns = { "SYMPTOM_COUNT_BY_VAX_LOT": "HISTOGRAM_DESCRIPTION" })
        histogramDescriptionTable.index.rename('VAX_LOT', inplace = True)
        return histogramDescriptionTable
    
    @staticmethod
    def _createHistogramDescriptionTable(dictByBatchcodeTable):
        if 'COUNTRY' in dictByBatchcodeTable.columns:
            return HistogramDescriptionTableFactory._createHistogramDescriptionTableForCountries(dictByBatchcodeTable)
        else:
            return HistogramDescriptionTableFactory._createGlobalHistogramDescriptionTable(dictByBatchcodeTable)

    @staticmethod
    def _createHistogramDescriptionTableForCountries(dictByBatchcodeTable):
            result = (dictByBatchcodeTable
                        .groupby(['VAX_LOT_EXPLODED', 'COUNTRY'])
                        .agg(HistogramDescriptionTableFactory._getHistograms)
                        .reset_index(level = 'COUNTRY'))
            # Drop 'nan' if it exists in the index
            return result.drop('nan') if 'nan' in result.index else result

    @staticmethod
    def _createGlobalHistogramDescriptionTable(dictByBatchcodeTable):
            result = (dictByBatchcodeTable
                        .groupby('VAX_LOT_EXPLODED')
                        .agg(HistogramDescriptionTableFactory._getHistograms))
            # Drop 'nan' if it exists in the index
            return result.drop('nan') if 'nan' in result.index else result


    @staticmethod
    def _getHistograms(dictByBatchcodeTable):
        dictByBatchcodeTable = dictByBatchcodeTable.to_frame()
        dictByBatchcodeTable = dictByBatchcodeTable.rename(columns = { "SYMPTOM_COUNT_BY_VAX_LOT": "histogram" })
        HistogramDescriptionTableFactory._addBatchcodesColumn(dictByBatchcodeTable)
        histograms = dictByBatchcodeTable.to_dict('records')
        return {
                "batchcode": dictByBatchcodeTable.index.get_level_values('VAX_LOT_EXPLODED')[0],
                "histograms": histograms
            }
    
    @staticmethod
    def _addBatchcodesColumn(dictByBatchcodeTable):
        batchcodeColumns = dictByBatchcodeTable.index.names.difference(['VAX_LOT_EXPLODED'])
        dictByBatchcodeTable['batchcodes'] = dictByBatchcodeTable.reset_index()[batchcodeColumns].values.tolist()
        dictByBatchcodeTable['batchcodes'] = dictByBatchcodeTable['batchcodes'].map(HistogramDescriptionTableFactory._getNaNBatchcodes)

    @staticmethod
    def _getNaNBatchcodes(batchcodes):
        # Filter out both string 'nan' and actual NaN values
        return [batchcode for batchcode in batchcodes
                if batchcode != 'nan' and pd.notna(batchcode)]
