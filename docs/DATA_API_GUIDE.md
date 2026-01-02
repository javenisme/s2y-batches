# 数据 API 访问指南

## ✅ 好消息!

你的 Cloudflare Workers 部署**已经可以直接通过 API 访问数据**了!

所有 `docs/` 目录下的 JSON 文件都可以通过 HTTP 直接访问。

---

## 📊 可用的数据端点

### 1. 批次代码数据

**端点**: `/data/batchCodeTables/Global.json`

**完整 URL**:

```
https://s2y-batches.javenisme.workers.dev/data/batchCodeTables/Global.json
```

**示例**:

```bash
curl https://s2y-batches.javenisme.workers.dev/data/batchCodeTables/Global.json
```

**数据内容**: 全球批次代码表

---

### 2. 邮编风险汇总

**端点**: `/data/zipcodeRiskMap/ZipcodeRiskSummary.json`

**完整 URL**:

```
https://s2y-batches.javenisme.workers.dev/data/zipcodeRiskMap/ZipcodeRiskSummary.json
```

**示例**:

```bash
curl https://s2y-batches.javenisme.workers.dev/data/zipcodeRiskMap/ZipcodeRiskSummary.json
```

**数据格式**:

```json
{
  "columns": [
    "zipcode",
    "total_doses",
    "total_adverse_events",
    "num_batches",
    "num_providers",
    "adverse_events_per_100k",
    "risk_category",
    "top_batches",
    "zipcode_base",
    "lat",
    "lng",
    "city",
    "state",
    "coordinate_match"
  ],
  "data": [
    [
      "96746",
      300.0,
      2.92,
      1,
      1,
      973.3,
      "HIGH",
      "[{\"batch\": \"FM0173\", \"adverse_events\": 2.92}]",
      "96746",
      22.0868,
      -159.3448,
      "Kapaa",
      "HI",
      true
    ]
  ]
}
```

---

### 3. 邮编风险统计

**端点**: `/data/zipcodeRiskMap/ZipcodeRiskStats.json`

**完整 URL**:

```
https://s2y-batches.javenisme.workers.dev/data/zipcodeRiskMap/ZipcodeRiskStats.json
```

---

### 4. 疫苗分布数据

**端点**: `/data/vaccineDistributionByZipcode/VaccineDistributionByZipcode.json`

**完整 URL**:

```
https://s2y-batches.javenisme.workers.dev/data/vaccineDistributionByZipcode/VaccineDistributionByZipcode.json
```

---

### 5. 批次描述数据

**端点**: `/data/barChartDescriptionTable.json`

**完整 URL**:

```
https://s2y-batches.javenisme.workers.dev/data/barChartDescriptionTable.json
```

**数据格式**:

```json
{
  "barChartDescriptions": {
    "#003B21A": {
      "Adverse Reaction Reports guessed": [15],
      "Adverse Reaction Reports known": [3],
      "Jensen-Shannon distance": 0.0,
      "countries": ["United States"]
    }
  }
}
```

---

### 6. 症状比例报告数据

**端点**: `/SymptomsCausedByVaccines/data/ProportionalReportingRatios/vaccines/{vaccine_id}.json`

**示例**:

```
https://s2y-batches.javenisme.workers.dev/SymptomsCausedByVaccines/data/ProportionalReportingRatios/vaccines/35.json
```

可用的疫苗 ID: 3, 4, 5, 8, 9, 13, 14, 15, 18, 19, 22, 23, 24, 25, 等等

---

## 🔧 使用示例

### Python

```python
import requests

BASE_URL = "https://s2y-batches.javenisme.workers.dev"

# 获取邮编风险数据
response = requests.get(f"{BASE_URL}/data/zipcodeRiskMap/ZipcodeRiskSummary.json")
data = response.json()

print(f"数据列: {data['columns']}")
print(f"数据行数: {len(data['data'])}")

# 遍历数据
for row in data['data']:
    zipcode = row[0]
    risk_category = row[6]
    print(f"邮编 {zipcode}: 风险等级 {risk_category}")
```

### JavaScript

```javascript
const BASE_URL = "https://s2y-batches.javenisme.workers.dev";

// 获取邮编风险数据
fetch(`${BASE_URL}/data/zipcodeRiskMap/ZipcodeRiskSummary.json`)
  .then((res) => res.json())
  .then((data) => {
    console.log(`数据列: ${data.columns}`);
    console.log(`数据行数: ${data.data.length}`);

    // 遍历数据
    data.data.forEach((row) => {
      const zipcode = row[0];
      const riskCategory = row[6];
      console.log(`邮编 ${zipcode}: 风险等级 ${riskCategory}`);
    });
  });
```

### cURL

```bash
# 获取数据
curl https://s2y-batches.javenisme.workers.dev/data/zipcodeRiskMap/ZipcodeRiskSummary.json

# 使用 jq 格式化
curl -s https://s2y-batches.javenisme.workers.dev/data/zipcodeRiskMap/ZipcodeRiskSummary.json | jq '.'

# 提取特定字段
curl -s https://s2y-batches.javenisme.workers.dev/data/zipcodeRiskMap/ZipcodeRiskSummary.json | jq '.data[] | {zipcode: .[0], risk: .[6]}'
```

---

## 📝 数据处理示例

### 查询特定邮编的风险

```python
import requests

def get_zipcode_risk(zipcode):
    url = "https://s2y-batches.javenisme.workers.dev/data/zipcodeRiskMap/ZipcodeRiskSummary.json"
    response = requests.get(url)
    data = response.json()

    # 查找特定邮编
    for row in data['data']:
        if row[0] == zipcode:
            return {
                'zipcode': row[0],
                'total_doses': row[1],
                'total_adverse_events': row[2],
                'num_batches': row[3],
                'adverse_events_per_100k': row[5],
                'risk_category': row[6],
                'city': row[11],
                'state': row[12]
            }
    return None

# 使用
risk_info = get_zipcode_risk("96746")
if risk_info:
    print(f"邮编 {risk_info['zipcode']} ({risk_info['city']}, {risk_info['state']})")
    print(f"风险等级: {risk_info['risk_category']}")
    print(f"不良事件率: {risk_info['adverse_events_per_100k']} per 100k")
```

### 统计高风险邮编

```python
import requests

url = "https://s2y-batches.javenisme.workers.dev/data/zipcodeRiskMap/ZipcodeRiskSummary.json"
response = requests.get(url)
data = response.json()

# 统计各风险等级的数量
risk_counts = {}
for row in data['data']:
    risk_category = row[6]
    risk_counts[risk_category] = risk_counts.get(risk_category, 0) + 1

print("风险等级分布:")
for category, count in risk_counts.items():
    print(f"  {category}: {count} 个邮编")
```

---

## 🌐 CORS 支持

所有数据端点都支持 CORS,可以直接在前端 JavaScript 中访问:

```javascript
// 直接在浏览器中使用
fetch(
  "https://s2y-batches.javenisme.workers.dev/data/zipcodeRiskMap/ZipcodeRiskSummary.json"
)
  .then((res) => res.json())
  .then((data) => console.log(data));
```

---

## 📊 数据更新

这些数据文件是静态的,如需更新:

1. 更新 `docs/data/` 目录下的 JSON 文件
2. 重新部署到 Cloudflare Workers:
   ```bash
   wrangler deploy
   ```

---

## 🔄 与 API 文档的关系

### 当前状态

- ✅ **数据访问**: 可以通过静态 JSON 文件访问
- ⚠️ **API 端点**: 需要部署 API Worker (见 `DEPLOY_MOCK_API.md`)

### 两种方式对比

| 特性     | 静态 JSON      | API 端点       |
| -------- | -------------- | -------------- |
| 访问方式 | 直接 HTTP GET  | RESTful API    |
| 数据格式 | 固定 JSON 文件 | 动态生成       |
| 查询能力 | 需客户端过滤   | 服务端过滤     |
| 认证     | 无需认证       | 需要 API Key   |
| 适用场景 | 简单数据展示   | 复杂查询和分析 |

### 推荐使用方式

**对于简单的数据展示**:

```javascript
// 直接访问 JSON 文件
fetch(
  "https://s2y-batches.javenisme.workers.dev/data/zipcodeRiskMap/ZipcodeRiskSummary.json"
)
  .then((res) => res.json())
  .then((data) => displayData(data));
```

**对于复杂的查询和分析**:

```javascript
// 使用 API 端点 (需先部署 API Worker)
fetch(
  "https://s2y-batches-api.javenisme.workers.dev/api/v1/batch/search?risk_score_min=7.0",
  {
    headers: { Authorization: "Bearer YOUR_API_KEY" },
  }
)
  .then((res) => res.json())
  .then((data) => displayResults(data));
```

---

## 📚 相关文档

- **API 文档**: `docs/API_README.md` - 完整的 API 规范
- **部署 API**: `DEPLOY_MOCK_API.md` - 如何部署 API Worker
- **集成指南**: `docs/INTEGRATION_GUIDE.md` - 集成示例

---

## 💡 下一步建议

1. **立即可用**: 使用静态 JSON 文件进行数据展示
2. **部署 API**: 如需更复杂的功能,部署 API Worker
3. **混合使用**: 简单查询用 JSON,复杂查询用 API

---

## 🎉 总结

**是的,你的应用已经可以通过 API 访问数据了!**

- ✅ 所有 JSON 数据文件都可以直接访问
- ✅ 支持 CORS,可在前端使用
- ✅ 无需认证,简单易用
- ✅ 适合数据展示和简单查询

如需更高级的功能(如服务端过滤、认证、速率限制等),可以部署 API Worker。
