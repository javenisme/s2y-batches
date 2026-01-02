/**
 * Provider for fetching vaccine batch information by zipcode.
 * Follows the same pattern as HistoDescrsProvider for consistency.
 */
class ZipcodeBatchesProvider {

    static #cache = new Map();
    static #fullDataCache = null;

    /**
     * Get batch information for a specific zipcode.
     *
     * @param {string} zipcode - The zipcode to look up
     * @returns {Promise<Array>} Promise resolving to array of batch information:
     *   [{
     *     batch: "ABC123",
     *     provider: "Provider Name",
     *     doses: 1000,
     *     adverseReports: 5.2,
     *     adverseReportsPer100k: 520
     *   }, ...]
     */
    static getBatchesByZipcode(zipcode) {
        // Normalize zipcode (remove spaces, hyphens)
        const normalizedZipcode = String(zipcode).trim().replace(/[-\s]/g, '');

        // Check cache first
        if (this.#cache.has(normalizedZipcode)) {
            return Promise.resolve(this.#cache.get(normalizedZipcode));
        }

        // Load full data if not already cached
        return this.#loadFullData()
            .then(data => {
                const batches = data.zipcodes[normalizedZipcode] || [];
                this.#cache.set(normalizedZipcode, batches);
                return batches;
            });
    }

    /**
     * Get compact batch list (just batch codes) for a zipcode.
     * Uses the smaller compact mapping file.
     *
     * @param {string} zipcode - The zipcode to look up
     * @returns {Promise<Array<string>>} Promise resolving to array of batch codes
     */
    static getCompactBatchesByZipcode(zipcode) {
        const normalizedZipcode = String(zipcode).trim().replace(/[-\s]/g, '');

        return fetch('data/zipcodeBatches/ZipcodeBatchesCompact.json')
            .then(response => response.json())
            .then(data => {
                return data[normalizedZipcode] || [];
            });
    }

    /**
     * Search for zipcodes that contain a specific batch code.
     *
     * @param {string} batchCode - The batch code to search for
     * @returns {Promise<Array<string>>} Promise resolving to array of zipcodes
     */
    static getZipcodesByBatch(batchCode) {
        const normalizedBatch = String(batchCode).trim().toUpperCase();

        return this.#loadFullData()
            .then(data => {
                const zipcodes = [];
                for (const [zipcode, batches] of Object.entries(data.zipcodes)) {
                    if (batches.some(b => b.batch.toUpperCase() === normalizedBatch)) {
                        zipcodes.push(zipcode);
                    }
                }
                return zipcodes.sort();
            });
    }

    /**
     * Get metadata about the zipcode-batch mapping.
     *
     * @returns {Promise<Object>} Promise resolving to metadata object:
     *   {
     *     totalZipcodes: 1000,
     *     totalBatches: 5000
     *   }
     */
    static getMetadata() {
        return this.#loadFullData()
            .then(data => data.metadata || {});
    }

    /**
     * Get all available zipcodes.
     *
     * @returns {Promise<Array<string>>} Promise resolving to sorted array of zipcodes
     */
    static getAllZipcodes() {
        return this.#loadFullData()
            .then(data => Object.keys(data.zipcodes).sort());
    }

    /**
     * Load the full zipcode-batches mapping data.
     * Caches the result for subsequent calls.
     *
     * @private
     * @returns {Promise<Object>} Promise resolving to full data object
     */
    static #loadFullData() {
        if (this.#fullDataCache !== null) {
            return Promise.resolve(this.#fullDataCache);
        }

        return fetch('data/zipcodeBatches/ZipcodeBatches.json')
            .then(response => response.json())
            .then(data => {
                this.#fullDataCache = data;
                return data;
            });
    }

    /**
     * Clear all caches. Useful for testing or forcing a data reload.
     */
    static clearCache() {
        this.#cache.clear();
        this.#fullDataCache = null;
    }

    /**
     * Get the current cache size for individual zipcode lookups.
     *
     * @returns {number} Number of cached zipcode results
     */
    static getCacheSize() {
        return this.#cache.size;
    }
}
