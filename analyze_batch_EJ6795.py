import json

BATCH = "EJ6795"
COUNTRY_FILE = "docs/data/barChartDescriptionTable.json"
RISK_FILE = "docs/data/batchCodeTables/Global.json"
DETAIL_FILE = f"docs/data/histograms/Global/{BATCH}.json"

def analyze():
    print(f"Analyzing Batch: {BATCH}...\n")
    
    # 1. Check Countries
    countries = []
    try:
        with open(COUNTRY_FILE, 'r') as f:
            data = json.load(f)
            desc = data.get('barChartDescriptions', {}).get(BATCH, {})
            countries = desc.get('countries', [])
            print(f"Distributed in Countries: {', '.join(countries)}")
            if "Australia" in countries:
                print(">>> CONFIRMED: Distributed in Australia.")
            else:
                print(">>> WARNING: NOT found in Australia distribution list.")
    except Exception as e:
        print(f"Error reading country file: {e}")

    # 2. Check Global Risk Stats
    print("\nGlobal Risk Stats:")
    try:
        with open(RISK_FILE, 'r') as f:
            data = json.load(f)
            # Find row
            found = False
            for row in data['data']:
                if row[0] == BATCH:
                    # ["Batch","Adverse Reaction Reports","Deaths","Disabilities","Life-Threatening Illnesses","Hospitalizations","Company","Severe reports","Lethality"]
                    print(f"Total Reports: {row[1]}")
                    print(f"Deaths: {row[2]} (Lethality: {row[8]:.2f}%)")
                    print(f"Disabilities: {row[3]}")
                    print(f"Life Threatening: {row[4]}")
                    print(f"Severe Rate: {row[7]:.2f}%")
                    found = True
                    break
            if not found:
                print("Batch not found in Global summary.")
    except Exception as e:
        print(f"Error reading risk file: {e}")

    # 3. Check Specific Symptoms (Top 10)
    print("\nTop 10 Side Effects:")
    try:
        with open(DETAIL_FILE, 'r') as f:
            data = json.load(f)
            hist = data.get('histogram', {})
            # Sort by count
            sorted_symptoms = sorted(hist.items(), key=lambda x: x[1], reverse=True)
            for sym, count in sorted_symptoms[:15]:
                print(f"- {sym}: {count}")
    except Exception as e:
        print(f"Error reading detail file: {e}")

analyze()
