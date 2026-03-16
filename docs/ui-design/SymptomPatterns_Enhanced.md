# 页面设计方案 - SymptomPatterns (症状模式增强)

## 现有结构

```tsx
// 症状搜索 + 症状列表展示
// 基础筛选功能
```

## 方案: 增加症状严重度、网络图、组合风险

### UI 布局 (增强后)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  🔍 Search symptoms...                                    [Filter ▼]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🏷️ Severity Filter:  [All] [Minor] [Moderate] [Serious] [Critical]  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────┐  ┌────────────────────────────────────────┐ │
│  │  🕸️ Symptom Network  │  │  📊 Symptom Details                  │ │
│  │                      │  │                                        │ │
│  │      Headache ●──────│──│──● Fatigue                            │ │
│  │      │        │      │  │       │                                │ │
│  │      │        │      │  │       │                                │ │
│  │      ●────────┼──────│──│──────● Fever                          │ │
│  │      │        │      │  │                                        │ │
│  │      │        │      │  │  Selected: Headache                  │ │
│  │   Nausea ●────┘      │  │  ─────────────────────────────────   │ │
│  │                      │  │  Severity: 🔴 Critical (Level 4)    │ │
│  │  🔴 Common           │  │  ─────────────────────────────────   │ │
│  │  🟠 Cardiovascular   │  │  Reports: 12,500                     │ │
│  │  🟡 Neurological      │  │  Hospitalization: 8.2%             │ │
│  │                      │  │  Mortality: 0.3%                    │ │
│  │                      │  │  ─────────────────────────────────   │ │
│  │                      │  │  Onset: 3 days (median)             │ │
│  │                      │  │  Duration: 7 days (median)          │ │
│  └──────────────────────┘  └────────────────────────────────────────┘ │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ⚠️ Symptom Combination Risk (新增)                                     │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Enter symptoms to check combination risk:                      │    │
│  │  ┌────────────────────────────────────────────────────────┐     │    │
│  │  │ Chest pain × Shortness of breath × Fever             │ ✕   │    │
│  │  └────────────────────────────────────────────────────────┘     │    │
│  │                                                                  │    │
│  │  ➕ Add Symptom                                                │    │
│  │                                                                  │    │
│  │  🎯 Combined Risk Score: ⚠️ 7.8 (High)                        │    │
│  │                                                                  │    │
│  │  Possible Outcomes:                                             │    │
│  │  • Myocarditis        12%    🔴 Critical                       │    │
│  │  • Pulmonary Embolism  8%    🔴 Critical                       │    │
│  │  • Pericarditis        5%    🟠 High                           │    │
│  │                                                                  │    │
│  │  💡 Recommendation: Seek immediate medical attention           │    │
│  │     These symptoms combination requires urgent evaluation       │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### API 对接

| 功能 | API | 方法 |
|------|-----|------|
| 症状列表 | `/api/v2/risk/symptom?filter=...` | GET |
| 症状详情 | `/api/v2/risk/symptom/{symptom}` | GET |
| 症状网络 | `/api/v2/risk/symptom/network` | GET |
| 症状严重度 | `/api/v2/risk/symptom/severity/{symptom}` | GET |
| 组合风险 | `/api/v2/risk/symptom/assess` | POST |

### 严重度筛选

| Level | Name | Color | Examples |
|-------|------|-------|----------|
| 1 | Minor | 🟢 | Injection site pain, Fatigue |
| 2 | Moderate | 🟡 | Headache, Myalgia, Fever |
| 3 | Serious | 🟠 | Allergic reaction, Tachycardia |
| 4 | Severe | 🔴 | Myocarditis, Thrombosis |
| 5 | Life-threatening | ⚫ | Death, Respiratory failure |

### Symptom Network 图结构

```ts
interface SymptomNetwork {
  nodes: Array<{
    id: string;
    severity: number;
    frequency: number;
    cluster: string;  // "common", "cardiovascular", "neurological"
  }>;
  edges: Array<{
    source: string;
    target: string;
    co_occurrence: number;
  }>;
  clusters: Array<{
    name: string;
    symptoms: string[];
    color: string;
  }>;
}
```

### Combination Assess API

```ts
// Request
POST /api/v2/risk/symptom/assess
{
  symptoms: ["Chest pain", "Shortness of breath", "Fever"]
}

// Response
{
  combined_risk_score: 7.8,
  risk_level: "High",
  recommended_actions: [
    "Seek immediate medical attention",
    "Report to VAERS",
    "Contact healthcare provider"
  ],
  possible_outcomes: [
    {
      outcome: "Myocarditis",
      probability: 0.12,
      severity: 4
    },
    {
      outcome: "Pulmonary embolism",
      probability: 0.08,
      severity: 5
    }
  ],
  onset_timeline: {
    median_days: 3,
    range_days: "1-14"
  },
  duration: {
    median_days: 7,
    range_days: "3-30"
  }
}
```

### 新增组件

```
components/
├── SymptomNetworkGraph.tsx   # 症状网络图 (D3.js / React Force Graph)
├── SymptomSeverityBadge.tsx  # 严重度徽章
├── SymptomFilterChips.tsx    # 严重度筛选芯片
├── SymptomCombinationInput.tsx # 组合症状输入
├── CombinationRiskCard.tsx   # 组合风险结果卡片
├── OutcomeProbabilityList.tsx # 结局概率列表
└── ActionRecommendations.tsx # 建议操作列表
```

### 症状详情卡片

```ts
interface SymptomDetails {
  name: string;
  severity_level: number;
  severity_name: string;
  body_system: string;
  
  // 统计
  total_reports: number;
  hospitalization_prob: number;
  mortality_prob: number;
  
  // 时间特征
  onset_days_median: number;
  duration_days_median: number;
  
  // 关联
  common_combinations: string[];
  related_symptoms: string[];
}
```

---

## 实现任务

1. [ ] 创建 SymptomNetworkGraph (使用 react-force-graph)
2. [ ] 创建 SymptomFilterChips (严重度筛选)
3. [ ] 创建 SymptomCombinationInput (组合输入)
4. [ ] 创建 CombinationRiskCard (组合风险结果)
5. [ ] 集成 `/api/v2/risk/symptom/network`
6. [ ] 集成 `/api/v2/risk/symptom/assess`
7. [ ] 添加症状严重度颜色映射

---

## 依赖

```json
{
  "react-force-graph-2d": "^1.x",
  "d3": "^7.x"
}
```

---

## 用户流程

1. **浏览模式**
   - 用户进入页面 → 看到症状网络图
   - 点击节点 → 显示症状详情
   - 使用筛选器 → 按严重度过滤

2. **查询模式**
   - 用户输入症状 → 添加到组合
   - 查看组合风险评分
   - 查看可能的结局及概率
   - 获取行动建议

3. **预警模式**
   - 高风险组合 → 红色警告
   - 显示立即就医建议
   - 提供 VAERS 报告链接
