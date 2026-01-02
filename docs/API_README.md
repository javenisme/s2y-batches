# S2Y Batches API 文档总览

欢迎使用 S2Y Batches API! 这是一个为其他应用提供疫苗批次数据和风险分析服务的 SAAS 平台。

## 📚 文档导航

### 1. [API 完整文档](./API_DOCUMENTATION.md)

**适合**: 需要详细了解所有 API 功能的开发者

**内容**:

- 完整的 API 端点说明
- 详细的请求/响应格式
- 错误码定义
- SDK 代码示例 (Python, JavaScript)
- 速率限制说明
- 最佳实践

**何时使用**:

- 第一次接触 API
- 需要查看完整的 API 规范
- 需要了解错误处理

---

### 2. [API 快速参考](./API_QUICK_REFERENCE_CN.md)

**适合**: 已经熟悉 API,需要快速查阅的开发者

**内容**:

- 核心 API 端点速查
- 简化的代码示例
- 错误码速查表
- 常见问题解答

**何时使用**:

- 快速查找 API 端点
- 查看参数格式
- 复制粘贴代码示例

---

### 3. [集成指南](./INTEGRATION_GUIDE.md)

**适合**: 正在将 API 集成到应用中的开发者

**内容**:

- 5 分钟快速开始
- 常见集成场景 (批次查询、风险评估等)
- 高级功能 (缓存、重试、异步请求)
- 安全最佳实践
- 性能优化建议
- 故障排查

**何时使用**:

- 开始集成 API
- 实现特定功能场景
- 优化 API 调用性能
- 遇到问题需要排查

---

### 4. [OpenAPI 规范](./openapi.yaml)

**适合**: 需要机器可读 API 规范的开发者

**内容**:

- OpenAPI 3.0 格式的完整 API 规范
- 可用于生成客户端 SDK
- 可导入到 Swagger UI 查看交互式文档

**何时使用**:

- 生成客户端代码
- 使用 Swagger UI 测试 API
- 自动化 API 测试

**如何使用**:

```bash
# 在线查看
https://editor.swagger.io/

# 生成客户端 SDK
openapi-generator generate -i openapi.yaml -g python -o ./sdk
```

---

### 5. [Postman Collection](./S2Y_Batches_API.postman_collection.json)

**适合**: 使用 Postman 测试 API 的开发者

**内容**:

- 所有 API 端点的预配置请求
- 示例请求和响应
- 自动化测试脚本
- 环境变量配置

**何时使用**:

- 手动测试 API
- 验证 API 功能
- 调试 API 调用

**如何使用**:

1. 打开 Postman
2. 导入 `S2Y_Batches_API.postman_collection.json`
3. 设置环境变量 `api_key` 和 `base_url`
4. 开始测试

---

## 🚀 快速开始

### 1. 获取 API Key

```bash
# 注册账号
https://s2y-batches.com/register

# 登录并生成 API Key
https://s2y-batches.com/dashboard
```

### 2. 测试连接

```bash
curl https://s2y-batches.javenisme.workers.dev/health
```

### 3. 第一个 API 调用

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://s2y-batches.javenisme.workers.dev/api/v1/batch/EN6201
```

### 4. 选择您的语言

#### Python

```python
import requests

headers = {"Authorization": "Bearer YOUR_API_KEY"}
response = requests.get(
    "https://s2y-batches.javenisme.workers.dev/api/v1/batch/EN6201",
    headers=headers
)
print(response.json())
```

#### JavaScript

```javascript
fetch("https://s2y-batches.javenisme.workers.dev/api/v1/batch/EN6201", {
  headers: { Authorization: "Bearer YOUR_API_KEY" },
})
  .then((res) => res.json())
  .then((data) => console.log(data));
```

#### PHP

```php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://s2y-batches.javenisme.workers.dev/api/v1/batch/EN6201");
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer YOUR_API_KEY"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
echo $response;
curl_close($ch);
```

---

## 🔑 核心功能

### 1. 批次信息查询

获取疫苗批次的详细信息,包括不良事件统计、风险分数等。

```http
GET /api/v1/batch/{batch_code}
```

**用途**:

- 批次信息展示
- 批次对比
- 数据分析

---

### 2. 批次搜索

根据制造商、风险分数等条件搜索批次。

```http
GET /api/v1/batch/search?manufacturer=Pfizer&risk_score_min=5.0
```

**用途**:

- 高风险批次筛选
- 批次列表展示
- 数据统计

---

### 3. 个性化风险评估

根据用户年龄、性别、既往疾病等信息,评估个性化风险。

```http
POST /api/v1/risk/assess
{
  "batch_code": "EN6201",
  "user_profile": {
    "age": 45,
    "sex": "M",
    "pre_existing_conditions": ["hypertension"]
  }
}
```

**用途**:

- 个性化健康建议
- 风险评估工具
- 决策支持系统

---

### 4. 症状统计

获取批次的热门不良反应症状。

```http
GET /api/v1/batch/{batch_code}/top-symptoms
```

**用途**:

- 症状分析
- 数据可视化
- 趋势分析

---

## 📊 API 端点总览

| 端点                                      | 方法 | 功能           | 认证 |
| ----------------------------------------- | ---- | -------------- | ---- |
| `/health`                                 | GET  | 健康检查       | ❌   |
| `/api/v1/batch/{batch_code}`              | GET  | 获取批次详情   | ✅   |
| `/api/v1/batch/search`                    | GET  | 搜索批次       | ✅   |
| `/api/v1/batch/{batch_code}/top-symptoms` | GET  | 获取热门症状   | ✅   |
| `/api/v1/risk/assess`                     | POST | 个性化风险评估 | ✅   |
| `/api/v1/risk/batch/{batch_code}`         | GET  | 批次风险统计   | ✅   |

---

## 💡 常见使用场景

### 场景 1: 疫苗批次查询网站

**需求**: 用户输入批次代码,查看风险信息

**推荐 API**:

- `GET /api/v1/batch/{batch_code}` - 获取批次详情
- `GET /api/v1/batch/{batch_code}/top-symptoms` - 显示常见症状

**参考**: [集成指南 - 场景 1](./INTEGRATION_GUIDE.md#场景-1-疫苗批次查询系统)

---

### 场景 2: 个性化健康评估工具

**需求**: 根据用户信息提供个性化风险评估

**推荐 API**:

- `POST /api/v1/risk/assess` - 个性化风险评估

**参考**: [集成指南 - 场景 2](./INTEGRATION_GUIDE.md#场景-2-个性化风险评估工具)

---

### 场景 3: 批次对比分析

**需求**: 对比多个批次的风险

**推荐 API**:

- `GET /api/v1/batch/search` - 搜索批次
- `GET /api/v1/batch/{batch_code}` - 获取批次详情 (批量)

**参考**: [集成指南 - 场景 3](./INTEGRATION_GUIDE.md#场景-3-批次对比工具)

---

### 场景 4: 数据分析仪表板

**需求**: 展示批次统计和趋势

**推荐 API**:

- `GET /api/v1/batch/search` - 获取批次列表
- `GET /api/v1/batch/{batch_code}/top-symptoms` - 症状统计

**参考**: [集成指南 - 场景 4](./INTEGRATION_GUIDE.md#场景-4-症状分析仪表板)

---

## 🔒 安全和认证

### API Key 认证

所有 API 请求(除 `/health`)都需要在请求头中包含 API Key:

```http
Authorization: Bearer YOUR_API_KEY
```

### 保护 API Key

```python
# ✅ 推荐: 使用环境变量
import os
API_KEY = os.getenv('S2Y_API_KEY')

# ❌ 不推荐: 硬编码
API_KEY = "sk_live_1234567890"
```

### HTTPS

生产环境必须使用 HTTPS:

```
✅ https://s2y-batches.javenisme.workers.dev
❌ http://api.s2y-batches.com
```

---

## 📈 速率限制

| 计划       | 每分钟 | 每天    | 价格     |
| ---------- | ------ | ------- | -------- |
| Free       | 60     | 1,000   | 免费     |
| Basic      | 300    | 10,000  | $29/月   |
| Pro        | 1,000  | 100,000 | $99/月   |
| Enterprise | 自定义 | 自定义  | 联系我们 |

**响应头**:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

**超出限制**:

```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later."
  }
}
```

---

## ⚠️ 错误处理

### 常见错误码

| HTTP 码 | 错误码              | 说明         |
| ------- | ------------------- | ------------ |
| 400     | INVALID_PARAMETERS  | 请求参数错误 |
| 401     | UNAUTHORIZED        | API Key 无效 |
| 404     | BATCH_NOT_FOUND     | 批次不存在   |
| 429     | RATE_LIMIT_EXCEEDED | 超出速率限制 |
| 500     | INTERNAL_ERROR      | 服务器错误   |

### 错误响应格式

```json
{
  "status": "error",
  "error": {
    "code": "BATCH_NOT_FOUND",
    "message": "Batch code 'INVALID123' not found",
    "details": {
      "batch_code": "INVALID123"
    }
  },
  "timestamp": "2026-01-01T18:15:15Z"
}
```

---

## 🛠️ 开发工具

### Swagger UI

查看交互式 API 文档:

```
https://s2y-batches.javenisme.workers.dev/docs
```

### ReDoc

查看美化的 API 文档:

```
https://s2y-batches.javenisme.workers.dev/redoc
```

### Postman

导入 Collection 开始测试:

```
docs/S2Y_Batches_API.postman_collection.json
```

### SDK 生成

使用 OpenAPI 规范生成客户端:

```bash
openapi-generator generate -i docs/openapi.yaml -g python -o ./sdk
```

---

## 📞 获取帮助

### 文档和资源

- 📚 完整文档: https://docs.s2y-batches.com
- 🔧 API 状态: https://status.s2y-batches.com
- 📖 更新日志: https://s2y-batches.com/changelog

### 技术支持

- 📧 Email: support@s2y-batches.com
- 💬 Discord: https://discord.gg/s2y-batches
- 🐛 问题反馈: https://github.com/s2y-batches/api/issues

### 社区

- 💡 论坛: https://community.s2y-batches.com
- 🎓 教程: https://tutorials.s2y-batches.com
- 📺 视频: https://youtube.com/@s2y-batches

---

## 🎯 下一步

1. **新手**: 阅读 [集成指南](./INTEGRATION_GUIDE.md) 的"快速开始"部分
2. **开发中**: 查看 [API 快速参考](./API_QUICK_REFERENCE_CN.md) 快速查找 API
3. **深入了解**: 阅读 [API 完整文档](./API_DOCUMENTATION.md) 了解所有细节
4. **测试 API**: 导入 [Postman Collection](./S2Y_Batches_API.postman_collection.json) 开始测试
5. **生成 SDK**: 使用 [OpenAPI 规范](./openapi.yaml) 生成客户端代码

---

## 📝 许可证

本 API 服务受服务条款约束。详情请访问: https://s2y-batches.com/terms

---

**版本**: v1.0.0  
**最后更新**: 2026-01-01  
**维护者**: S2Y Batches Team
