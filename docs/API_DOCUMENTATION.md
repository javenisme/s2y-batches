# API Documentation - S2Y Batches SAAS

## 概述

S2Y Batches 是一个提供疫苗批次风险评估和数据分析的 SAAS 服务。本文档详细说明了外部应用如何调用我们的 API。

## 基础信息

- **Base URL**: `https://s2y-batches.javenisme.workers.dev` (生产环境)
- **Base URL**: `http://localhost:8000` (开发环境)
- **API Version**: `v1`
- **API Prefix**: `/api/v1`
- **协议**: HTTPS (生产环境), HTTP (开发环境)
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证方式

### API Key 认证 (推荐)

在请求头中添加 API Key:

```http
Authorization: Bearer YOUR_API_KEY
```

### 获取 API Key

1. 注册账号: `POST /api/v1/auth/register`
2. 登录获取 Token: `POST /api/v1/auth/login`
3. 在控制台生成 API Key

## 通用请求头

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer YOUR_API_KEY
X-Request-ID: unique-request-id (可选,用于追踪)
```

## 通用响应格式

### 成功响应

```json
{
  "status": "success",
  "data": {
    // 具体数据
  },
  "timestamp": "2026-01-01T18:15:15Z",
  "request_id": "req_123456789"
}
```

### 错误响应

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {
      // 详细错误信息
    }
  },
  "timestamp": "2026-01-01T18:15:15Z",
  "request_id": "req_123456789"
}
```

---

## API 端点

### 1. 健康检查

检查 API 服务状态。

**端点**: `GET /health`

**认证**: 不需要

**请求示例**:

```http
GET /health HTTP/1.1
Host: api.s2y-batches.com
```

**响应示例**:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "project": "LCRAS API"
}
```

**状态码**:

- `200 OK`: 服务正常

---

### 2. 获取批次详情

获取指定疫苗批次的详细信息。

**端点**: `GET /api/v1/batch/{batch_code}`

**认证**: 需要

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| batch_code | string | 是 | 疫苗批次代码 (如: EN6201) |

**请求示例**:

```http
GET /api/v1/batch/EN6201 HTTP/1.1
Host: api.s2y-batches.com
Authorization: Bearer YOUR_API_KEY
```

**响应示例**:

```json
{
  "batch_code": "EN6201",
  "manufacturer": "Pfizer",
  "vaccine_type": "COVID-19",
  "total_reports": 1523,
  "deaths": 45,
  "disabilities": 23,
  "life_threatening": 67,
  "hospitalizations": 234,
  "severe_reports_pct": 24.36,
  "lethality_pct": 2.95,
  "risk_score": 7.2,
  "risk_level": "High",
  "first_report_date": "2021-01-15",
  "last_report_date": "2023-06-30",
  "country_distribution": {
    "US": 1200,
    "UK": 200,
    "CA": 123
  },
  "state_distribution": {
    "CA": 450,
    "NY": 320,
    "TX": 280
  }
}
```

**状态码**:

- `200 OK`: 成功
- `404 Not Found`: 批次代码不存在
- `401 Unauthorized`: 未授权
- `429 Too Many Requests`: 请求过于频繁

---

### 3. 搜索批次

根据条件搜索疫苗批次。

**端点**: `GET /api/v1/batch/search`

**认证**: 需要

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| manufacturer | string | 否 | - | 制造商名称 (Pfizer, Moderna, etc.) |
| risk_score_min | float | 否 | - | 最低风险分数 (0-10) |
| risk_score_max | float | 否 | - | 最高风险分数 (0-10) |
| min_reports | integer | 否 | 10 | 最少报告数量 |
| limit | integer | 否 | 50 | 返回结果数量 (1-500) |
| offset | integer | 否 | 0 | 分页偏移量 |

**请求示例**:

```http
GET /api/v1/batch/search?manufacturer=Pfizer&risk_score_min=5.0&limit=20 HTTP/1.1
Host: api.s2y-batches.com
Authorization: Bearer YOUR_API_KEY
```

**响应示例**:

```json
{
  "batches": [
    {
      "batch_code": "EN6201",
      "manufacturer": "Pfizer",
      "vaccine_type": "COVID-19",
      "total_reports": 1523,
      "deaths": 45,
      "disabilities": 23,
      "life_threatening": 67,
      "hospitalizations": 234,
      "severe_reports_pct": 24.36,
      "lethality_pct": 2.95,
      "risk_score": 7.2,
      "risk_level": "High",
      "first_report_date": "2021-01-15",
      "last_report_date": "2023-06-30"
    }
  ],
  "total_count": 156,
  "limit": 20,
  "offset": 0
}
```

**状态码**:

- `200 OK`: 成功
- `400 Bad Request`: 参数错误
- `401 Unauthorized`: 未授权
- `429 Too Many Requests`: 请求过于频繁

---

### 4. 获取批次热门症状

获取指定批次最常见的不良反应症状。

**端点**: `GET /api/v1/batch/{batch_code}/top-symptoms`

**认证**: 需要

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| batch_code | string | 是 | 疫苗批次代码 |

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| limit | integer | 否 | 20 | 返回症状数量 (1-100) |

**请求示例**:

```http
GET /api/v1/batch/EN6201/top-symptoms?limit=10 HTTP/1.1
Host: api.s2y-batches.com
Authorization: Bearer YOUR_API_KEY
```

**响应示例**:

```json
{
  "batch_code": "EN6201",
  "total_symptoms": 10,
  "symptoms": [
    {
      "symptom_name": "Headache",
      "frequency": 456,
      "percentage": 29.95
    },
    {
      "symptom_name": "Fatigue",
      "frequency": 389,
      "percentage": 25.54
    },
    {
      "symptom_name": "Fever",
      "frequency": 267,
      "percentage": 17.53
    }
  ]
}
```

**状态码**:

- `200 OK`: 成功
- `404 Not Found`: 批次代码不存在
- `401 Unauthorized`: 未授权

---

### 5. 风险评估

根据用户个人资料评估疫苗批次的个性化风险。

**端点**: `POST /api/v1/risk/assess`

**认证**: 需要

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
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| batch_code | string | 是 | 疫苗批次代码 |
| user_profile.age | integer | 是 | 年龄 (0-120) |
| user_profile.sex | string | 是 | 性别: M (男), F (女), U (未知) |
| user_profile.pre_existing_conditions | array | 否 | 既往疾病列表 |
| user_profile.previous_covid_infection | boolean | 否 | 是否曾感染 COVID-19 |
| user_profile.dose_number | integer | 否 | 疫苗剂次 (1-5) |

**请求示例**:

```http
POST /api/v1/risk/assess HTTP/1.1
Host: api.s2y-batches.com
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "batch_code": "EN6201",
  "user_profile": {
    "age": 45,
    "sex": "M",
    "pre_existing_conditions": ["hypertension"],
    "previous_covid_infection": false,
    "dose_number": 2
  }
}
```

**响应示例**:

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
      "description": "Middle-aged individuals show moderately elevated risk"
    },
    {
      "factor": "Pre-existing conditions",
      "impact": "+0.8",
      "description": "Conditions (hypertension) may increase risk"
    },
    {
      "factor": "High batch severity",
      "impact": "+7.2",
      "description": "This batch has above-average adverse event reports"
    }
  ],
  "comparative_stats": {
    "batch_avg_severity": 6.5,
    "global_avg_severity": 4.2,
    "percentile": 75
  },
  "timestamp": "2026-01-01T18:15:15Z"
}
```

**状态码**:

- `200 OK`: 成功
- `400 Bad Request`: 请求参数错误
- `404 Not Found`: 批次代码不存在
- `401 Unauthorized`: 未授权
- `422 Unprocessable Entity`: 数据验证失败

---

### 6. 获取批次风险统计

获取批次的聚合风险统计数据(无个性化)。

**端点**: `GET /api/v1/risk/batch/{batch_code}`

**认证**: 需要

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| batch_code | string | 是 | 疫苗批次代码 |

**请求示例**:

```http
GET /api/v1/risk/batch/EN6201 HTTP/1.1
Host: api.s2y-batches.com
Authorization: Bearer YOUR_API_KEY
```

**响应示例**:

```json
{
  "batch_code": "EN6201",
  "manufacturer": "Pfizer",
  "total_reports": 1523,
  "deaths": 45,
  "disabilities": 23,
  "life_threatening": 67,
  "hospitalizations": 234,
  "severe_reports_pct": 24.36,
  "lethality_pct": 2.95,
  "risk_score": 7.2
}
```

**状态码**:

- `200 OK`: 成功
- `404 Not Found`: 批次代码不存在
- `401 Unauthorized`: 未授权

---

## 错误码定义

### HTTP 状态码

| 状态码 | 说明                          |
| ------ | ----------------------------- |
| 200    | 请求成功                      |
| 201    | 创建成功                      |
| 400    | 请求参数错误                  |
| 401    | 未授权 (缺少或无效的 API Key) |
| 403    | 禁止访问 (权限不足)           |
| 404    | 资源不存在                    |
| 422    | 数据验证失败                  |
| 429    | 请求过于频繁 (超出速率限制)   |
| 500    | 服务器内部错误                |
| 503    | 服务暂时不可用                |

### 业务错误码

| 错误码                 | 说明                            | HTTP 状态码 |
| ---------------------- | ------------------------------- | ----------- |
| BATCH_NOT_FOUND        | 批次代码不存在                  | 404         |
| INVALID_BATCH_CODE     | 批次代码格式无效                | 400         |
| INVALID_PARAMETERS     | 请求参数无效                    | 400         |
| MISSING_REQUIRED_FIELD | 缺少必填字段                    | 400         |
| VALIDATION_ERROR       | 数据验证失败                    | 422         |
| UNAUTHORIZED           | 未授权访问                      | 401         |
| FORBIDDEN              | 禁止访问                        | 403         |
| RATE_LIMIT_EXCEEDED    | 超出速率限制                    | 429         |
| INTERNAL_ERROR         | 服务器内部错误                  | 500         |
| SERVICE_UNAVAILABLE    | 服务暂时不可用                  | 503         |
| DATABASE_ERROR         | 数据库错误                      | 500         |
| INVALID_AGE            | 年龄值无效 (必须在 0-120 之间)  | 400         |
| INVALID_SEX            | 性别值无效 (必须是 M, F, 或 U)  | 400         |
| INVALID_RISK_SCORE     | 风险分数无效 (必须在 0-10 之间) | 400         |

### 错误响应示例

```json
{
  "status": "error",
  "error": {
    "code": "BATCH_NOT_FOUND",
    "message": "Batch code 'INVALID123' not found",
    "details": {
      "batch_code": "INVALID123",
      "suggestion": "Please verify the batch code and try again"
    }
  },
  "timestamp": "2026-01-01T18:15:15Z",
  "request_id": "req_123456789"
}
```

---

## 速率限制

为保证服务质量,我们对 API 请求实施速率限制:

### 限制规则

| 计划       | 每分钟请求数 | 每天请求数 |
| ---------- | ------------ | ---------- |
| Free       | 60           | 1,000      |
| Basic      | 300          | 10,000     |
| Pro        | 1,000        | 100,000    |
| Enterprise | 自定义       | 自定义     |

### 速率限制响应头

每个响应都会包含以下头部信息:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

### 超出限制响应

```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 60,
      "reset_at": "2026-01-01T18:20:00Z"
    }
  },
  "timestamp": "2026-01-01T18:15:15Z"
}
```

---

## 数据类型定义

### UserProfile

用户个人资料对象。

```typescript
interface UserProfile {
  age: number; // 年龄 (0-120)
  sex: "M" | "F" | "U"; // 性别: M=男, F=女, U=未知
  pre_existing_conditions?: string[]; // 既往疾病列表
  previous_covid_infection?: boolean; // 是否曾感染 COVID-19
  dose_number?: number; // 疫苗剂次 (1-5)
}
```

### BatchResponse

批次信息响应对象。

```typescript
interface BatchResponse {
  batch_code: string; // 批次代码
  manufacturer: string; // 制造商
  vaccine_type: string; // 疫苗类型
  total_reports: number; // 总报告数
  deaths: number; // 死亡数
  disabilities: number; // 致残数
  life_threatening: number; // 危及生命数
  hospitalizations: number; // 住院数
  severe_reports_pct?: number; // 严重报告百分比
  lethality_pct?: number; // 致死率百分比
  risk_score?: number; // 风险分数 (0-10)
  risk_level?: string; // 风险等级 (Low/Medium/High)
  first_report_date?: string; // 首次报告日期 (ISO 8601)
  last_report_date?: string; // 最后报告日期 (ISO 8601)
  country_distribution?: Record<string, number>; // 国家分布
  state_distribution?: Record<string, number>; // 州/省分布
}
```

### RiskAssessmentResponse

风险评估响应对象。

```typescript
interface RiskAssessmentResponse {
  batch_code: string; // 批次代码
  manufacturer: string; // 制造商
  risk_score: number; // 个性化风险分数 (0-10)
  risk_level: string; // 风险等级 (Low/Medium/High)
  confidence: number; // 模型置信度 (0.0-1.0)
  risk_factors: RiskFactor[]; // 风险因素列表
  comparative_stats: ComparativeStats; // 对比统计
  timestamp: string; // 评估时间戳 (ISO 8601)
}

interface RiskFactor {
  factor: string; // 风险因素名称
  impact: string; // 影响值 (如: "+1.5")
  description: string; // 详细描述
}

interface ComparativeStats {
  batch_avg_severity: number; // 批次平均严重度
  global_avg_severity: number; // 全局平均严重度
  percentile: number; // 百分位排名 (0-100)
}
```

---

## SDK 和代码示例

### Python SDK

```python
import requests

class S2YBatchesClient:
    def __init__(self, api_key: str, base_url: str = "https://s2y-batches.javenisme.workers.dev"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

    def get_batch(self, batch_code: str):
        """获取批次详情"""
        url = f"{self.base_url}/api/v1/batch/{batch_code}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def search_batches(self, manufacturer=None, risk_score_min=None,
                       risk_score_max=None, limit=50):
        """搜索批次"""
        url = f"{self.base_url}/api/v1/batch/search"
        params = {
            "manufacturer": manufacturer,
            "risk_score_min": risk_score_min,
            "risk_score_max": risk_score_max,
            "limit": limit
        }
        # 移除 None 值
        params = {k: v for k, v in params.items() if v is not None}

        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()

    def assess_risk(self, batch_code: str, user_profile: dict):
        """风险评估"""
        url = f"{self.base_url}/api/v1/risk/assess"
        data = {
            "batch_code": batch_code,
            "user_profile": user_profile
        }
        response = requests.post(url, headers=self.headers, json=data)
        response.raise_for_status()
        return response.json()

# 使用示例
client = S2YBatchesClient(api_key="your_api_key_here")

# 获取批次详情
batch = client.get_batch("EN6201")
print(f"Batch: {batch['batch_code']}, Risk Score: {batch['risk_score']}")

# 搜索高风险批次
results = client.search_batches(manufacturer="Pfizer", risk_score_min=7.0)
print(f"Found {results['total_count']} high-risk batches")

# 个性化风险评估
user_profile = {
    "age": 45,
    "sex": "M",
    "pre_existing_conditions": ["hypertension"],
    "previous_covid_infection": False,
    "dose_number": 2
}
assessment = client.assess_risk("EN6201", user_profile)
print(f"Your risk score: {assessment['risk_score']} ({assessment['risk_level']})")
```

### JavaScript/TypeScript SDK

```typescript
class S2YBatchesClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = "https://s2y-batches.javenisme.workers.dev") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "API request failed");
    }

    return response.json();
  }

  async getBatch(batchCode: string) {
    return this.request(`/api/v1/batch/${batchCode}`);
  }

  async searchBatches(params: {
    manufacturer?: string;
    risk_score_min?: number;
    risk_score_max?: number;
    limit?: number;
  }) {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined)
    ).toString();

    return this.request(`/api/v1/batch/search?${queryString}`);
  }

  async assessRisk(
    batchCode: string,
    userProfile: {
      age: number;
      sex: "M" | "F" | "U";
      pre_existing_conditions?: string[];
      previous_covid_infection?: boolean;
      dose_number?: number;
    }
  ) {
    return this.request("/api/v1/risk/assess", {
      method: "POST",
      body: JSON.stringify({
        batch_code: batchCode,
        user_profile: userProfile,
      }),
    });
  }
}

// 使用示例
const client = new S2YBatchesClient("your_api_key_here");

// 获取批次详情
const batch = await client.getBatch("EN6201");
console.log(`Batch: ${batch.batch_code}, Risk Score: ${batch.risk_score}`);

// 个性化风险评估
const assessment = await client.assessRisk("EN6201", {
  age: 45,
  sex: "M",
  pre_existing_conditions: ["hypertension"],
  previous_covid_infection: false,
  dose_number: 2,
});
console.log(
  `Your risk score: ${assessment.risk_score} (${assessment.risk_level})`
);
```

### cURL 示例

```bash
# 获取批次详情
curl -X GET "https://s2y-batches.javenisme.workers.dev/api/v1/batch/EN6201" \
  -H "Authorization: Bearer YOUR_API_KEY"

# 搜索批次
curl -X GET "https://s2y-batches.javenisme.workers.dev/api/v1/batch/search?manufacturer=Pfizer&risk_score_min=5.0&limit=20" \
  -H "Authorization: Bearer YOUR_API_KEY"

# 风险评估
curl -X POST "https://s2y-batches.javenisme.workers.dev/api/v1/risk/assess" \
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
  }'
```

---

## 最佳实践

### 1. 错误处理

始终检查响应状态码并处理错误:

```python
try:
    batch = client.get_batch("EN6201")
except requests.exceptions.HTTPError as e:
    if e.response.status_code == 404:
        print("批次不存在")
    elif e.response.status_code == 429:
        print("请求过于频繁,请稍后重试")
    else:
        print(f"API 错误: {e.response.json()}")
```

### 2. 重试机制

对于临时性错误(如 429, 503),实施指数退避重试:

```python
import time
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

session = requests.Session()
retry = Retry(
    total=3,
    backoff_factor=1,
    status_forcelist=[429, 500, 502, 503, 504]
)
adapter = HTTPAdapter(max_retries=retry)
session.mount('https://', adapter)
```

### 3. 缓存

对于不经常变化的数据(如批次详情),实施客户端缓存:

```python
from functools import lru_cache
import time

@lru_cache(maxsize=100)
def get_batch_cached(batch_code: str, ttl_hash: int):
    return client.get_batch(batch_code)

# 使用 TTL (1小时)
ttl_hash = int(time.time() / 3600)
batch = get_batch_cached("EN6201", ttl_hash)
```

### 4. 批量请求

如需查询多个批次,使用并发请求提高效率:

```python
from concurrent.futures import ThreadPoolExecutor

batch_codes = ["EN6201", "FM0173", "EW0150"]

with ThreadPoolExecutor(max_workers=5) as executor:
    batches = list(executor.map(client.get_batch, batch_codes))
```

### 5. 监控和日志

记录 API 调用以便调试和监控:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_batch_with_logging(batch_code: str):
    logger.info(f"Fetching batch: {batch_code}")
    try:
        batch = client.get_batch(batch_code)
        logger.info(f"Successfully fetched batch: {batch_code}")
        return batch
    except Exception as e:
        logger.error(f"Failed to fetch batch {batch_code}: {e}")
        raise
```

---

## 更新日志

### v1.0.0 (2026-01-01)

- 初始版本发布
- 批次查询和搜索功能
- 个性化风险评估
- 症状统计分析

---

## 支持和联系

- **文档**: https://docs.s2y-batches.com
- **API 状态**: https://status.s2y-batches.com
- **技术支持**: support@s2y-batches.com
- **GitHub**: https://github.com/s2y-batches/api

---

## 许可证

本 API 服务受服务条款约束。详情请访问: https://s2y-batches.com/terms
