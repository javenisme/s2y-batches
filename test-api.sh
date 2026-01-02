#!/bin/bash

# S2Y Batches API 测试脚本
# 用于测试部署的 API Worker

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API URL (部署后可能需要修改)
API_URL="https://s2y-batches-api.javenisme.workers.dev"

echo "=========================================="
echo "  S2Y Batches API 测试"
echo "  API URL: $API_URL"
echo "=========================================="
echo ""

# 检查 jq 是否安装
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}警告: jq 未安装,输出将不会格式化${NC}"
    echo "安装 jq: brew install jq"
    JQ_CMD="cat"
else
    JQ_CMD="jq '.'"
fi

# 测试函数
test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local headers=$4
    local data=$5
    
    echo -e "${YELLOW}=== 测试: $name ===${NC}"
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            $headers \
            -d "$data" \
            "$url")
    else
        response=$(curl -s -w "\n%{http_code}" \
            $headers \
            "$url")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ 状态码: $http_code${NC}"
    else
        echo -e "${RED}✗ 状态码: $http_code${NC}"
    fi
    
    echo "$body" | eval $JQ_CMD
    echo ""
}

# 测试 1: 健康检查
test_endpoint \
    "健康检查" \
    "GET" \
    "$API_URL/health" \
    ""

# 测试 2: 根路径
test_endpoint \
    "根路径" \
    "GET" \
    "$API_URL/" \
    ""

# 测试 3: 获取批次详情 (有认证)
test_endpoint \
    "获取批次详情 (EN6201)" \
    "GET" \
    "$API_URL/api/v1/batch/EN6201" \
    "-H 'Authorization: Bearer test_key'"

# 测试 4: 获取批次详情 (无认证 - 应返回 401)
test_endpoint \
    "获取批次详情 (无认证)" \
    "GET" \
    "$API_URL/api/v1/batch/EN6201" \
    ""

# 测试 5: 搜索批次
test_endpoint \
    "搜索批次 (Pfizer)" \
    "GET" \
    "$API_URL/api/v1/batch/search?manufacturer=Pfizer&limit=3" \
    "-H 'Authorization: Bearer test_key'"

# 测试 6: 搜索批次 (风险分数过滤)
test_endpoint \
    "搜索批次 (风险分数 >= 6.0)" \
    "GET" \
    "$API_URL/api/v1/batch/search?risk_score_min=6.0" \
    "-H 'Authorization: Bearer test_key'"

# 测试 7: 获取热门症状
test_endpoint \
    "获取热门症状 (EN6201)" \
    "GET" \
    "$API_URL/api/v1/batch/EN6201/top-symptoms?limit=5" \
    "-H 'Authorization: Bearer test_key'"

# 测试 8: 风险评估
test_endpoint \
    "风险评估 (45岁男性)" \
    "POST" \
    "$API_URL/api/v1/risk/assess" \
    "-H 'Authorization: Bearer test_key' -H 'Content-Type: application/json'" \
    '{
      "batch_code": "EN6201",
      "user_profile": {
        "age": 45,
        "sex": "M",
        "pre_existing_conditions": ["hypertension"],
        "previous_covid_infection": false,
        "dose_number": 2
      }
    }'

# 测试 9: 风险评估 (老年人)
test_endpoint \
    "风险评估 (72岁女性)" \
    "POST" \
    "$API_URL/api/v1/risk/assess" \
    "-H 'Authorization: Bearer test_key' -H 'Content-Type: application/json'" \
    '{
      "batch_code": "EN6201",
      "user_profile": {
        "age": 72,
        "sex": "F",
        "pre_existing_conditions": ["copd", "hypertension"],
        "previous_covid_infection": true,
        "dose_number": 4
      }
    }'

# 测试 10: 获取批次风险统计
test_endpoint \
    "获取批次风险统计 (EN6201)" \
    "GET" \
    "$API_URL/api/v1/risk/batch/EN6201" \
    "-H 'Authorization: Bearer test_key'"

# 测试 11: 不存在的批次
test_endpoint \
    "获取不存在的批次 (应返回随机数据)" \
    "GET" \
    "$API_URL/api/v1/batch/INVALID123" \
    "-H 'Authorization: Bearer test_key'"

# 测试 12: 不存在的端点 (应返回 404)
test_endpoint \
    "访问不存在的端点" \
    "GET" \
    "$API_URL/api/v1/invalid/endpoint" \
    "-H 'Authorization: Bearer test_key'"

echo "=========================================="
echo -e "${GREEN}✅ 所有测试完成!${NC}"
echo "=========================================="
echo ""
echo "如果所有测试都通过,你的 API 已成功部署!"
echo "现在可以:"
echo "  1. 使用 Postman Collection 进行更详细的测试"
echo "  2. 将 API 集成到你的应用中"
echo "  3. 查看 Cloudflare Dashboard 的使用统计"
echo ""
