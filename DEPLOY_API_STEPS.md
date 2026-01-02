# 部署 RESTful API Worker - 详细步骤

## 📋 准备工作

### 1. 登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器,让你登录 Cloudflare 账号并授权 Wrangler。

---

## 🚀 部署步骤

### 方法 1: 使用命令行部署 (推荐)

#### 步骤 1: 登录 Cloudflare

```bash
cd /Users/javen/workspace/s2y-batches
wrangler login
```

#### 步骤 2: 部署 API Worker

```bash
wrangler deploy --config wrangler-api.jsonc
```

部署成功后,你会看到类似输出:

```
Total Upload: XX.XX KiB / gzip: XX.XX KiB
Uploaded s2y-batches-api (X.XX sec)
Published s2y-batches-api (X.XX sec)
  https://s2y-batches-api.javenisme.workers.dev
Current Deployment ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

#### 步骤 3: 测试 API

```bash
# 测试健康检查
curl https://s2y-batches-api.javenisme.workers.dev/health

# 测试批次查询
curl -H "Authorization: Bearer test_key" \
  https://s2y-batches-api.javenisme.workers.dev/api/v1/batch/EN6201
```

---

### 方法 2: 通过 Cloudflare Dashboard 部署

如果命令行部署遇到问题,可以手动部署:

#### 步骤 1: 登录 Cloudflare Dashboard

访问: https://dash.cloudflare.com/

#### 步骤 2: 创建 Worker

1. 点击左侧菜单 "Workers & Pages"
2. 点击 "Create Application"
3. 选择 "Create Worker"
4. 输入名称: `s2y-batches-api`
5. 点击 "Deploy"

#### 步骤 3: 编辑 Worker 代码

1. 点击 "Edit Code"
2. 删除默认代码
3. 复制 `api-worker.js` 的全部内容
4. 粘贴到编辑器
5. 点击 "Save and Deploy"

#### 步骤 4: 测试

在右侧的预览窗口测试,或使用 URL:

```
https://s2y-batches-api.javenisme.workers.dev
```

---

## 🧪 测试部署

### 测试脚本

创建一个测试脚本 `test-api.sh`:

```bash
#!/bin/bash

API_URL="https://s2y-batches-api.javenisme.workers.dev"

echo "=== 测试 1: 健康检查 ==="
curl -s "$API_URL/health" | jq '.'

echo -e "\n=== 测试 2: 根路径 ==="
curl -s "$API_URL/" | jq '.'

echo -e "\n=== 测试 3: 获取批次详情 ==="
curl -s -H "Authorization: Bearer test_key" \
  "$API_URL/api/v1/batch/EN6201" | jq '.'

echo -e "\n=== 测试 4: 搜索批次 ==="
curl -s -H "Authorization: Bearer test_key" \
  "$API_URL/api/v1/batch/search?manufacturer=Pfizer&limit=3" | jq '.'

echo -e "\n=== 测试 5: 获取症状 ==="
curl -s -H "Authorization: Bearer test_key" \
  "$API_URL/api/v1/batch/EN6201/top-symptoms?limit=5" | jq '.'

echo -e "\n=== 测试 6: 风险评估 ==="
curl -s -X POST \
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
  "$API_URL/api/v1/risk/assess" | jq '.'

echo -e "\n=== 测试 7: 无认证请求 (应返回 401) ==="
curl -s "$API_URL/api/v1/batch/EN6201" | jq '.'

echo -e "\n✅ 所有测试完成!"
```

运行测试:

```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 📝 部署后更新文档

如果 API URL 与文档中的不同,需要更新:

```bash
# 假设新的 API URL 是 https://s2y-batches-api.javenisme.workers.dev
# 当前文档中的 URL 是 https://s2y-batches.javenisme.workers.dev

# 更新所有文档
sed -i '' 's|https://s2y-batches\.javenisme\.workers\.dev|https://s2y-batches-api.javenisme.workers.dev|g' \
  docs/API_DOCUMENTATION.md \
  docs/API_QUICK_REFERENCE_CN.md \
  docs/API_README.md \
  docs/openapi.yaml \
  docs/S2Y_Batches_API.postman_collection.json \
  docs/INTEGRATION_GUIDE.md \
  README.md

echo "✅ 文档已更新"
```

---

## 🔧 常见问题

### 问题 1: 登录失败

**症状**: `wrangler login` 无法打开浏览器

**解决**:

```bash
# 手动登录
wrangler login --browser=false

# 然后在浏览器中访问显示的 URL
```

### 问题 2: 部署失败 - 权限错误

**症状**: `Error: You do not have permission to deploy to this account`

**解决**:

1. 确认已登录正确的 Cloudflare 账号
2. 检查账号是否有 Workers 权限
3. 尝试重新登录: `wrangler logout && wrangler login`

### 问题 3: Worker 名称冲突

**症状**: `Error: A worker with this name already exists`

**解决**:
修改 `wrangler-api.jsonc` 中的 `name`:

```json
{
  "name": "s2y-batches-api-v2",  // 改成不同的名称
  ...
}
```

### 问题 4: 部署后 404

**症状**: 访问 Worker URL 返回 404

**解决**:

1. 确认部署成功
2. 等待几秒钟让 DNS 传播
3. 检查 Worker 日志: 在 Cloudflare Dashboard → Workers → 你的 Worker → Logs

### 问题 5: CORS 错误

**症状**: 前端调用 API 时出现 CORS 错误

**解决**:
`api-worker.js` 已经包含 CORS 头,如果还有问题:

1. 检查浏览器控制台的具体错误
2. 确认请求方法是否正确
3. 检查是否有 OPTIONS 预检请求

---

## 📊 监控和日志

### 查看 Worker 日志

#### 方法 1: 实时日志 (命令行)

```bash
wrangler tail s2y-batches-api
```

#### 方法 2: Dashboard

1. 登录 Cloudflare Dashboard
2. Workers & Pages → s2y-batches-api
3. 点击 "Logs" 标签

### 查看使用统计

1. Cloudflare Dashboard
2. Workers & Pages → s2y-batches-api
3. 点击 "Metrics" 标签

---

## 🔄 更新 Worker

如果需要修改 API 代码:

```bash
# 1. 编辑 api-worker.js
nano api-worker.js

# 2. 重新部署
wrangler deploy --config wrangler-api.jsonc

# 3. 测试
curl https://s2y-batches-api.javenisme.workers.dev/health
```

---

## 💰 费用说明

### Cloudflare Workers 免费额度

- ✅ 每天 100,000 次请求
- ✅ 最多 30 个 Workers
- ✅ 10ms CPU 时间/请求

### 超出免费额度

- 付费计划: $5/月
- 包含 10,000,000 次请求/月
- 额外请求: $0.50/百万次

对于测试和小规模使用,免费额度完全足够!

---

## 🎯 部署成功标志

部署成功后,你应该能:

1. ✅ 访问健康检查端点

   ```bash
   curl https://s2y-batches-api.javenisme.workers.dev/health
   # 返回: {"status":"ok","version":"1.0.0","project":"LCRAS API"}
   ```

2. ✅ 使用 API Key 访问受保护端点

   ```bash
   curl -H "Authorization: Bearer test_key" \
     https://s2y-batches-api.javenisme.workers.dev/api/v1/batch/EN6201
   # 返回: 批次详情 JSON
   ```

3. ✅ 无 API Key 访问受保护端点返回 401
   ```bash
   curl https://s2y-batches-api.javenisme.workers.dev/api/v1/batch/EN6201
   # 返回: {"status":"error","error":{"code":"UNAUTHORIZED",...}}
   ```

---

## 📚 下一步

部署成功后:

1. **测试所有端点** - 使用 Postman Collection
2. **更新文档 URL** - 如果 API URL 不同
3. **集成到应用** - 参考 `INTEGRATION_GUIDE.md`
4. **监控使用情况** - 在 Cloudflare Dashboard 查看

---

## 🆘 需要帮助?

如果遇到问题:

1. 查看 Worker 日志: `wrangler tail s2y-batches-api`
2. 检查部署状态: `wrangler deployments list`
3. 查看完整错误信息
4. 提供错误信息以便我帮助你解决

---

**准备好了吗? 让我们开始部署!** 🚀

首先运行:

```bash
wrangler login
```
