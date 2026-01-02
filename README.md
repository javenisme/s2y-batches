# S2Y Batches - 疫苗批次风险评估 SAAS 平台

## 项目简介

S2Y Batches 是一个为其他应用提供疫苗批次数据和风险分析服务的 SAAS 平台。基于公开的不良事件报告数据,为开发者提供强大的 API 接口,支持批次查询、风险评估、症状统计等功能。

## 核心功能

- 🔍 **批次信息查询**: 获取疫苗批次的详细信息和统计数据
- 📊 **批次搜索**: 根据制造商、风险分数等条件搜索批次
- 🎯 **个性化风险评估**: 基于用户年龄、性别、既往疾病等因素的个性化风险分析
- 💊 **症状统计**: 获取批次的热门不良反应症状
- 📈 **数据分析**: 提供对比统计和趋势分析

## API 文档

完整的 API 文档位于 `docs/` 目录:

### 📚 快速导航

- **[API 文档总览](./docs/API_README.md)** - 开始这里!
- **[数据 API 访问指南](./docs/DATA_API_GUIDE.md)** - ✨ 直接访问 JSON 数据 (无需认证)
- **[完整 API 文档](./docs/API_DOCUMENTATION.md)** - 详细的 API 规范
- **[快速参考](./docs/API_QUICK_REFERENCE_CN.md)** - 速查手册
- **[集成指南](./docs/INTEGRATION_GUIDE.md)** - 集成教程和示例
- **[OpenAPI 规范](./docs/openapi.yaml)** - 机器可读的 API 规范
- **[Postman Collection](./docs/S2Y_Batches_API.postman_collection.json)** - API 测试集合

### ✅ 数据已可用!

你的应用已部署,可以直接通过 HTTP 访问数据:

```bash
# 获取邮编风险数据
curl https://s2y-batches.javenisme.workers.dev/data/zipcodeRiskMap/ZipcodeRiskSummary.json

# 获取批次描述数据
curl https://s2y-batches.javenisme.workers.dev/data/barChartDescriptionTable.json
```

详见 [数据 API 访问指南](./docs/DATA_API_GUIDE.md)

### 🚀 快速开始

```bash
# 测试 API 连接
curl https://s2y-batches.javenisme.workers.dev/health

# 获取批次信息 (需要 API Key)
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://s2y-batches.javenisme.workers.dev/api/v1/batch/EN6201
```

### 📖 示例代码

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

## 项目结构

```
s2y-batches/
├── backend/          # FastAPI 后端服务
│   ├── app/
│   │   ├── api/      # API 路由
│   │   ├── models/   # 数据模型
│   │   └── schemas/  # Pydantic 模式
├── frontend/         # 前端应用
├── docs/            # API 文档
│   ├── API_README.md
│   ├── API_DOCUMENTATION.md
│   ├── API_QUICK_REFERENCE_CN.md
│   ├── INTEGRATION_GUIDE.md
│   ├── openapi.yaml
│   └── S2Y_Batches_API.postman_collection.json
└── src/             # 数据处理脚本
```

## 技术栈

- **后端**: FastAPI, SQLAlchemy, PostgreSQL
- **前端**: React, TypeScript
- **数据处理**: Python, Pandas
- **部署**: Cloudflare Workers, Docker

## 本地开发

### 后端服务

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

访问 API 文档: http://localhost:8000/docs

### 前端应用

```bash
cd frontend
npm install
npm run dev
```

## 获取 API Key

1. 访问 https://s2y-batches.com
2. 注册账号
3. 在控制台生成 API Key

## 支持和联系

- 📧 Email: support@s2y-batches.com
- 💬 Discord: https://discord.gg/s2y-batches
- 📚 文档: https://docs.s2y-batches.com
- 🐛 问题反馈: https://github.com/s2y-batches/api/issues

## 许可证

本项目受专有许可证约束。详情请访问: https://s2y-batches.com/terms

---

**版本**: v1.0.0  
**维护者**: S2Y Batches Team
