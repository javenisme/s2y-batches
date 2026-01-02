# 快速部署模拟 API

## 概述

我已经为你创建了一个 Cloudflare Worker 模拟 API,它实现了所有文档中描述的端点。

## 文件说明

- `api-worker.js` - Cloudflare Worker 代码,实现所有 API 端点
- `wrangler-api.jsonc` - Worker 配置文件

## 部署步骤

### 方法 1: 使用 Wrangler CLI (推荐)

```bash
# 1. 确保已安装 wrangler
npm install -g wrangler

# 2. 登录 Cloudflare (如果还没登录)
wrangler login

# 3. 部署 API Worker
wrangler deploy --config wrangler-api.jsonc

# 部署成功后,你会得到一个 URL,类似:
# https://s2y-batches-api.javenisme.workers.dev
```

### 方法 2: 通过 Cloudflare Dashboard

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages
3. 点击 "Create Application" → "Create Worker"
4. 将 `api-worker.js` 的内容复制粘贴到编辑器
5. 点击 "Save and Deploy"

## 测试 API

部署成功后,测试以下端点:

### 1. 健康检查

```bash
curl https://s2y-batches-api.javenisme.workers.dev/health
```

预期响应:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "project": "LCRAS API"
}
```

### 2. 获取批次详情

```bash
curl -H "Authorization: Bearer test_key" \
  https://s2y-batches-api.javenisme.workers.dev/api/v1/batch/EN6201
```

### 3. 搜索批次

```bash
curl -H "Authorization: Bearer test_key" \
  "https://s2y-batches-api.javenisme.workers.dev/api/v1/batch/search?manufacturer=Pfizer&limit=10"
```

### 4. 风险评估

```bash
curl -X POST \
  -H "Authorization: Bearer test_key" \
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
  https://s2y-batches-api.javenisme.workers.dev/api/v1/risk/assess
```

## 更新文档 URL

部署成功后,如果 API URL 与当前文档不同,需要更新:

```bash
# 假设新的 API URL 是 https://s2y-batches-api.javenisme.workers.dev
sed -i '' 's|https://s2y-batches.javenisme.workers.dev|https://s2y-batches-api.javenisme.workers.dev|g' \
  docs/API_DOCUMENTATION.md \
  docs/API_QUICK_REFERENCE_CN.md \
  docs/API_README.md \
  docs/openapi.yaml \
  docs/S2Y_Batches_API.postman_collection.json \
  docs/INTEGRATION_GUIDE.md \
  README.md
```

## 功能说明

### 已实现的端点

✅ `GET /health` - 健康检查
✅ `GET /` - API 信息
✅ `GET /api/v1/batch/{batch_code}` - 获取批次详情
✅ `GET /api/v1/batch/search` - 搜索批次
✅ `GET /api/v1/batch/{batch_code}/top-symptoms` - 获取热门症状
✅ `POST /api/v1/risk/assess` - 个性化风险评估
✅ `GET /api/v1/risk/batch/{batch_code}` - 批次风险统计

### 特性

- ✅ CORS 支持 (允许跨域请求)
- ✅ API Key 验证 (Bearer Token)
- ✅ 错误处理
- ✅ 模拟数据生成
- ✅ 符合 API 文档规范

### 限制

- ⚠️ 使用模拟数据,不连接真实数据库
- ⚠️ API Key 验证是简化版 (任何 Bearer Token 都可以)
- ⚠️ 没有速率限制
- ⚠️ 数据不持久化

## 下一步

### 短期 (演示用)

- [x] 部署模拟 API
- [ ] 测试所有端点
- [ ] 更新 Postman Collection 测试

### 长期 (生产环境)

- [ ] 连接真实数据库 (D1 或外部数据库)
- [ ] 实现真实的 API Key 验证
- [ ] 添加速率限制
- [ ] 部署 FastAPI 后端
- [ ] 添加日志和监控

## 故障排查

### 部署失败

```bash
# 检查 wrangler 版本
wrangler --version

# 重新登录
wrangler logout
wrangler login

# 查看详细错误
wrangler deploy --config wrangler-api.jsonc --verbose
```

### API 返回 404

- 检查 URL 路径是否正确
- 确认 Worker 已成功部署
- 查看 Cloudflare Dashboard 的 Worker 日志

### CORS 错误

- 模拟 API 已经包含 CORS 头
- 如果还有问题,检查浏览器控制台的具体错误

## 需要帮助?

如果遇到问题,请提供:

1. 部署时的错误信息
2. Worker 日志 (在 Cloudflare Dashboard 查看)
3. 测试请求的完整 curl 命令和响应
