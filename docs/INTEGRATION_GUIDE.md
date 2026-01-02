# 集成指南 - S2Y Batches API

## 概述

本指南帮助您快速将 S2Y Batches API 集成到您的应用中。

## 前置条件

1. **注册账号**: 访问 [https://s2y-batches.com](https://s2y-batches.com) 注册
2. **获取 API Key**: 在控制台生成 API Key
3. **选择计划**: 根据需求选择合适的服务计划

## 快速开始 (5 分钟)

### 步骤 1: 测试连接

使用 cURL 测试 API 连接:

```bash
curl https://s2y-batches.javenisme.workers.dev/health
```

预期响应:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "project": "LCRAS API"
}
```

### 步骤 2: 验证 API Key

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://s2y-batches.javenisme.workers.dev/api/v1/batch/EN6201
```

如果返回批次数据,说明 API Key 有效。

### 步骤 3: 集成到代码

选择您的编程语言:

#### Python

```python
import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://s2y-batches.javenisme.workers.dev"

headers = {"Authorization": f"Bearer {API_KEY}"}

# 获取批次信息
response = requests.get(f"{BASE_URL}/api/v1/batch/EN6201", headers=headers)
batch = response.json()
print(f"Risk Score: {batch['risk_score']}")
```

#### JavaScript/Node.js

```javascript
const API_KEY = "your_api_key_here";
const BASE_URL = "https://s2y-batches.javenisme.workers.dev";

const headers = {
  Authorization: `Bearer ${API_KEY}`,
};

// 获取批次信息
fetch(`${BASE_URL}/api/v1/batch/EN6201`, { headers })
  .then((res) => res.json())
  .then((batch) => console.log(`Risk Score: ${batch.risk_score}`));
```

#### PHP

```php
<?php
$api_key = "your_api_key_here";
$base_url = "https://s2y-batches.javenisme.workers.dev";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "$base_url/api/v1/batch/EN6201");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $api_key"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$batch = json_decode($response, true);
echo "Risk Score: " . $batch['risk_score'];
curl_close($ch);
?>
```

---

## 常见集成场景

### 场景 1: 疫苗批次查询系统

**需求**: 用户输入批次代码,显示风险信息

**实现**:

```python
def get_batch_info(batch_code):
    """获取批次信息"""
    response = requests.get(
        f"{BASE_URL}/api/v1/batch/{batch_code}",
        headers=headers
    )

    if response.status_code == 404:
        return {"error": "批次不存在"}

    return response.json()

# 使用
batch_code = input("请输入批次代码: ")
info = get_batch_info(batch_code)

if "error" not in info:
    print(f"制造商: {info['manufacturer']}")
    print(f"风险等级: {info['risk_level']}")
    print(f"风险分数: {info['risk_score']}/10")
else:
    print(info["error"])
```

---

### 场景 2: 个性化风险评估工具

**需求**: 根据用户信息提供个性化风险评估

**实现**:

```python
def assess_user_risk(batch_code, age, sex, conditions=None):
    """评估用户风险"""
    data = {
        "batch_code": batch_code,
        "user_profile": {
            "age": age,
            "sex": sex,
            "pre_existing_conditions": conditions or [],
            "previous_covid_infection": False
        }
    }

    response = requests.post(
        f"{BASE_URL}/api/v1/risk/assess",
        headers=headers,
        json=data
    )

    return response.json()

# 使用
assessment = assess_user_risk(
    batch_code="EN6201",
    age=45,
    sex="M",
    conditions=["hypertension"]
)

print(f"您的风险分数: {assessment['risk_score']}/10")
print(f"风险等级: {assessment['risk_level']}")
print("\n风险因素:")
for factor in assessment['risk_factors']:
    print(f"  • {factor['factor']}: {factor['impact']}")
    print(f"    {factor['description']}")
```

---

### 场景 3: 批次对比工具

**需求**: 对比多个批次的风险

**实现**:

```python
from concurrent.futures import ThreadPoolExecutor

def compare_batches(batch_codes):
    """对比多个批次"""
    def fetch_batch(code):
        response = requests.get(
            f"{BASE_URL}/api/v1/batch/{code}",
            headers=headers
        )
        return response.json() if response.status_code == 200 else None

    with ThreadPoolExecutor(max_workers=5) as executor:
        batches = list(executor.map(fetch_batch, batch_codes))

    # 过滤掉不存在的批次
    batches = [b for b in batches if b is not None]

    # 按风险分数排序
    batches.sort(key=lambda x: x.get('risk_score', 0), reverse=True)

    return batches

# 使用
batch_codes = ["EN6201", "FM0173", "EW0150"]
results = compare_batches(batch_codes)

print("批次风险对比 (从高到低):")
for batch in results:
    print(f"{batch['batch_code']}: {batch['risk_score']}/10 ({batch['risk_level']})")
```

---

### 场景 4: 症状分析仪表板

**需求**: 显示批次的热门症状

**实现**:

```python
def get_batch_symptoms(batch_code, limit=10):
    """获取批次症状"""
    response = requests.get(
        f"{BASE_URL}/api/v1/batch/{batch_code}/top-symptoms",
        headers=headers,
        params={"limit": limit}
    )

    return response.json()

# 使用
symptoms = get_batch_symptoms("EN6201", limit=5)

print(f"批次 {symptoms['batch_code']} 的热门症状:")
for symptom in symptoms['symptoms']:
    print(f"  {symptom['symptom_name']}: {symptom['frequency']} 次 ({symptom['percentage']:.1f}%)")
```

---

## 高级集成

### 1. 实现缓存机制

减少 API 调用,提高性能:

```python
import time
from functools import lru_cache

class CachedS2YClient:
    def __init__(self, api_key, cache_ttl=3600):
        self.api_key = api_key
        self.base_url = "https://s2y-batches.javenisme.workers.dev"
        self.headers = {"Authorization": f"Bearer {api_key}"}
        self.cache_ttl = cache_ttl

    @lru_cache(maxsize=100)
    def _get_batch_cached(self, batch_code, ttl_hash):
        """带缓存的批次查询"""
        response = requests.get(
            f"{self.base_url}/api/v1/batch/{batch_code}",
            headers=self.headers
        )
        return response.json()

    def get_batch(self, batch_code):
        """获取批次(自动缓存)"""
        ttl_hash = int(time.time() / self.cache_ttl)
        return self._get_batch_cached(batch_code, ttl_hash)

# 使用
client = CachedS2YClient(API_KEY, cache_ttl=3600)  # 缓存 1 小时
batch = client.get_batch("EN6201")  # 第一次调用 API
batch = client.get_batch("EN6201")  # 从缓存读取
```

---

### 2. 错误处理和重试

实现健壮的错误处理:

```python
import time
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

class RobustS2YClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://s2y-batches.javenisme.workers.dev"

        # 配置重试策略
        self.session = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET", "POST"]
        )
        adapter = HTTPAdapter(max_retries=retry)
        self.session.mount('https://', adapter)
        self.session.headers.update({"Authorization": f"Bearer {api_key}"})

    def get_batch(self, batch_code):
        """获取批次(带重试)"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/v1/batch/{batch_code}",
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                raise ValueError(f"批次 {batch_code} 不存在")
            elif e.response.status_code == 429:
                raise Exception("请求过于频繁,请稍后重试")
            else:
                raise Exception(f"API 错误: {e}")
        except requests.exceptions.Timeout:
            raise Exception("请求超时")
        except requests.exceptions.RequestException as e:
            raise Exception(f"网络错误: {e}")

# 使用
client = RobustS2YClient(API_KEY)
try:
    batch = client.get_batch("EN6201")
    print(f"Risk Score: {batch['risk_score']}")
except ValueError as e:
    print(f"数据错误: {e}")
except Exception as e:
    print(f"错误: {e}")
```

---

### 3. 异步请求 (Python)

使用 asyncio 提高并发性能:

```python
import asyncio
import aiohttp

class AsyncS2YClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://s2y-batches.javenisme.workers.dev"
        self.headers = {"Authorization": f"Bearer {api_key}"}

    async def get_batch(self, session, batch_code):
        """异步获取批次"""
        url = f"{self.base_url}/api/v1/batch/{batch_code}"
        async with session.get(url, headers=self.headers) as response:
            return await response.json()

    async def get_batches(self, batch_codes):
        """异步获取多个批次"""
        async with aiohttp.ClientSession() as session:
            tasks = [self.get_batch(session, code) for code in batch_codes]
            return await asyncio.gather(*tasks)

# 使用
async def main():
    client = AsyncS2YClient(API_KEY)
    batch_codes = ["EN6201", "FM0173", "EW0150"]
    batches = await client.get_batches(batch_codes)

    for batch in batches:
        print(f"{batch['batch_code']}: {batch['risk_score']}")

asyncio.run(main())
```

---

### 4. Webhook 集成 (接收通知)

如果您的应用需要接收批次更新通知:

```python
from flask import Flask, request, jsonify
import hmac
import hashlib

app = Flask(__name__)
WEBHOOK_SECRET = "your_webhook_secret"

@app.route('/webhook/batch-update', methods=['POST'])
def batch_update_webhook():
    """接收批次更新通知"""
    # 验证签名
    signature = request.headers.get('X-S2Y-Signature')
    body = request.get_data()
    expected_signature = hmac.new(
        WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()

    if signature != expected_signature:
        return jsonify({"error": "Invalid signature"}), 401

    # 处理更新
    data = request.json
    batch_code = data['batch_code']
    new_risk_score = data['risk_score']

    print(f"批次 {batch_code} 风险分数更新为 {new_risk_score}")

    # 在此处添加您的业务逻辑
    # 例如: 通知用户、更新数据库等

    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    app.run(port=5000)
```

---

## 性能优化建议

### 1. 批量请求

避免循环调用 API,使用并发请求:

```python
# ❌ 不推荐
for batch_code in batch_codes:
    batch = get_batch(batch_code)  # 串行请求

# ✅ 推荐
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=5) as executor:
    batches = list(executor.map(get_batch, batch_codes))  # 并发请求
```

### 2. 使用缓存

对于不经常变化的数据,使用缓存:

```python
# Redis 缓存示例
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_batch_with_cache(batch_code):
    # 尝试从缓存读取
    cached = redis_client.get(f"batch:{batch_code}")
    if cached:
        return json.loads(cached)

    # 缓存未命中,调用 API
    batch = get_batch(batch_code)

    # 存入缓存 (1 小时过期)
    redis_client.setex(
        f"batch:{batch_code}",
        3600,
        json.dumps(batch)
    )

    return batch
```

### 3. 监控速率限制

主动监控 API 使用情况:

```python
def get_batch_with_rate_limit_check(batch_code):
    response = requests.get(
        f"{BASE_URL}/api/v1/batch/{batch_code}",
        headers=headers
    )

    # 检查速率限制
    remaining = int(response.headers.get('X-RateLimit-Remaining', 0))
    if remaining < 10:
        print(f"警告: API 配额即将用尽,剩余 {remaining} 次")

    return response.json()
```

---

## 安全最佳实践

### 1. 保护 API Key

```python
# ❌ 不要硬编码 API Key
API_KEY = "sk_live_1234567890"

# ✅ 使用环境变量
import os
API_KEY = os.getenv('S2Y_API_KEY')

# ✅ 或使用配置文件 (不要提交到 Git)
import json
with open('config.json') as f:
    config = json.load(f)
    API_KEY = config['api_key']
```

### 2. 使用 HTTPS

```python
# ✅ 始终使用 HTTPS
BASE_URL = "https://s2y-batches.javenisme.workers.dev"

# ❌ 不要使用 HTTP (生产环境)
# BASE_URL = "http://api.s2y-batches.com"
```

### 3. 验证响应数据

```python
def validate_batch_response(batch):
    """验证响应数据"""
    required_fields = ['batch_code', 'manufacturer', 'risk_score']

    for field in required_fields:
        if field not in batch:
            raise ValueError(f"响应缺少必填字段: {field}")

    if not (0 <= batch['risk_score'] <= 10):
        raise ValueError(f"风险分数无效: {batch['risk_score']}")

    return True
```

---

## 测试

### 单元测试示例

```python
import unittest
from unittest.mock import patch, Mock

class TestS2YClient(unittest.TestCase):
    def setUp(self):
        self.api_key = "test_api_key"
        self.client = S2YClient(self.api_key)

    @patch('requests.get')
    def test_get_batch_success(self, mock_get):
        # Mock 响应
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "batch_code": "EN6201",
            "risk_score": 7.2
        }
        mock_get.return_value = mock_response

        # 测试
        batch = self.client.get_batch("EN6201")
        self.assertEqual(batch['batch_code'], "EN6201")
        self.assertEqual(batch['risk_score'], 7.2)

    @patch('requests.get')
    def test_get_batch_not_found(self, mock_get):
        # Mock 404 响应
        mock_response = Mock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response

        # 测试
        with self.assertRaises(ValueError):
            self.client.get_batch("INVALID")

if __name__ == '__main__':
    unittest.test()
```

---

## 故障排查

### 常见问题

#### 1. 401 Unauthorized

**原因**: API Key 无效或缺失

**解决**:

```python
# 检查 API Key 是否正确设置
print(f"API Key: {API_KEY[:10]}...")  # 只打印前 10 个字符

# 检查请求头
print(f"Headers: {headers}")
```

#### 2. 429 Too Many Requests

**原因**: 超出速率限制

**解决**:

```python
import time

def get_batch_with_backoff(batch_code, max_retries=3):
    for i in range(max_retries):
        response = requests.get(
            f"{BASE_URL}/api/v1/batch/{batch_code}",
            headers=headers
        )

        if response.status_code == 429:
            wait_time = 2 ** i  # 指数退避
            print(f"速率限制,等待 {wait_time} 秒...")
            time.sleep(wait_time)
            continue

        return response.json()

    raise Exception("超出最大重试次数")
```

#### 3. 404 Not Found

**原因**: 批次代码不存在

**解决**:

```python
def get_batch_safe(batch_code):
    response = requests.get(
        f"{BASE_URL}/api/v1/batch/{batch_code}",
        headers=headers
    )

    if response.status_code == 404:
        print(f"批次 {batch_code} 不存在")
        return None

    return response.json()
```

---

## 生产环境检查清单

在部署到生产环境前,请确保:

- [ ] API Key 存储在环境变量或密钥管理服务中
- [ ] 使用 HTTPS 连接
- [ ] 实现了错误处理和重试机制
- [ ] 实现了缓存机制
- [ ] 监控 API 使用情况和速率限制
- [ ] 记录 API 调用日志
- [ ] 实现了超时设置
- [ ] 验证响应数据
- [ ] 编写了单元测试
- [ ] 准备了故障恢复方案

---

## 支持资源

- **完整 API 文档**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **快速参考**: [API_QUICK_REFERENCE_CN.md](./API_QUICK_REFERENCE_CN.md)
- **OpenAPI 规范**: [openapi.yaml](./openapi.yaml)
- **Postman Collection**: [S2Y_Batches_API.postman_collection.json](./S2Y_Batches_API.postman_collection.json)

## 获取帮助

- 📧 Email: support@s2y-batches.com
- 💬 Discord: https://discord.gg/s2y-batches
- 📚 文档: https://docs.s2y-batches.com
- 🐛 问题反馈: https://github.com/s2y-batches/api/issues

---

## 更新日志

### v1.0.0 (2026-01-01)

- 初始版本发布
