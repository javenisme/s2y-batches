# Sprint 1: Foundation & Design
## 2025-12-25 to 2026-01-08 (2 weeks)

**Sprint Goal**: 完成需求分析、架构设计和数据探索,为开发阶段做好准备

---

## 🎯 Sprint Objectives

1. ✅ PRD最终确认
2. ✅ 系统架构设计完成
3. ✅ API规范定义
4. ✅ 数据库Schema设计
5. ✅ 探索性数据分析完成
6. ✅ 基线ML模型原型

---

## 👥 Agent任务分配

### PM-Agent Tasks

#### Task PM-1.1: PRD最终化 [Priority: P0]
**Story Points**: 5
**Assignee**: PM-Agent
**Due Date**: 2025-12-27

**Description**:
审查并最终确认PRD文档,收集各Agent反馈并整合

**Acceptance Criteria**:
- [ ] 所有Agent审查完成
- [ ] 关键问题解答完毕
- [ ] PRD v1.0正式发布

**Deliverables**:
- PRD_LongCovid_v1.0_Final.md
- 审查反馈汇总文档

---

#### Task PM-1.2: User Story细化 [Priority: P0]
**Story Points**: 8
**Assignee**: PM-Agent
**Due Date**: 2025-12-29

**Description**:
将PRD中的User Stories转化为GitHub Issues,添加详细描述和验收标准

**Acceptance Criteria**:
- [ ] 创建至少20个GitHub Issues
- [ ] 每个Issue包含完整的AC
- [ ] Issue打上合适的标签(epic, feature, bug等)
- [ ] 估算Story Points

**Deliverables**:
- 20+ GitHub Issues
- Issue模板文档

**GitHub Issue示例**:
```markdown
## US-001: 批次风险评分查询

### Description
作为疫苗接种者,我想输入我的疫苗批次号,以便看到该批次的长期副作用风险评分

### Acceptance Criteria
- [ ] 用户可以在搜索框输入批次号
- [ ] 系统返回0-100的风险评分
- [ ] 显示评分的置信区间
- [ ] 响应时间 <2秒

### Technical Notes
- 使用ML模型计算风险评分
- 缓存常用批次结果

### Story Points: 5
### Priority: P0
### Epic: 长新冠风险评估
```

---

#### Task PM-1.3: Sprint 2规划 [Priority: P1]
**Story Points**: 3
**Assignee**: PM-Agent
**Due Date**: 2026-01-07

**Description**:
准备Sprint 2的backlog和优先级排序

**Acceptance Criteria**:
- [ ] Sprint 2目标定义
- [ ] Top 10 Issues优先级排序
- [ ] 估算Sprint 2容量

**Deliverables**:
- SPRINT_2_PLAN.md

---

### Arch-Agent Tasks

#### Task ARCH-1.1: 系统架构设计 [Priority: P0]
**Story Points**: 13
**Assignee**: Arch-Agent
**Due Date**: 2025-12-30

**Description**:
设计完整的系统架构,包括前后端交互、数据流、部署架构

**Acceptance Criteria**:
- [ ] 完成架构图(C4模型: Context, Container, Component)
- [ ] 定义技术栈
- [ ] 识别关键技术风险
- [ ] 定义架构原则

**Deliverables**:
- ARCHITECTURE.md
- 架构图(draw.io源文件 + PNG导出)

**架构要点**:
- 前后端分离
- RESTful API设计
- 微服务 vs 单体(初期建议单体)
- 缓存策略
- 数据库选型

---

#### Task ARCH-1.2: API设计规范 [Priority: P0]
**Story Points**: 8
**Assignee**: Arch-Agent
**Due Date**: 2026-01-02

**Description**:
定义所有API端点的规范,使用OpenAPI 3.0标准

**Acceptance Criteria**:
- [ ] 完成OpenAPI YAML文件
- [ ] 定义所有端点(至少15个)
- [ ] 定义请求/响应Schema
- [ ] 定义错误码规范

**Deliverables**:
- openapi.yaml
- API设计文档
- Postman Collection

**API端点清单**:
```
POST   /api/v1/risk/score
GET    /api/v1/risk/timeline
GET    /api/v1/risk/compare
POST   /api/v1/patterns/clusters
GET    /api/v1/patterns/network
GET    /api/v1/patterns/associations
GET    /api/v1/patterns/subgroups
GET    /api/v1/batches/{batchCode}
GET    /api/v1/batches/{batchCode}/symptoms
GET    /api/v1/analytics/distribution
POST   /api/v1/qa/ask
...
```

---

#### Task ARCH-1.3: 数据库Schema设计 [Priority: P0]
**Story Points**: 8
**Assignee**: Arch-Agent
**Due Date**: 2026-01-03

**Description**:
设计关系型数据库Schema,支持高效查询

**Acceptance Criteria**:
- [ ] 完成ER图
- [ ] 定义所有表结构(至少10张表)
- [ ] 定义索引策略
- [ ] 定义数据分区策略(如需要)

**Deliverables**:
- DATABASE_SCHEMA.md
- SQL DDL脚本
- ER图

**核心表清单**:
- batches (批次基础信息)
- symptoms (症状字典)
- batch_symptoms (批次-症状关联)
- risk_scores (预计算的风险评分)
- clusters (聚类结果)
- association_rules (关联规则)
- patient_profiles (患者画像)
- geographic_distribution (地理分布)
- ...

---

#### Task ARCH-1.4: 技术选型文档 [Priority: P1]
**Story Points**: 3
**Assignee**: Arch-Agent
**Due Date**: 2026-01-05

**Description**:
记录技术选型的决策过程和理由

**Acceptance Criteria**:
- [ ] 至少5个关键技术决策
- [ ] 每个决策包含备选方案对比
- [ ] 记录决策理由

**Deliverables**:
- ADR (Architecture Decision Records) 文档

**ADR示例**:
```markdown
# ADR-001: 选择FastAPI作为后端框架

## Status
Accepted

## Context
需要选择Python后端框架

## Decision
使用FastAPI

## Consequences
Positive:
- 高性能 (基于Starlette + Pydantic)
- 自动API文档生成
- 类型提示支持

Negative:
- 相对较新,生态不如Flask成熟

## Alternatives Considered
- Flask: 成熟但缺少异步支持
- Django: 过于庞大,不适合API服务
```

---

### DS-Agent Tasks

#### Task DS-1.1: 探索性数据分析 (EDA) [Priority: P0]
**Story Points**: 13
**Assignee**: DS-Agent
**Due Date**: 2025-12-31

**Description**:
对VAERS数据进行深入探索,理解数据特征和质量

**Acceptance Criteria**:
- [ ] 完成数据质量报告
- [ ] 完成描述性统计分析
- [ ] 识别数据问题(缺失值、异常值等)
- [ ] 可视化关键发现

**Deliverables**:
- Jupyter Notebook: `EDA_VAERS_LongCovid.ipynb`
- 数据质量报告: `DATA_QUALITY_REPORT.md`
- 可视化图表集

**分析清单**:
1. 数据概览
   - 总记录数
   - 时间范围
   - 批次数量
   - 症状数量

2. 数据质量
   - 缺失值分析
   - 重复值检查
   - 异常值识别

3. 分布分析
   - 批次不良反应分布
   - 症状频率分布
   - 时间趋势分析
   - 地理分布

4. 相关性分析
   - 批次特征与严重性相关性
   - 症状共现模式
   - 时间窗口与症状关系

---

#### Task DS-1.2: 特征工程研究 [Priority: P0]
**Story Points**: 8
**Assignee**: DS-Agent
**Due Date**: 2026-01-03

**Description**:
设计用于ML模型的特征

**Acceptance Criteria**:
- [ ] 定义至少30个候选特征
- [ ] 特征重要性分析
- [ ] 特征相关性分析
- [ ] 特征编码方案

**Deliverables**:
- FEATURE_ENGINEERING.md
- 特征生成脚本

**特征类别**:
1. **批次特征**
   - 制造商
   - 批次大小
   - 不良反应率
   - 严重不良反应率
   - 致死率

2. **时间特征**
   - 接种后天数
   - 季节
   - 年份

3. **地理特征**
   - 州/国家
   - 人口密度
   - 疫苗接种率

4. **人口统计特征**
   - 年龄组
   - 性别
   - 基础疾病

5. **症状特征**
   - 症状数量
   - 症状严重度
   - 症状持续时间
   - 症状类别(MedDRA分类)

---

#### Task DS-1.3: 基线模型开发 [Priority: P1]
**Story Points**: 13
**Assignee**: DS-Agent
**Due Date**: 2026-01-06

**Description**:
开发简单的基线模型,作为后续优化的benchmark

**Acceptance Criteria**:
- [ ] 逻辑回归模型训练
- [ ] 随机森林模型训练
- [ ] 模型评估指标(AUC, Precision, Recall, F1)
- [ ] 特征重要性分析

**Deliverables**:
- Notebook: `Baseline_Models.ipynb`
- 模型文件: `baseline_lr.pkl`, `baseline_rf.pkl`
- 评估报告: `BASELINE_EVALUATION.md`

**模型目标**:
- 任务: 二分类(是否出现长新冠症状)
- 目标指标: AUC >0.75
- 训练集/测试集: 80/20分割

---

#### Task DS-1.4: 聚类可行性分析 [Priority: P1]
**Story Points**: 8
**Assignee**: DS-Agent
**Due Date**: 2026-01-07

**Description**:
验证症状聚类的可行性,确定最佳聚类算法和参数

**Acceptance Criteria**:
- [ ] 尝试至少3种聚类算法
- [ ] 使用肘部法则确定K值
- [ ] 轮廓系数评估
- [ ] 可视化聚类结果

**Deliverables**:
- Notebook: `Clustering_Analysis.ipynb`
- 聚类可行性报告

**算法对比**:
- K-means
- DBSCAN
- 层次聚类

---

### DE-Agent Tasks

#### Task DE-1.1: ETL Pipeline设计 [Priority: P0]
**Story Points**: 8
**Assignee**: DE-Agent
**Due Date**: 2025-12-30

**Description**:
设计从VAERS CSV到数据库的ETL流程

**Acceptance Criteria**:
- [ ] 完成ETL流程图
- [ ] 定义数据转换规则
- [ ] 定义数据验证规则
- [ ] 估算处理时间

**Deliverables**:
- ETL_PIPELINE_DESIGN.md
- 流程图

**ETL步骤**:
1. Extract
   - 读取VAERSDATA.csv
   - 读取VAERSVAX.csv
   - 读取VAERSSYMPTOMS.csv

2. Transform
   - 数据清洗
   - 类型转换
   - 关联合并
   - 特征生成

3. Load
   - 写入SQLite/PostgreSQL
   - 创建索引
   - 更新统计信息

---

#### Task DE-1.2: 数据质量框架 [Priority: P1]
**Story Points**: 5
**Assignee**: DE-Agent
**Due Date**: 2026-01-04

**Description**:
建立数据质量监控和验证框架

**Acceptance Criteria**:
- [ ] 定义数据质量规则(至少20条)
- [ ] 实现验证脚本
- [ ] 创建质量报告模板

**Deliverables**:
- data_quality_checks.py
- DATA_QUALITY_RULES.md

**质量规则示例**:
- 批次号不为空
- 日期格式正确
- 年龄在0-120之间
- 症状在标准字典中
- 无重复记录

---

### BE-Agent Tasks

#### Task BE-1.1: 项目脚手架搭建 [Priority: P0]
**Story Points**: 5
**Assignee**: BE-Agent
**Due Date**: 2025-12-28

**Description**:
初始化FastAPI项目结构

**Acceptance Criteria**:
- [ ] 项目目录结构创建
- [ ] 依赖管理(requirements.txt / poetry)
- [ ] Docker配置
- [ ] 基础配置文件

**Deliverables**:
- backend/ 目录
- Dockerfile
- docker-compose.yml
- README.md

**目录结构**:
```
backend/
├── api/
│   ├── routes/
│   ├── dependencies.py
│   └── main.py
├── core/
│   └── config.py
├── models/
├── services/
├── tests/
├── requirements.txt
├── Dockerfile
└── README.md
```

---

#### Task BE-1.2: Hello World API [Priority: P0]
**Story Points**: 3
**Assignee**: BE-Agent
**Due Date**: 2025-12-29

**Description**:
实现最简单的API端点,验证环境

**Acceptance Criteria**:
- [ ] GET /health 返回200
- [ ] GET /api/v1/info 返回版本信息
- [ ] Docker容器启动成功
- [ ] API文档自动生成(/docs)

**Deliverables**:
- 运行中的FastAPI服务

---

### FE-Agent Tasks

#### Task FE-1.1: 前端项目初始化 [Priority: P0]
**Story Points**: 5
**Assignee**: FE-Agent
**Due Date**: 2025-12-28

**Description**:
使用Create React App创建项目

**Acceptance Criteria**:
- [ ] React项目创建
- [ ] 目录结构组织
- [ ] 基础路由配置
- [ ] UI库选择(Ant Design / Material-UI)

**Deliverables**:
- frontend/ 目录
- package.json
- README.md

---

#### Task FE-1.2: 设计系统定义 [Priority: P1]
**Story Points**: 5
**Assignee**: FE-Agent
**Due Date**: 2026-01-03

**Description**:
定义设计系统(颜色、字体、组件样式)

**Acceptance Criteria**:
- [ ] 颜色方案定义
- [ ] 字体系统定义
- [ ] 间距系统定义
- [ ] 示例页面

**Deliverables**:
- DESIGN_SYSTEM.md
- theme.js

---

### QA-Agent Tasks

#### Task QA-1.1: 测试策略文档 [Priority: P0]
**Story Points**: 5
**Assignee**: QA-Agent
**Due Date**: 2026-01-02

**Description**:
制定完整的测试策略

**Acceptance Criteria**:
- [ ] 定义测试级别(单元、集成、E2E)
- [ ] 定义测试覆盖率目标
- [ ] 选择测试工具
- [ ] 定义CI集成方案

**Deliverables**:
- TESTING_STRATEGY.md

---

#### Task QA-1.2: 测试用例设计 [Priority: P1]
**Story Points**: 8
**Assignee**: QA-Agent
**Due Date**: 2026-01-06

**Description**:
为US-001至US-004设计测试用例

**Acceptance Criteria**:
- [ ] 每个US至少3个测试用例
- [ ] 包含正向和负向测试
- [ ] 定义测试数据

**Deliverables**:
- TEST_CASES.md

---

### Ops-Agent Tasks

#### Task OPS-1.1: 开发环境搭建 [Priority: P0]
**Story Points**: 5
**Assignee**: Ops-Agent
**Due Date**: 2025-12-27

**Description**:
为所有Agent准备统一的开发环境

**Acceptance Criteria**:
- [ ] Docker Desktop安装指南
- [ ] Python环境配置指南
- [ ] Node.js环境配置指南
- [ ] 数据库本地部署

**Deliverables**:
- DEV_ENVIRONMENT_SETUP.md

---

#### Task OPS-1.2: CI/CD Pipeline初步设计 [Priority: P1]
**Story Points**: 5
**Assignee**: Ops-Agent
**Due Date**: 2026-01-05

**Description**:
设计GitHub Actions工作流

**Acceptance Criteria**:
- [ ] 定义CI触发条件
- [ ] 定义构建步骤
- [ ] 定义测试步骤
- [ ] 定义部署步骤

**Deliverables**:
- CI_CD_DESIGN.md
- .github/workflows/ci.yml (草稿)

---

### Doc-Agent Tasks

#### Task DOC-1.1: 文档结构规划 [Priority: P1]
**Story Points**: 3
**Assignee**: Doc-Agent
**Due Date**: 2025-12-30

**Description**:
规划项目文档的组织结构

**Acceptance Criteria**:
- [ ] 定义文档目录结构
- [ ] 定义文档命名规范
- [ ] 定义文档模板

**Deliverables**:
- DOCUMENTATION_STRUCTURE.md

---

#### Task DOC-1.2: README编写 [Priority: P0]
**Story Points**: 5
**Assignee**: Doc-Agent
**Due Date**: 2026-01-03

**Description**:
编写项目主README

**Acceptance Criteria**:
- [ ] 项目介绍
- [ ] 快速开始指南
- [ ] 贡献指南
- [ ] 许可证信息

**Deliverables**:
- README.md

---

## 📊 Sprint Metrics

### 容量规划
- **总Story Points**: 150
- **Agent数量**: 9
- **平均每Agent**: ~17 points
- **工作日数**: 10天

### 优先级分布
- **P0 (Must Have)**: 80 points (53%)
- **P1 (Should Have)**: 70 points (47%)
- **P2 (Nice to Have)**: 0 points

### 风险项
1. **数据质量**: 如果VAERS数据问题严重,可能影响进度
   - **缓解**: DS-Agent早期识别问题

2. **技术选型争议**: 如果Agent对技术栈有不同意见
   - **缓解**: Arch-Agent组织技术评审会议

3. **需求变更**: 如果PRD被大幅修改
   - **缓解**: PM-Agent快速决策,控制变更范围

---

## 🗓️ 重要日期

- **2025-12-25 (Wed)**: Sprint开始
- **2025-12-27 (Fri)**: PRD Finalized
- **2025-12-30 (Mon)**: 架构设计Review
- **2026-01-03 (Fri)**: API规范Review
- **2026-01-06 (Mon)**: Sprint中期检查
- **2026-01-08 (Wed)**: Sprint Review & Retrospective

---

## 📋 Definition of Done

### Story级别
- [ ] 代码已编写
- [ ] 单元测试已通过
- [ ] 代码审查已完成
- [ ] 文档已更新
- [ ] 演示给PM-Agent

### Sprint级别
- [ ] 所有P0任务完成
- [ ] >80% P1任务完成
- [ ] Sprint Review完成
- [ ] Sprint Retrospective完成
- [ ] 下一Sprint计划就绪

---

## 🤝 协作规范

### Daily Standup (每日)
时间: 每天上午10:00
格式:
- 昨天做了什么?
- 今天计划做什么?
- 有什么阻碍?

### Code Review
- 所有PR需要至少1个其他Agent审查
- 审查时间目标: <4小时
- Arch-Agent审查所有架构相关PR

### 沟通渠道
- 实时讨论: GitHub Discussions
- 异步交流: GitHub Issues comments
- 紧急问题: @提及相关Agent

---

## 📝 会议计划

### Sprint Planning (已完成)
- **日期**: 2025-12-25
- **时长**: 2小时
- **产出**: 本文档

### Mid-Sprint Check-in
- **日期**: 2026-01-06
- **时长**: 1小时
- **议题**: 进度检查,风险识别

### Sprint Review
- **日期**: 2026-01-08 10:00
- **时长**: 1.5小时
- **议题**: 演示完成的工作

### Sprint Retrospective
- **日期**: 2026-01-08 14:00
- **时长**: 1小时
- **议题**:
  - 做得好的地方
  - 需要改进的地方
  - 行动项

---

**Sprint Master**: PM-Agent
**Last Updated**: 2025-12-25
**Version**: 1.0
