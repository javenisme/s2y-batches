import json

COUNTRY = "United Kingdom"
COUNTRY_FILE = "docs/data/barChartDescriptionTable.json"
RISK_FILE = "docs/data/batchCodeTables/Global.json"

def analyze():
    print(f"Finding batches for: {COUNTRY}...")
    
    # 1. Get Batches for Country
    uk_batches = set()
    with open(COUNTRY_FILE, 'r') as f:
        country_data = json.load(f)
        # Structure: {"barChartDescriptions": { "BatchCode": { "countries": [...] } } }
        
        descriptions = country_data.get('barChartDescriptions', {})
        for batch, info in descriptions.items():
            countries = info.get('countries', [])
            if COUNTRY in countries:
                uk_batches.add(batch)

    print(f"Found {len(uk_batches)} batches distributed in {COUNTRY}.")
    
    # 2. Get Risk Data
    print("Loading risk data...")
    results = []
    
    with open(RISK_FILE, 'r') as f:
        risk_data = json.load(f)
        # Columns: ["Batch","Adverse Reaction Reports","Deaths","Disabilities","Life-Threatening Illnesses","Hospitalizations","Company","Severe reports","Lethality"]
        # Indexes: 0=Batch, 1=ReportCnt, 2=Deaths, 3=Disabilities, 4=LifeThreat, 5=Hospital, 6=Company, 7=Severe(%), 8=Lethality(%)
        
        for row in risk_data['data']:
            batch = row[0]
            if batch in uk_batches:
                results.append({
                    "batch": batch,
                    "company": row[6],
                    "reports": row[1],
                    "deaths": row[2],
                    "disabilities": row[3],
                    "severe_rate": row[7] if row[7] is not None else 0.0,
                    "lethality": row[8] if row[8] is not None else 0.0
                })

    # 3. Sort by Deaths (Worst outcomes)
    results.sort(key=lambda x: x['deaths'], reverse=True)
    
    print("\nTOP 10 DEADLIEST BATCHES IN UK:")
    print(f"{'Batch':<12} | {'Company':<15} | {'Reports':<8} | {'Deaths':<6} | {'Severe %':<8} | {'Lethality %'}")
    print("-" * 80)
    for r in results[:10]:
        print(f"{r['batch']:<12} | {r['company']:<15} | {str(r['reports']):<8} | {str(r['deaths']):<6} | {f'{r['severe_rate']:.2f}%':<8} | {f'{r['lethality']:.2f}%'}")

    # 4. Sort by Severe Rate (Worst side effects probability)
    # Filter for batches with significant sample size (> 100 reports) to avoid outliers
    significant_batches = [r for r in results if r['reports'] > 100]
    significant_batches.sort(key=lambda x: x['severe_rate'], reverse=True)

    print("\nTOP 10 MOST TOXIC BATCHES IN UK (High Severe Rate, >100 reports):")
    print(f"{'Batch':<12} | {'Company':<15} | {'Reports':<8} | {'Deaths':<6} | {'Severe %':<8} | {'Disabilities'}")
    print("-" * 80)
    for r in significant_batches[:10]:
        print(f"{r['batch']:<12} | {r['company']:<15} | {str(r['reports']):<8} | {str(r['deaths']):<6} | {f'{r['severe_rate']:.2f}%':<8} | {r['disabilities']}")

analyze()
