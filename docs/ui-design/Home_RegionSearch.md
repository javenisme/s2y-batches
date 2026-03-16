# 页面设计方案 - Home (地区搜索)

## 现有结构

```tsx
// frontend/src/pages/Home.tsx
- 顶部: Logo + 导航
- 主体: 批次搜索框 + 最近搜索
- 底部: 地图展示 (Leaflet)
```

## 方案: 增加「按地区查询」Tab

### UI 布局

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 搜索疫苗批次                              [批次] [地区] │  ← 新增 Tab
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Enter zipcode, city, or state                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📍 热门地区                                              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │ NYC    │ │ LA     │ │ Chicago│ │ Houston│              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📊 地区风险概览                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │              🗺️  US Risk Heatmap                    │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### API 对接

| 功能 | API | 方法 |
|------|-----|------|
| 搜索地区 | `/api/v2/risk/regional/zipcode/{zip}` | GET |
| 州级风险 | `/api/v2/risk/regional/state/{state}` | GET |
| 热力图数据 | `/api/v2/risk/regional/heatmap` | GET |

### 新增组件

```
components/
├── RegionSearchInput.tsx    # 地区搜索输入
├── RegionRiskCard.tsx       # 地区风险卡片
├── UsHeatmap.tsx           # 全国热力图 (Leaflet + GeoJSON)
└── HotRegions.tsx           # 热门地区快捷入口
```

### 地区风险卡片内容

```tsx
interface RegionRiskCard {
  zipcode: string;
  city: string;
  state: string;
  region_risk_score: number;      // 0-10
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  total_doses: number;
  total_adverse_events: number;
  adverse_events_per_100k: number;
  top_batches: Array<{
    code: string;
    risk_score: number;
    reports: number;
  }>;
  healthcare_access_score: number;
}
```

### 跳转流程

1. 用户输入邮编/城市/州 → 搜索
2. 显示 RegionRiskCard
3. 点击卡片 → 跳转 `/region/{zipcode}` 或 `/region/state/{state}`
4. 地区详情页展示该地区所有批次风险

---

## 实现任务

1. [ ] 新增 RegionSearchInput 组件
2. [ ] 新增 RegionRiskCard 组件  
3. [ ] 集成热力图 API 到现有 Leaflet 地图
4. [ ] 新增 `/region/:zip` 路由
5. [ ] 创建 RegionDetail 页面
