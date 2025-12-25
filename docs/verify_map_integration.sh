#!/bin/bash

# Leaflet Map Integration Verification Script

echo "=========================================="
echo "Leaflet Map Integration Verification"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1 NOT FOUND"
        ((FAILED++))
    fi
}

# Function to check string in file
check_string() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 contains '$2'"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1 missing '$2'"
        ((FAILED++))
    fi
}

echo "1. Checking Required Files..."
echo "------------------------------"
check_file "ZipcodeRiskMap.html"
check_file "ZipcodeRiskMapView.js"
check_file "LeafletMapInitializer.js"
check_file "data/zipcodeRiskMap/ZipcodeRiskSummary.json"
check_file "data/zipcodeRiskMap/ZipcodeRiskStats.json"
echo ""

echo "2. Checking HTML Integration..."
echo "--------------------------------"
check_string "ZipcodeRiskMap.html" "leaflet@1.9.4"
check_string "ZipcodeRiskMap.html" "leaflet.heat"
check_string "ZipcodeRiskMap.html" "leaflet.markercluster"
check_string "ZipcodeRiskMap.html" "LeafletMapInitializer.js"
check_string "ZipcodeRiskMap.html" '<div id="map"'
check_string "ZipcodeRiskMap.html" "map-container"
echo ""

echo "3. Checking JavaScript Integration..."
echo "--------------------------------------"
check_string "ZipcodeRiskMapView.js" "mapInstance"
check_string "ZipcodeRiskMapView.js" "initializeMap"
check_string "ZipcodeRiskMapView.js" "LeafletMapInitializer"
check_string "ZipcodeRiskMapView.js" "focusOnZipcode"
check_string "ZipcodeRiskMapView.js" "filterByRiskLevel"
check_string "ZipcodeRiskMapView.js" "showBatchDetailsFromMap"
echo ""

echo "4. Checking LeafletMapInitializer..."
echo "-------------------------------------"
check_string "LeafletMapInitializer.js" "class LeafletMapInitializer"
check_string "LeafletMapInitializer.js" "addHeatLayer"
check_string "LeafletMapInitializer.js" "addMarkerLayer"
check_string "LeafletMapInitializer.js" "addLegend"
check_string "LeafletMapInitializer.js" "addControls"
check_string "LeafletMapInitializer.js" "L.map"
check_string "LeafletMapInitializer.js" "L.heatLayer"
check_string "LeafletMapInitializer.js" "L.markerClusterGroup"
echo ""

echo "5. Checking Data Files..."
echo "-------------------------"
if [ -f "data/zipcodeRiskMap/ZipcodeRiskSummary.json" ]; then
    # Check if JSON is valid and has data
    if command -v python3 &> /dev/null; then
        DATA_COUNT=$(python3 -c "import json; f=open('data/zipcodeRiskMap/ZipcodeRiskSummary.json'); d=json.load(f); print(len(d['data']))" 2>/dev/null)
        if [ ! -z "$DATA_COUNT" ]; then
            echo -e "${GREEN}✓${NC} ZipcodeRiskSummary.json contains $DATA_COUNT zipcodes"
            ((PASSED++))
            
            # Check for coordinate columns
            HAS_COORDS=$(python3 -c "import json; f=open('data/zipcodeRiskMap/ZipcodeRiskSummary.json'); d=json.load(f); print('lat' in d['columns'] and 'lng' in d['columns'])" 2>/dev/null)
            if [ "$HAS_COORDS" = "True" ]; then
                echo -e "${GREEN}✓${NC} Coordinate columns (lat/lng) present"
                ((PASSED++))
            else
                echo -e "${RED}✗${NC} Coordinate columns missing"
                ((FAILED++))
            fi
        else
            echo -e "${YELLOW}?${NC} Could not verify data count (Python error)"
        fi
    else
        echo -e "${YELLOW}?${NC} Python3 not available for JSON validation"
    fi
fi
echo ""

echo "6. Checking CSS Styles..."
echo "-------------------------"
check_string "ZipcodeRiskMap.html" "map-container"
check_string "ZipcodeRiskMap.html" "map-legend"
check_string "ZipcodeRiskMap.html" "map-controls"
check_string "ZipcodeRiskMap.html" "marker-cluster"
echo ""

echo "7. Documentation Check..."
echo "-------------------------"
check_file "LEAFLET_INTEGRATION_REPORT.md"
check_file "MAP_USER_GUIDE.md"
check_file "MAP_TESTING_CHECKLIST.md"
echo ""

echo "=========================================="
echo "Verification Complete"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All checks passed! Integration looks good.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open ZipcodeRiskMap.html in browser"
    echo "2. Check browser console for errors"
    echo "3. Test map interactions manually"
    echo "4. Run performance tests"
    exit 0
else
    echo -e "${RED}Some checks failed. Please review above.${NC}"
    exit 1
fi
