# API 快速参考 - S2Y Batches

## 快速开始

### 1. 基础信息

```
生产环境: https://s2y-batches.javenisme.workers.dev
API 版本: v1
认证方式: Bearer Token
数据格式: JSON
```

### 2. 认证

在所有请求头中添加:

```
Authorization: Bearer YOUR_API_KEY
```

---

## 核心 API 端点

### 📊 批次查询

#### 获取单个批次详情

```http
GET /api/v1/batch/{batch_code}
```

**示例**:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://s2y-batches.javenisme.workers.dev/api/v1/batch/EN6201
```

**响应**:

```json
{
  "batch_code": "EN6201",
  "manufacturer": "Pfizer",
  "risk_score": 7.2,
  "risk_level": "High",
  "total_reports": 1523,
  "deaths": 45
}
```

---

#### 搜索批次

```http
GET /api/v1/batch/search?manufacturer={制造商}&risk_score_min={最低分}&limit={数量}
```

**参数**:

- `manufacturer`: 制造商 (可选)
- `risk_score_min`: 最低风险分 0-10 (可选)
- `risk_score_max`: 最高风险分 0-10 (可选)
- `limit`: 返回数量 1-500 (默认 50)
- `offset`: 分页偏移 (默认 0)

**示例**:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://s2y-batches.javenisme.workers.dev/api/v1/batch/search?manufacturer=Pfizer&risk_score_min=5.0&limit=20"
```

---

#### 获取批次热门症状

```http
GET /api/v1/batch/{batch_code}/top-symptoms?limit={数量}
```

**示例**:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://s2y-batches.javenisme.workers.dev/api/v1/batch/EN6201/top-symptoms?limit=10
```

**响应**:

```json
{
  "batch_code": "EN6201",
  "symptoms": [
    {
      "symptom_name": "Headache",
      "frequency": 456,
      "percentage": 29.95
    }
  ]
}
```

---

### 🎯 风险评估

#### 个性化风险评估

```http
POST /api/v1/risk/assess
```

**请求体**:

```json
{
  "batch_code": "EN6201",
  "user_profile": {
    "age": 45,
    "sex": "M",
    "pre_existing_conditions": ["hypertension", "diabetes"],
    "previous_covid_infection": false,
    "dose_number": 2
  }
}
```

**字段说明**:

- `age`: 年龄 (0-120)
- `sex`: 性别 "M"(男) / "F"(女) / "U"(未知)
- `pre_existing_conditions`: 既往疾病数组 (可选)
- `previous_covid_infection`: 是否曾感染 (可选)
- `dose_number`: 疫苗剂次 1-5 (可选)

**示例**:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "batch_code": "EN6201",
    "user_profile": {
      "age": 45,
      "sex": "M",
      "pre_existing_conditions": ["hypertension"],
      "previous_covid_infection": false,
      "dose_number": 2
    }
  }' \
  https://s2y-batches.javenisme.workers.dev/api/v1/risk/assess
```

**响应**:

```json
{
  "batch_code": "EN6201",
  "manufacturer": "Pfizer",
  "risk_score": 7.2,
  "risk_level": "Medium",
  "confidence": 0.85,
  "risk_factors": [
    {
      "factor": "Age 45 (40-50)",
      "impact": "+1.0",
      "description": "中年人群风险略有升高"
    }
  ],
  "comparative_stats": {
    "batch_avg_severity": 6.5,
    "global_avg_severity": 4.2,
    "percentile": 75
  }
}
```

---

#### 获取批次风险统计

```http
GET /api/v1/risk/batch/{batch_code}
```

**示例**:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://s2y-batches.javenisme.workers.dev/api/v1/risk/batch/EN6201
```

---

## 错误码速查表

| HTTP 码 | 错误码              | 说明         | 处理方式     |
| ------- | ------------------- | ------------ | ------------ |
| 200     | -                   | 成功         | -            |
| 400     | INVALID_PARAMETERS  | 参数错误     | 检查请求参数 |
| 401     | UNAUTHORIZED        | 未授权       | 检查 API Key |
| 404     | BATCH_NOT_FOUND     | 批次不存在   | 验证批次代码 |
| 422     | VALIDATION_ERROR    | 数据验证失败 | 检查数据格式 |
| 429     | RATE_LIMIT_EXCEEDED | 超出速率限制 | 等待后重试   |
| 500     | INTERNAL_ERROR      | 服务器错误   | 联系技术支持 |

---

## 速率限制

| 计划       | 每分钟 | 每天    |
| ---------- | ------ | ------- |
| Free       | 60     | 1,000   |
| Basic      | 300    | 10,000  |
| Pro        | 1,000  | 100,000 |
| Enterprise | 自定义 | 自定义  |

**响应头**:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

---

## Python 快速示例

```python
import requests

class S2YClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://s2y-batches.javenisme.workers.dev"
        self.headers = {"Authorization": f"Bearer {api_key}"}

    def get_batch(self, batch_code):
        url = f"{self.base_url}/api/v1/batch/{batch_code}"
        return requests.get(url, headers=self.headers).json()

    def assess_risk(self, batch_code, age, sex, conditions=None):
        url = f"{self.base_url}/api/v1/risk/assess"
        data = {
            "batch_code": batch_code,
            "user_profile": {
                "age": age,
                "sex": sex,
                "pre_existing_conditions": conditions or []
            }
        }
        return requests.post(url, headers=self.headers, json=data).json()

# 使用
client = S2YClient("your_api_key")
batch = client.get_batch("EN6201")
print(f"风险分数: {batch['risk_score']}")

assessment = client.assess_risk("EN6201", 45, "M", ["hypertension"])
print(f"个性化风险: {assessment['risk_score']} ({assessment['risk_level']})")
```

---

## JavaScript 快速示例

```javascript
class S2YClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://s2y-batches.javenisme.workers.dev";
  }

  async getBatch(batchCode) {
    const response = await fetch(`${this.baseUrl}/api/v1/batch/${batchCode}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    return response.json();
  }

  async assessRisk(batchCode, age, sex, conditions = []) {
    const response = await fetch(`${this.baseUrl}/api/v1/risk/assess`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        batch_code: batchCode,
        user_profile: { age, sex, pre_existing_conditions: conditions },
      }),
    });
    return response.json();
  }
}

// 使用
const client = new S2YClient("your_api_key");
const batch = await client.getBatch("EN6201");
console.log(`风险分数: ${batch.risk_score}`);

const assessment = await client.assessRisk("EN6201", 45, "M", ["hypertension"]);
console.log(`个性化风险: ${assessment.risk_score} (${assessment.risk_level})`);
```

---

## 常见问题

### Q: 如何获取 API Key?

A: 访问 https://s2y-batches.com/dashboard 注册账号并生成 API Key

### Q: 支持哪些制造商?

A: Pfizer, Moderna, Johnson & Johnson, AstraZeneca 等

### Q: 风险分数如何计算?

A: 基于批次的不良事件报告数据和用户个人资料,使用机器学习模型计算

### Q: 数据多久更新一次?

A: 每周更新一次,数据来源于公开的不良事件报告系统

### Q: 可以批量查询吗?

A: 可以,建议使用并发请求,但注意速率限制

---

## 技术支持

- 📧 Email: support@s2y-batches.com
- 📚 完整文档: https://docs.s2y-batches.com
- 🔧 API 状态: https://status.s2y-batches.com
- 💬 Discord: https://discord.gg/s2y-batches
