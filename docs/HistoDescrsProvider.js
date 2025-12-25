class HistoDescrsProvider {

    static #cache = new Map();

    static getHistoDescrs(batchcode) {
        // Check cache first
        if (this.#cache.has(batchcode)) {
            return Promise.resolve(this.#cache.get(batchcode));
        }

        // Fetch and cache
        return fetch(`data/histograms/Global/${batchcode}.json`)
            .then(response => response.json())
            .then(data => {
                this.#cache.set(batchcode, data);
                return data;
            });
    }

    static clearCache() {
        this.#cache.clear();
    }

    static getCacheSize() {
        return this.#cache.size;
    }
}