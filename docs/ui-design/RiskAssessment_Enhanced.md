# 页面设计方案 - RiskAssessment (批次风险增强)

## 现有结构

```tsx
// 左侧: BatchInfoCard (批次基本信息)
// 右侧: UserProfileForm (用户资料表单) + RiskScoreCard (风险结果)
```

## 方案: 增加趋势、对比、置信区间

### UI 布局 (增强后)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Back         Risk Assessment: EN6201                 [Share] [📌]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────┐  ┌────────────────────────────────────────┐ │
│  │  📦 Batch Info       │  │  📊 Risk Score                         │ │
│  │                      │  │                                        │ │
│  │  Batch: EN6201       │  │     ╭─────╮                            │ │
│  │  Manufacturer: Pfizer│  │        7.2                            │ │
│  │  Vaccine: COVID-19    │  │     ╰─────╯                            │ │
│  │  Total Reports: 1,234 │  │     High    [95% CI: 6.2 - 8.1]       │ │
│  │  Deaths: 12           │  │                                        │ │
│  │  ──────────────────   │  │  📈 Compared to 156 similar batches   │ │
│  │  📍 3 countries       │  │     Your batch is 23% higher risk    │ │
│  │  🏭 5 providers       │  │                                        │ │
│  └──────────────────────┘  └────────────────────────────────────────┘ │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  [📊 Overview] [📈 Trend] [⚖️ Compare] [💊 Symptoms]                  │  ← 新增 Tab
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📈 Trend Analysis (新增)                                              │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │     █                                                        │    │
│  │   █ █                    ██                                  │    │
│  │ █ █ █        ██       ███ ███                                │    │
│  │ █ █ █    ███ ██    █████ █████  ██                           │    │
│  │ ────────────────────────────────────→ Time                 │    │
│  │  Jan  Feb  Mar  Apr  May  Jun  Jul  Aug                    │    │
│  │                                                                  │    │
│  │  📉 Trend: Decreasing (↓ 45% from peak)                        │    │
│  │  ⚠️ Anomaly detected: Feb 2024 spike                          │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ⚖️ Compare (新增)                                                     │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  This Batch vs Similar Batches                                 │    │
│  │                                                                  │    │
│  │  Your Batch    ████████████████████░░░░░  7.2                 │    │
│  │  Pfizer Avg    ██████████████░░░░░░░░░░░  5.8                 │    │
│  │  Global Avg    ████████████░░░░░░░░░░░░░  4.2                 │    │
│  │                                                                  │    │
│  │  ✓ Statistically significant (p < 0.05)                       │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  💊 Symptoms (新增)                                                    │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Top Symptoms for this batch:                                  │    │
│  │                                                                  │    │
│  │  🔴 Headache      ████████████████░░  45%  [Critical: 2%]      │    │
│  │  🟡 Fatigue       █████████████░░░░░  38%  [Critical: 1%]     │    │
│  │  🟢 Fever         ██████████░░░░░░░░░  25%  [Critical: 0.5%]   │    │
│  │                                                                  │    │
│  │  View symptom network →                                         │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### API 对接

| Tab | API | 方法 |
|-----|-----|------|
| Overview | `/api/v1/risk/batch/{code}` | GET (现有) |
| Trend | `/api/v2/risk/batch/{code}/trend` | GET (新增) |
| Compare | `/api/v2/risk/batch/{code}/compare` | GET (新增) |
| Symptoms | `/api/v2/risk/batch/{code}/symptoms` | GET (新增) |

### Trend API Response

```ts
interface BatchTrend {
  batch_code: string;
  trend_direction: 'increasing' | 'decreasing' | 'stable';
  reports_over_time: Array<{
    month: string;
    count: number;
  }>;
  anomaly_detected: boolean;
  anomaly_details?: string;
  confidence_interval: [number, number];  // [lower, upper]
  percentile: number;
  peak_month: string;
  current_month: string;
}
```

### Compare API Response

```ts
interface BatchCompare {
  batch_code: string;
  comparison_type: 'same_manufacturer' | 'same_vaccine_type' | 'global';
  statistics: {
    your_batch: number;
    comparison_avg: number;
    global_avg: number;
  };
  statistical_significance: string;  // "p<0.05", "p<0.01", "not significant"
  recommendation: string;
  percent_higher_than_avg: number;
}
```

### Symptoms API Response

```ts
interface BatchSymptoms {
  batch_code: string;
  total_symptom_reports: number;
  symptoms: Array<{
    name: string;
    frequency: number;
    percentage: number;
    severity_level: number;
    critical_percentage: number;
  }>;
  symptom_network_url?: string;
}
```

### 新增组件

```
components/
├── TrendChart.tsx           # 趋势折线图 (Recharts)
├── CompareChart.tsx         # 对比条形图
├── ConfidenceBadge.tsx      # 置信区间徽章
├── AnomalyAlert.tsx         # 异常警告
├── SymptomSeverityBar.tsx  # 症状严重度条
└── TabNavigation.tsx       # Tab 切换
```

### 颜色规范

| Risk Level | Color | Hex |
|------------|-------|-----|
| Low | 🟢 Green | #22C55E |
| Medium | 🟡 Yellow | #EAB308 |
| High | 🟠 Orange | #F97316 |
| Critical | 🔴 Red | #EF4444 |

---

## 实现任务

1. [ ] 创建 TabNavigation 组件
2. [ ] 实现 TrendChart (使用 Recharts)
3. [ ] 实现 CompareChart (对比条形图)
4. [ ] 实现 ConfidenceBadge 组件
5. [ ] 实现 AnomalyAlert 组件
6. [ ] 集成所有新 API 端点
7. [ ] 添加动画过渡效果

---

## 依赖

```json
{
  "recharts": "^2.x",
  "framer-motion": "^11.x"
}
```
