# 疫苗接种风险评估框架 - 完整实施规划

**项目**: S2Y Batches  
**版本**: v1.0  
**状态**: 等待确认后执行  
**Date**: 2026-03-09

---

## 一、架构设计

### 1.1 整体架构 (微服务原则)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           API Gateway (FastAPI)                         │
│                         s2y-batches.javenisme.workers.dev              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Batch Risk  │  │  Region     │  │  Symptom    │  │  Composite  │ │
│  │ Service     │  │  Risk Svc   │  │  Risk Svc   │  │  Risk Svc   │ │
│  │             │  │             │  │             │  │             │ │
│  │ /risk/batch │  │ /risk/reg   │  │ /risk/sympt │  │ /risk/comp  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
│         │                 │                 │                 │        │
│         └─────────────────┴────────┬────────┴─────────────────┘        │
│                                     │                                   │
│  ┌──────────────────────────────────┼───────────────────────────────┐  │
│  │                    Data Layer (Shared)                           │  │
│  ├──────────────┬──────────────┬──────────────┬───────────────────┤  │
│  │ VAERS Data   │ Zipcode Data │ Symptom Data │ User Profile Data │  │
│  │ (PostgreSQL) │ (JSON/CSV)   │ (PostgreSQL) │ (Redis Cache)     │  │
│  └──────────────┴──────────────┴──────────────┴───────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 服务职责

| 服务 | 职责 | 数据依赖 |
|------|------|----------|
| Batch Risk Service | 批次风险分析、趋势、同比 | VAERS Batch |
| Region Risk Service | 地区风险、热力图 | Zipcode + Census |
| Symptom Risk Service | 症状分析、严重度、关联 | VAERS Symptoms |
| Composite Risk Service | 综合评估、个性化推荐 | All Services |

---

## 二、场景实现详情

### 场景 1: 批次风险评估 (Batch Risk)

**API 端点:**

```python
# 现有 (保持兼容)
GET  /api/v1/risk/batch/{batch_code}          # 批次风险统计
POST /api/v1/risk/assess                      # 个性化评估

# 新增
GET  /api/v2/risk/batch/{code}/trend         # 趋势分析
GET  /api/v2/risk/batch/{code}/compare       # 横向对比
GET  /api/v2/risk/batch/{code}/confidence    # 置信区间
GET  /api/v2/risk/batch/{code}/symptoms      # 批次关联症状
```

**响应示例 - Trend:**
```json
{
  "batch_code": "EN6201",
  "trend_direction": "decreasing",
  "reports_over_time": [
    {"month": "2024-01", "count": 45},
    {"month": "2024-02", "count": 38},
    {"month": "2024-03", "count": 22}
  ],
  "anomaly_detected": false,
  "confidence_interval": [6.2, 8.1],
  "percentile": 72
}
```

**响应示例 - Compare:**
```json
{
  "batch_code": "EN6201",
  "comparison_type": "same_manufacturer",
  "compared_to": "Pfizer-BioNTech",
  "statistics": {
    "your_batch": 7.2,
    "manufacturer_avg": 5.8,
    "global_avg": 4.2
  },
  "statistical_significance": "p<0.05",
  "recommendation": "This batch shows higher risk than manufacturer average"
}
```

---

### 场景 2: 地区风险评估 (Region Risk)

**API 端点:**

```python
GET  /api/v2/risk/regional/zipcode/{zipcode}     # 邮编风险
GET  /api/v2/risk/regional/state/{state}        # 州级风险
GET  /api/v2/risk/regional/heatmap              # 全国热力图
GET  /api/v2/risk/regional/batch-dist/{zipcode} # 地区批次分布
POST /api/v2/risk/regional/assess               # 地区综合评估
```

**响应示例 - Zipcode:**
```json
{
  "zipcode": "10001",
  "city": "New York",
  "state": "NY",
  "region_risk_score": 5.8,
  "risk_level": "Medium",
  "statistics": {
    "total_doses": 125000,
    "total_adverse_events": 342,
    "adverse_events_per_100k": 273.6,
    "num_batches": 156,
    "num_providers": 23
  },
  "top_batches": [
    {"code": "EN6201", "risk_score": 7.2, "reports": 45},
    {"code": "EW0182", "risk_score": 6.8, "reports": 38}
  ],
  "healthcare_access_score": 8.5,
  "population_health_index": 7.2
}
```

**热力图数据结构:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "zipcode": "10001",
        "risk_score": 5.8,
        "risk_level": "Medium"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-73.9857, 40.7484]
      }
    }
  ]
}
```

---

### 场景 3: 症状风险评估 (Symptom Risk)

**核心任务: 从 VAERS 原始数据提取结构化症状分类**

**症状严重度矩阵 (需要构建):**

| 严重度等级 | 名称 | 描述 | 示例 |
|------------|------|------|------|
| 1 | Minor | 轻微，无需医疗介入 | 注射部位疼痛、疲劳 |
| 2 | Moderate | 中度，可能需要医疗介入 | 头痛、肌肉痛、发热 |
| 3 | Serious | 严重，需要医疗处理 | 过敏反应、心悸 |
| 4 | Severe | 危重，住院治疗 | 心肌炎、血栓 |
| 5 | Life-threatening | 危及生命 | 死亡、呼吸衰竭 |

**症状→结局链:**
```
症状 → 就医 → 住院 → ICU → 残疾 → 死亡
  ↓
每步转化概率
```

**API 端点:**

```python
POST /api/v2/risk/symptom/assess              # 症状风险评估
GET  /api/v2/risk/symptom/{symptom}           # 症状详情
GET  /api/v2/risk/symptom/network             # 症状共现网络
GET  /api/v2/risk/symptom/severity/{symptom}  # 症状严重度
GET  /api/v2/risk/symptom/combinations        # 风险症状组合
```

**响应示例 - Symptom Assess:**
```json
{
  "symptoms": ["Chest pain", "Shortness of breath"],
  "assessment": {
    "combined_risk_score": 7.8,
    "risk_level": "High",
    "recommended_actions": [
      "Seek immediate medical attention",
      "Report to VAERS",
      "Contact healthcare provider"
    ],
    "possible_outcomes": [
      {
        "outcome": "Myocarditis",
        "probability": 0.12,
        "severity": 4
      },
      {
        "outcome": "Pulmonary embolism",
        "probability": 0.08,
        "severity": 5
      }
    ],
    "onset_timeline": {
      "median_days": 3,
      "range_days": "1-14"
    },
    "duration": {
      "median_days": 7,
      "range_days": "3-30"
    }
  }
}
```

**响应示例 - Symptom Network:**
```json
{
  "nodes": [
    {"id": "Headache", "severity": 2, "frequency": 12500},
    {"id": "Fatigue", "severity": 2, "frequency": 10200},
    {"id": "Fever", "severity": 2, "frequency": 9800}
  ],
  "edges": [
    {"source": "Headache", "target": "Fatigue", "co_occurrence": 4500},
    {"source": "Headache", "target": "Fever", "co_occurrence": 3200}
  ],
  "clusters": [
    {"name": "Common", "symptoms": ["Headache", "Fatigue", "Fever"]},
    {"name": "Cardiovascular", "symptoms": ["Chest pain", "Palpitations"]}
  ]
}
```

---

## 三、数据模型扩展

### 3.1 数据库 Schema (PostgreSQL)

```sql
-- 批次风险表 (扩展)
CREATE TABLE batch_risk (
    id SERIAL PRIMARY KEY,
    batch_code VARCHAR(50) UNIQUE NOT NULL,
    manufacturer VARCHAR(100),
    vaccine_type VARCHAR(50),
    
    -- 基础统计
    total_reports INTEGER DEFAULT 0,
    severe_reports INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    disabilities INTEGER DEFAULT 0,
    hospitalizations INTEGER DEFAULT 0,
    
    -- 风险评分
    base_risk_score FLOAT,
    risk_level VARCHAR(20),
    
    -- 趋势分析
    trend_direction VARCHAR(20),  -- increasing/decreasing/stable
    confidence_lower FLOAT,
    confidence_upper FLOAT,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 地区风险表
CREATE TABLE region_risk (
    id SERIAL PRIMARY KEY,
    zipcode VARCHAR(10) UNIQUE NOT NULL,
    city VARCHAR(100),
    state VARCHAR(2),
    
    -- 统计数据
    total_doses INTEGER,
    total_adverse_events INTEGER,
    adverse_events_per_100k FLOAT,
    num_batches INTEGER,
    num_providers INTEGER,
    
    -- 风险评分
    region_risk_score FLOAT,
    risk_level VARCHAR(20),
    
    -- 辅助因子
    healthcare_access_score FLOAT,
    population_health_index FLOAT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- 症状风险表 (新建)
CREATE TABLE symptom_risk (
    id SERIAL PRIMARY KEY,
    symptom_name VARCHAR(200) UNIQUE NOT NULL,
    
    -- 严重度
    severity_level INTEGER,  -- 1-5
    severity_description TEXT,
    
    -- 统计
    total_reports INTEGER,
    hospitalization_count INTEGER,
    death_count INTEGER,
    
    -- 概率
    hospitalization_prob FLOAT,
    mortality_prob FLOAT,
    
    -- 时间特征
    onset_days_median INTEGER,
    duration_days_median INTEGER,
    
    -- 分类
    body_system VARCHAR(50),
    category VARCHAR(50),  -- common/serious/life_threatening
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- 症状组合表
CREATE TABLE symptom_combinations (
    id SERIAL PRIMARY KEY,
    symptom_list TEXT[],  -- ARRAY['Symptom1', 'Symptom2']
    
    combined_risk_score FLOAT,
    risk_level VARCHAR(20),
    
    sample_size INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- 症状共现表 (图数据)
CREATE TABLE symptom_cooccurrence (
    id SERIAL PRIMARY KEY,
    symptom_a VARCHAR(200),
    symptom_b VARCHAR(200),
    co_occurrence_count INTEGER,
    correlation FLOAT,
    
    UNIQUE(symptom_a, symptom_b)
);
```

---

## 四、Skills 整合使用

### 4.1 数据提取 - medical-entity-extractor

```python
# 从 VAERS 原始文本提取症状实体
# 输入: VAERS 原始报告文本
# 输出: 结构化症状列表 + 严重度标注
```

### 4.2 数据分析 - data-analyst

```python
# 统计分析
# - 批次风险分布
# - 地区风险统计
# - 症状频率分析
# - 置信区间计算
```

### 4.3 异常检测 - data-anomaly-detector

```python
# 检测:
# - 异常高风险批次
# - 异常地区聚集
# - 异常症状模式
```

### 4.4 可视化 - data-visualization-2

```python
# 生成:
# - 风险热力图 (GeoJSON)
# - 趋势折线图
# - 症状网络图
# - 风险仪表盘
```

---

## 五、实施路线图

### Phase 1: 基础架构 + 症状数据提取 (Week 1-2)

| 任务 | 描述 | 依赖 |
|------|------|------|
| 1.1 | 创建 symptom_risk 数据库表 | - |
| 1.2 | 编写 VAERS 症状提取脚本 | medical-entity-extractor |
| 1.3 | 构建症状严重度矩阵 | 1.2 |
| 1.4 | 症状数据导入 | 1.3 |
| 1.5 | 症状 API 基础端点 | 1.4 |

**里程碑:** 症状查询 API 上线

### Phase 2: 批次风险增强 (Week 3-4)

| 任务 | 描述 | 依赖 |
|------|------|------|
| 2.1 | 批次趋势分析模块 | - |
| 2.2 | 批次对比模块 | - |
| 2.3 | 置信区间计算 | data-analyst |
| 2.4 | 异常批次检测 | data-anomaly-detector |
| 2.5 | Batch Risk API v2 | 2.1-2.4 |

**里程碑:** 批次趋势和对比 API 上线

### Phase 3: 地区风险 (Week 5-6)

| 任务 | 描述 | 依赖 |
|------|------|------|
| 3.1 | 地区数据整合 (Zipcode + Census) | - |
| 3.2 | Region Risk 模型 | - |
| 3.3 | 热力图生成 | data-visualization-2 |
| 3.4 | Region Risk API | 3.1-3.3 |

**里程碑:** 地区热力图 API 上线

### Phase 4: 综合评估 (Week 7-8)

| 任务 | 描述 | 依赖 |
|------|------|------|
| 4.1 | Composite Risk Service 设计 | - |
| 4.2 | 个性化推荐算法 | Phase 1-3 |
| 4.3 | 综合评估 API | 4.1-4.2 |
| 4.4 | 端到端测试 | All |

**里程碑:** 综合风险评估 API 上线

---

## 六、部署架构

### 6.1 开发/测试环境

```
docker-compose.yml
├── api-gateway (FastAPI)
├── batch-risk-service
├── region-risk-service
├── symptom-risk-service
├── composite-risk-service
├── postgres (data)
└── redis (cache)
```

### 6.2 生产环境 (Cloudflare Workers + D1)

```
API Gateway → Workers (API Routes)
                ↓
            D1 Database (SQLite on Cloudflare)
                ↓
            R2 Storage (Static Data)
```

---

## 七、API 完整列表

### v2 API Endpoints

```yaml
# Batch Risk
GET    /api/v2/risk/batch/{code}
GET    /api/v2/risk/batch/{code}/trend
GET    /api/v2/risk/batch/{code}/compare
GET    /api/v2/risk/batch/{code}/confidence
GET    /api/v2/risk/batch/{code}/symptoms

# Region Risk
GET    /api/v2/risk/regional/zipcode/{zipcode}
GET    /api/v2/risk/regional/state/{state}
GET    /api/v2/risk/regional/heatmap
GET    /api/v2/risk/regional/batch-dist/{zipcode}
POST   /api/v2/risk/regional/assess

# Symptom Risk
POST   /api/v2/risk/symptom/assess
GET    /api/v2/risk/symptom/{symptom}
GET    /api/v2/risk/symptom/network
GET    /api/v2/risk/symptom/severity/{symptom}
GET    /api/v2/risk/symptom/combinations

# Composite Risk
POST   /api/v2/risk/composite
GET    /api/v2/risk/recommendations
```

---

## 八、验收标准

### 功能验收

- [ ] 症状 API 响应时间 < 500ms
- [ ] 批次趋势分析准确率 > 85%
- [ ] 地区热力图覆盖率 > 90% US zipcodes
- [ ] 综合评估包含所有三个维度

### 质量验收

- [ ] 单元测试覆盖率 > 70%
- [ ] API 文档完整 (OpenAPI)
- [ ] 错误处理完善
- [ ] 日志记录完整

### 合规验收

- [ ] 医疗免责声明
- [ ] 数据隐私处理
- [ ] HIPAA 合规检查

---

## 九、下一步行动

**等待 Javen 确认后开始执行:**

1. ⏳ 创建数据库表 (Phase 1.1)
2. ⏳ 编写症状提取脚本 (Phase 1.2)
3. ⏳ 症状严重度矩阵构建 (Phase 1.3)

**预计上线时间:** 8 周 (完成后通知)

---

*文档状态: 已完成规划，等待执行确认*
