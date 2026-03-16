# S2Y B2B2C MVP 计划草案
## 方案 A: 长新冠诊所 RTM/RPM 服务商

**版本**: v0.1  
**日期**: 2026-02-16  
**执行周期**: 1 周 MVP  

---

## 1. 产品愿景

### 是什么
为北美长新冠诊所 / 功能医学诊所提供 **远程监测与计费服务**，帮助诊所合规使用 S2Y 设备 (taVNS + HOCl) 并获得 RTM 报销收入。

### 核心价值
- 诊所：零成本获得 RTM 计费系统 → 每月增加 $120-240/患者
- S2Y：卖出更多设备 + 订阅服务费
- 患者：获得更好的远程监测与康复指导

---

## 2. 市场规模

| 指标 | 数据 |
|------|------|
| 美国长新冠患者 | 1,760 万 |
| CPT 98975-98981 报销 | $120-240/患者/月 |
| 目标诊所 | 5,000-15,000 功能医学诊所 |

---

## 3. MVP 功能范围 (1周)

### 必须完成 (MVP)

| 功能 | 描述 | 交付物 |
|------|------|--------|
| 3.1 诊所注册 | 诊所基本信息注册 | Web 表单 |
| 3.2 患者列表 | 诊所添加/管理患者 | 列表页面 |
| 3.3 设备绑定 | 患者绑定 taVNS 设备 | 绑定页面 |
| 3.4 数据看板 | 实时显示患者设备数据 | Dashboard |
| 3.5 计费报表 | 生成 CPT 报销报表 | PDF 导出 |

### 暂不实现 (后续)

- 设备自动数据同步
- 保险直连
- 支付网关

---

## ⚠️ 重要调整: 设备数据方案

### 问题
taVNS 设备**暂无数据输出接口**

### MVP 解决方案
**方案 A1: 患者手动录入** (MVP 采用)
- 患者每次使用设备后，在网页/App 手动录入：
  - 使用时长 (分钟)
  - 主观感受 (可选)
  - 日期时间
- 诊所端查看汇总数据

**方案 A2: 硬件改造** (后续)
- 外接蓝牙/WiFi 模块
- 自动同步数据到云端

**MVP 选择: 方案 A1** - 快速验证业务逻辑，暂不依赖硬件

---

## 4. 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  诊所管理员   │  │   患者端      │  │   S2Y 运营   │   │
│  │  (Web)      │  │  (Web/App)   │  │  (Admin)    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
└─────────┼──────────────────┼──────────────────┼───────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                       API 层 (Next.js API Routes)           │
│  /api/clinics     /api/patients   /api/devices   /api/billing│
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据层 (PostgreSQL)                    │
│  clinics, patients, devices, device_readings, billing      │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                      设备层 (taVNS)                         │
│  设备数据上传 (WiFi/Bluetooth) → 云端                       │
└─────────────────────────────────────────────────────────────┘
```

### 技术栈选择

| 层级 | 技术 | 理由 |
|------|------|------|
| 前端 | Next.js 14 + shadcn/ui | S2Y Omer 已用，快速上手 |
| 后端 | Next.js API Routes | 统一代码库 |
| 数据库 | Supabase (PostgreSQL) | 免费额度够用，快速启动 |
| 部署 | Vercel | 免费额度够用 |
| 设备 | MQTT / HTTP 推送 | 简化实现 |

---

## 5. 数据模型

### 表: clinics (诊所)
```sql
id          UUID (PK)
name        VARCHAR
address     VARCHAR
contact     VARCHAR
created_at  TIMESTAMP
```

### 表: patients (患者)
```sql
id          UUID (PK)
clinic_id   UUID (FK)
name        VARCHAR
email       VARCHAR
device_sn   VARCHAR  -- 绑定的设备序列号
 enrolled_at TIMESTAMP
```

### 表: device_readings (设备数据)
```sql
id          UUID (PK)
patient_id  UUID (FK)
hrv         INTEGER
heart_rate  INTEGER
session_minutes INTEGER
recorded_at TIMESTAMP
```

### 表: billing_reports (计费报表)
```sql
id          UUID (PK)
clinic_id   UUID (FK)
patient_id  UUID (FK)
cpt_code    VARCHAR    -- 98975, 98976, 98977...
amount      DECIMAL
period_start DATE
period_end   DATE
generated_at TIMESTAMP
```

---

## 6. 页面结构

### 6.1 诊所端 (Clinic Portal)

```
/clinic/login          - 登录
/clinic/register       - 注册
/clinic/dashboard      - 首页看板 (患者数、活跃设备、今日计费)
/clinic/patients       - 患者列表
/clinic/patients/[id]  - 患者详情 + 设备数据
/clinic/billing        - 计费报表生成
/clinic/settings       - 诊所设置
```

### 6.2 患者端 (Patient Portal)

```
/patient/login         - 登录
/patient/dashboard     - 我的数据
/patient/bind-device   - 绑定设备
```

### 6.3 S2Y 运营端 (Admin)

```
/admin/clinics        - 诊所管理
/admin/patients       - 患者全局视图
/admin/billing       - 跨诊所计费统计
```

---

## 7. 每日里程碑

| Day | 任务 | 交付 |
|-----|------|------|
| **Day 1** | 项目初始化 + 数据库设计 + 登录/注册 | GitHub repo, Supabase schema |
| **Day 2** | 诊所 CRUD + 患者 CRUD + 设备绑定 | 诊所/患者管理页面 |
| **Day 3** | 患者端使用记录录入 + 诊所端数据看板 | 患者手动录入 + Dashboard |
| **Day 4** | 计费报表生成 | CPT 报表导出 |
| **Day 5** | 样式美化 + 测试 + 部署 | 可访问的 URL |
| **Day 6-7** | Bug 修复 + 演示准备 | MVP 完成 |

---

## 8. 成本估算

| 项目 | 成本 |
|------|------|
| Supabase (DB) | $0 (free tier) |
| Vercel (部署) | $0 (free tier) |
| 域名 | ~$10/年 |
| **总计** | **~$10** |

---

## 9. 商业模式

### 收入来源

| 来源 | 定价 | 说明 |
|------|------|------|
| 设备销售 | $299/台 | taVNS 设备 |
| 订阅费 | $29/患者/月 | 软件平台 |
| 耗材 | $49/月 | HOCl 消耗品 |

### 诊所收益
- 100 患者 × $150/月 RTM 报销 = **$15,000/月**
- 诊所付 S2Y: 设备 + 订阅 + 耗材 = ~$3,000/月
- **诊所净利润: ~$12,000/月**

---

## 10. 下一步

1. **确认**: 这个方向是否正确？
2. **资源**: 确认 taVNS 设备有数据输出接口吗？
3. **诊所**: 有意向合作的北美诊所吗？

---

*草案 v0.1 - 待讨论修订*
