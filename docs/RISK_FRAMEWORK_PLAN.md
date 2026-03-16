# 疫苗接种风险评估框架 - 深度研究规划

## 一、现有系统分析

### 1.1 已有能力 (Sprint 2)

**当前 API 端点：**
- `POST /api/v1/risk/assess` - 个性化风险评估
- `GET /api/v1/risk/batch/{batch_code}` - 批次风险统计
- `GET /api/v1/batch/{batch_code}` - 批次信息查询
- `GET /api/v1/batch/{batch_code}/top-symptoms` - 症状统计

**现有风险因素：**
- 年龄 (0-18, 18-50, 50-65, 65+)
- 已有疾病 (糖尿病、高血压、心脏病、COPD)
- 既往 COVID-19 感染
- 疫苗剂次

**现有数据源：**
- VAERS (VAERS Before Deletion)
- EudraVigilance (欧盟)
- 邮编坐标数据 (us-zip-coordinates.csv)
- 病理与药物关联 (1000-pathologies.xlsx)

### 1.2 已有 Skills

| Skill | 用途 |
|-------|------|
| medical-entity-extractor | 医学实体提取 |
| medical-document-processor | 医学文档处理 |
| medical-specialty-briefs | 医学简报 |
| medical-research-toolkit | 研究工具包 |
| biomedical-search | 生物医学搜索 |
| afrexai-risk-assessment | 通用风险评估 (L×I 矩阵) |
| risk-assessment | 信息安全风险评估 (NIST CSF) |
| data-analyst | 数据分析 |
| data-anomaly-detector | 异常检测 |
| data-visualization-2 | 数据可视化 |

---

## 二、需要扩展的场景

### 2.1 场景 A：针对某批次接种的风险评估

**当前能力：**
- ✅ 批次基本信息查询
- ✅ 基础风险分数 (lethality × 2 + severe × 0.5)
- ✅ 风险因素列表

**需要扩展：**
- [ ] 批次不良事件时间序列分析 (趋势检测)
- [ ] 同厂家同类型批次横向对比
- [ ] 批次报告数量置信区间
- [ ] 批次-症状关联网络分析

### 2.2 场景 B：某地区接种风险评估

**当前能力：**
- ⚠️ 部分邮编风险数据 (ZipcodeRiskMap)

**需要扩展：**
- [ ] 地区不良事件热力图
- [ ] 地区-批次交叉分析
- [ ] 人口统计因素加权
- [ ] 医疗资源可及性因子
- [ ] 地区季节性/流行病学因素

### 2.3 场景 C：接种后产生特定症状的风险评估

**当前能力：**
- ⚠️ 基础症状统计 (top-symptoms)

**需要扩展：**
- [ ] 症状严重度分层 (轻/中/重/危及生命)
- [ ] 症状持续时间预测
- [ ] 症状组合风险关联规则挖掘
- [ ] 症状→结局链分析 (症状 → 住院 → 残疾 → 死亡)
- [ ] 症状-药物交叉反应

---

## 三、框架设计

### 3.1 风险评分模型 (扩展)

```
Final_Risk = Base_Risk × User_Factor × Regional_Factor × Symptom_Factor
```

| 因子 | 数据来源 | 计算方式 |
|------|----------|----------|
| Base_Risk | 批次不良事件数据 | lethality×2 + severe×0.5 + 报告量归一化 |
| User_Factor | 年龄、性别、既往疾病 | 加权求和 |
| Regional_Factor | 邮编风险数据 | 地区风险指数 × 医疗资源因子 |
| Symptom_Factor | 症状严重度矩阵 | 症状组合风险评分 |

### 3.2 数据架构

```
┌─────────────────────────────────────────────────────────┐
│                    Risk Assessment API                   │
├─────────────────────────────────────────────────────────┤
│  /risk/batch/{code}    - 批次级风险                      │
│  /risk/regional       - 地区级风险                       │
│  /risk/symptom        - 症状级风险                       │
│  /risk/composite      - 综合风险评估                     │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Batch Service │  │ Region Service│  │Symptom Service│
├───────────────┤  ├───────────────┤  ├───────────────┤
│ VAERS Data    │  │ Zipcode Data  │  │ VAERS Symptoms│
│ EudraVigilance│  │ CDC Data      │  │ Pathology     │
│ Internal DB   │  │ Census Data   │  │ Drug Database │
└───────────────┘  └───────────────┘  └───────────────┘
```

### 3.3 评分矩阵

**风险等级划分：**

| 分数 | 等级 | 颜色 | 建议 |
|------|------|------|------|
| 0-3 | Low | 🟢 | 常规接种 |
| 4-6 | Medium | 🟡 | 咨询医生后接种 |
| 7-8 | High | 🟠 | 谨慎接种，密切观察 |
| 9-10 | Critical | 🔴 | 建议咨询专业医师 |

---

## 四、技术实现路径

### Phase 1: 批次风险增强

1. **时间序列分析**
   - 提取批次报告时间分布
   - 异常检测 (data skill)
   - 趋势预测-anomaly-detector

2. **批次对比**
   - 同厂家对比
   - 同类型疫苗对比
   - 统计显著性检验

### Phase 2: 地区风险层

1. **数据整合**
   - 邮编 → 地区映射
   - 人口统计数据接入
   - 医疗资源数据

2. **地区模型**
   - 地区风险指数 = Σ(批次风险 × 接种量) / 总接种量
   - 医疗资源可及性因子
   - 地区人口健康基线

### Phase 3: 症状风险层

1. **症状分析**
   - 严重度标注
   - 症状共现网络
   - 因果推断

2. **症状-风险映射**
   - 症状 → 结局概率
   - 干预建议生成

---

## 五、需要新增的 API 端点

### 5.1 批次级

```
GET  /api/v1/risk/batch/{code}/trend
GET  /api/v1/risk/batch/{code}/compare
GET  /api/v1/risk/batch/{code}/confidence
```

### 5.2 地区级

```
GET  /api/v1/risk/regional/zipcode/{zip}
GET  /api/v1/risk/regional/state/{state}
GET  /api/v1/risk/regional/heatmap
```

### 5.3 症状级

```
POST /api/v1/risk/symptom/assess
GET  /api/v1/risk/symptom/{symptom}/severity
GET  /api/v1/risk/symptom/network
```

### 5.4 综合评估

```
POST /api/v1/risk/composite
```

---

## 六、需要扩展的数据库模型

### Batch (扩展)

```python
class Batch:
    # 现有字段
    batch_code: str
    risk_score: float
    
    # 新增字段
    trend_direction: str        # increasing/decreasing/stable
    confidence_interval: tuple # (lower, upper)
    report_count: int
    severe_count: int
    death_count: int
    disability_count: int
```

### Region (新增)

```python
class RegionRisk:
    zipcode: str
    state: str
    region_risk_score: float
    batch_distribution: dict
    population_health_index: float
    healthcare_access_score: float
```

### Symptom (新增)

```python
class SymptomRisk:
    symptom_name: str
    severity_level: int        # 1-5
    hospitalization_prob: float
    mortality_prob: float
    common_combinations: list
    onset_days_median: int
    duration_days_median: int
```

---

## 七、Skills 整合方案

| 阶段 | 使用的 Skills | 用途 |
|------|---------------|------|
| 数据提取 | medical-entity-extractor | 从 VAERS 原始报告提取结构化数据 |
| 数据分析 | data-analyst | 统计分析和报告生成 |
| 异常检测 | data-anomaly-detector | 检测异常批次/地区 |
| 可视化 | data-visualization-2 | 风险热力图、趋势图 |
| 文档生成 | sovereign-api-docs-generator | 自动生成 API 文档 |

---

## 八、Review 检查点

### Before Implementation:

1. **数据可用性确认**
   - [ ] VAERS 数据字段完整性
   - [ ] 邮编数据覆盖率
   - [ ] 症状分类标准

2. **模型验证计划**
   - [ ] 历史数据回测
   - [ ] 交叉验证设计
   - [ ] 置信区间计算

3. **合规检查**
   - [ ] 数据隐私 (HIPAA/GDPR)
   - [ ] 医疗免责声明
   - [ ] 风险提示 UI

### Implementation Priority:

1. **P0 (核心)** - 批次风险增强 + 综合评估 API
2. **P1 (重要)** - 地区风险层 + 热力图
3. **P2 (增强)** - 症状风险层 + 症状网络

---

## 九、待 Javen 确认

1. 是否优先实现地区风险层？(当前邮编数据覆盖情况？)
2. 症状数据是否已有结构化分类？(还是需要从 VAERS 原始数据提取？)
3. 目标是在现有后端扩展还是新建微服务？

---

*文档版本: v0.1*
*创建时间: 2026-03-09*
