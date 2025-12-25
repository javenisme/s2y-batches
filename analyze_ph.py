import json

COUNTRY = "Philippines"
COUNTRY_FILE = "docs/data/barChartDescriptionTable.json"
RISK_FILE = "docs/data/batchCodeTables/Global.json"

def analyze():
    print(f"Finding batches for: {COUNTRY}...")
    
    # 1. Get Batches for Country
    ph_batches = set()
    try:
        with open(COUNTRY_FILE, 'r') as f:
            country_data = json.load(f)
            descriptions = country_data.get('barChartDescriptions', {})
            for batch, info in descriptions.items():
                countries = info.get('countries', [])
                if COUNTRY in countries:
                    ph_batches.add(batch)
    except Exception as e:
        print(f"Error reading country file: {e}")
        return

    print(f"Found {len(ph_batches)} batches distributed in {COUNTRY}.")
    
    # 2. Get Risk Data
    print("Loading risk data...")
    results = []
    
    try:
        with open(RISK_FILE, 'r') as f:
            risk_data = json.load(f)
            for row in risk_data['data']:
                batch = row[0]
                if batch in ph_batches:
                    results.append({
                        "batch": batch,
                        "company": row[6],
                        "reports": row[1],
                        "deaths": row[2],
                        "severe_rate": row[7] if row[7] is not None else 0.0,
                        "lethality": row[8] if row[8] is not None else 0.0
                    })
    except Exception as e:
        print(f"Error reading risk file: {e}")
        return

    # 3. Sort by Severe Rate
    results.sort(key=lambda x: x['severe_rate'], reverse=True)
    
    print(f"\nBATCHES IN {COUNTRY} (Sorted by Severe Rate):")
    print(f"{'Batch':<12} | {'Company':<15} | {'Reports':<8} | {'Deaths':<6} | {'Severe %':<8} | {'Lethality %'}")
    print("-" * 80)
    for r in results:
        print(f"{r['batch']:<12} | {r['company']:<15} | {str(r['reports']):<8} | {str(r['deaths']):<6} | {f'{r['severe_rate']:.2f}%':<8} | {f'{r['lethality']:.2f}%'}")

analyze()
