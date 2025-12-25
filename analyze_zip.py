import json

ZIP_CODE = "07922"
DIST_FILE = "docs/data/vaccineDistributionByZipcode/VaccineDistributionByZipcode.json"
RISK_FILE = "docs/data/batchCodeTables/Global.json"

def analyze():
    print(f"Loading distribution data for ZIP: {ZIP_CODE}...")
    
    # 1. Get Batches for ZIP
    batches_in_zip = [] # List of {batch, provider, doses}
    with open(DIST_FILE, 'r') as f:
        dist_data = json.load(f)
        # Columns: ["Provider","ZIP Code","Lot Number","Doses Shipped", ...]
        # Indexes: 0=Provider, 1=Zip, 2=Lot, 3=Doses
        
        for row in dist_data['data']:
            if str(row[1]).startswith(ZIP_CODE):
                batches_in_zip.append({
                    "provider": row[0],
                    "batch": row[2],
                    "doses": row[3]
                })

    print(f"Found {len(batches_in_zip)} distribution records.")
    
    # 2. Get Risk Data for these batches
    print("Loading risk data...")
    risk_map = {}
    with open(RISK_FILE, 'r') as f:
        risk_data = json.load(f)
        # Columns: ["Batch","Adverse Reaction Reports","Deaths","Disabilities","Life-Threatening Illnesses","Hospitalizations","Company","Severe reports","Lethality"]
        # Indexes: 0=Batch, 1=Adverse, 2=Deaths, 3=Disabilities, 4=LifeThreat, 5=Hospital, 6=Company, 7=Severe(%), 8=Lethality(%)
        
        for row in risk_data['data']:
            risk_map[row[0]] = {
                "adverse_reports": row[1],
                "deaths": row[2],
                "disabilities": row[3],
                "severe_rate": row[7],
                "company": row[6]
            }

    # 3. Combine and Print
    print("\nanalysis_results")
    print(f"{'Batch':<12} | {'Company':<15} | {'Doses':<8} | {'Deaths':<6} | {'Disabilities':<12} | {'Severe %':<8} | {'Provider'}")
    print("-" * 100)
    
    unique_batches = set()
    
    for item in batches_in_zip:
        batch = item['batch']
        unique_batches.add(batch)
        risk = risk_map.get(batch, {})
        
        company = risk.get('company', 'Unknown')
        deaths = risk.get('deaths', 0)
        disabilities = risk.get('disabilities', 0)
        severe = risk.get('severe_rate', 0)
        if severe is None: severe = 0
        
        print(f"{batch:<12} | {company:<15} | {str(item['doses']):<8} | {str(deaths):<6} | {str(disabilities):<12} | {f'{severe:.2f}%':<8} | {item['provider'][:30]}")

analyze()
