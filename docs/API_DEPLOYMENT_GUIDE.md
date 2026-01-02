# API 部署说明

## 当前状态

### 已部署的内容

- **URL**: https://s2y-batches.javenisme.workers.dev/
- **内容**: 静态 HTML 数据可视化页面 (docs 目录)
- **功能**: 批次数据展示、风险地图等前端页面

### 未部署的内容

- **FastAPI 后端**: backend/ 目录下的 API 服务
- **API 端点**: 目前 API 文档中描述的端点尚未部署

## 解决方案

你有两种选择来提供 API 服务:

### 方案 1: 部署 FastAPI 到 Cloudflare Workers (推荐)

使用 Cloudflare Workers Python 支持部署 FastAPI。

#### 步骤:

1. **安装 Python Workers 支持**:

```bash
npm install -g @cloudflare/wrangler
```

2. **创建新的 Worker 配置** (`wrangler-api.toml`):

```toml
name = "s2y-batches-api"
main = "backend/app/main.py"
compatibility_date = "2025-12-14"

[vars]
ENVIRONMENT = "production"

# 如果需要数据库
[[d1_databases]]
binding = "DB"
database_name = "s2y-batches-db"
database_id = "your-database-id"
```

3. **部署 API**:

```bash
wrangler deploy --config wrangler-api.toml
```

4. **结果**:

- API URL: `https://s2y-batches-api.javenisme.workers.dev`
- 前端 URL: `https://s2y-batches.javenisme.workers.dev` (保持不变)

#### 优点:

- ✅ 完全在 Cloudflare 上,低延迟
- ✅ 自动扩展
- ✅ 免费额度充足
- ✅ 前后端分离

#### 缺点:

- ⚠️ Cloudflare Workers Python 支持还在 Beta
- ⚠️ 需要适配 Workers 环境

---

### 方案 2: 使用当前静态部署 + 本地/其他服务器运行 API

保持当前的静态部署,API 部署到其他地方。

#### 选项 A: 本地开发环境

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

- API URL: `http://localhost:8000`
- 仅用于开发测试

#### 选项 B: 部署到传统服务器

使用 Heroku、Railway、Render 等平台:

**Heroku 示例**:

```bash
# 创建 Procfile
echo "web: uvicorn backend.app.main:app --host 0.0.0.0 --port \$PORT" > Procfile

# 部署
heroku create s2y-batches-api
git push heroku main
```

#### 选项 C: 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
cd backend
vercel
```

#### 优点:

- ✅ 使用成熟的 Python 环境
- ✅ 完整的 FastAPI 功能
- ✅ 易于调试

#### 缺点:

- ⚠️ 需要额外的服务器
- ⚠️ 可能有额外费用
- ⚠️ 跨域配置

---

## 方案 3: 临时方案 - 使用模拟数据

如果只是为了展示 API 文档,可以创建一个简单的 Cloudflare Worker 返回模拟数据。

### 创建 `api-worker.js`:

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS 头
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Content-Type": "application/json",
    };

    // 处理 OPTIONS 请求
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 健康检查
    if (url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          version: "1.0.0",
          project: "LCRAS API",
        }),
        { headers: corsHeaders }
      );
    }

    // 获取批次详情
    if (url.pathname.match(/^\/api\/v1\/batch\/[A-Z0-9]+$/)) {
      const batchCode = url.pathname.split("/").pop();
      return new Response(
        JSON.stringify({
          batch_code: batchCode,
          manufacturer: "Pfizer",
          vaccine_type: "COVID-19",
          total_reports: 1523,
          deaths: 45,
          disabilities: 23,
          life_threatening: 67,
          hospitalizations: 234,
          severe_reports_pct: 24.36,
          lethality_pct: 2.95,
          risk_score: 7.2,
          risk_level: "High",
        }),
        { headers: corsHeaders }
      );
    }

    // 批次搜索
    if (url.pathname === "/api/v1/batch/search") {
      return new Response(
        JSON.stringify({
          batches: [
            {
              batch_code: "EN6201",
              manufacturer: "Pfizer",
              risk_score: 7.2,
              risk_level: "High",
            },
          ],
          total_count: 1,
          limit: 50,
          offset: 0,
        }),
        { headers: corsHeaders }
      );
    }

    // 风险评估
    if (url.pathname === "/api/v1/risk/assess" && request.method === "POST") {
      const body = await request.json();
      return new Response(
        JSON.stringify({
          batch_code: body.batch_code,
          manufacturer: "Pfizer",
          risk_score: 7.2,
          risk_level: "Medium",
          confidence: 0.85,
          risk_factors: [
            {
              factor: `Age ${body.user_profile.age}`,
              impact: "+1.0",
              description: "Age-related risk factor",
            },
          ],
          comparative_stats: {
            batch_avg_severity: 6.5,
            global_avg_severity: 4.2,
            percentile: 75,
          },
          timestamp: new Date().toISOString(),
        }),
        { headers: corsHeaders }
      );
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
```

### 部署模拟 API:

```bash
# 创建新的 worker
wrangler init s2y-batches-api

# 复制上面的代码到 src/index.js

# 部署
wrangler deploy
```

---

## 推荐方案

### 对于生产环境:

**方案 1 (Cloudflare Workers Python)** 或 **方案 2B (Vercel/Railway)**

### 对于演示/测试:

**方案 3 (模拟数据 Worker)** - 快速部署,无需数据库

### 对于开发:

**方案 2A (本地运行)** - 完整功能,易于调试

---

## 当前 API 文档状态

✅ 所有 API 文档已更新为使用你的域名:

- `https://s2y-batches.javenisme.workers.dev`

但是请注意:

- ⚠️ 当前这个 URL 只提供静态 HTML 页面
- ⚠️ API 端点 (如 `/api/v1/batch/EN6201`) 尚未实现

---

## 下一步建议

1. **决定部署方案**: 选择上述方案之一
2. **部署 API**: 根据选择的方案部署
3. **更新文档**: 如果 API URL 不同,更新文档中的 URL
4. **测试 API**: 使用 Postman Collection 测试所有端点

---

## 需要帮助?

我可以帮你:

1. 创建 Cloudflare Worker 模拟 API (方案 3)
2. 配置 FastAPI 部署到 Vercel/Railway
3. 创建本地开发环境配置

请告诉我你想选择哪个方案!
