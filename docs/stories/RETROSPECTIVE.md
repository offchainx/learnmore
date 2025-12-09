# 项目回顾会议记录 (Sprint Retrospectives)

**方法论**: BMAD-METHOD 反思机制
**更新频率**: 每完成一个Phase后进行一次回顾

---

## 📅 回顾会议时间表

| Phase                   | 计划时间    | 实际时间 | 状态   |
| ----------------------- | ----------- | -------- | ------ |
| Phase 1: Foundation     | Week 2 结束 | -        | 待进行 |
| Phase 2: Course Engine  | Week 3 结束 | -        | 待进行 |
| Phase 3: Question Bank  | Week 4 结束 | -        | 待进行 |
| Phase 4: Community      | Week 5 结束 | -        | 待进行 |
| Phase 5: Growth & Stats | Week 6 结束 | -        | 待进行 |

---

## 🔄 回顾会议模板

复制以下模板,在每个Phase结束时填写:

```markdown
# Phase X Retrospective - [Phase名称]

**会议时间**: YYYY-MM-DD HH:MM
**参与者**: [@name1, @name2...]
**完成的Stories**: XXX, YYY, ZZZ
**实际耗时**: XX hours (计划 YY hours)
**速度 (Velocity)**: 实际Story Points / 计划Story Points

---

## 1. Sprint目标回顾

**原定目标**:

- [ ] 目标1
- [ ] 目标2

**实际达成**:

- [x] 目标1 ✅
- [ ] 目标2 ❌ (原因: ...)

**目标达成率**: X/Y = Z%

---

## 2. What Went Well ✅ (做得好的地方)

### 技术方面

- 示例: Prisma Schema设计合理,没有返工
- 示例: Shadcn组件集成很顺利

### 流程方面

- 示例: Code Review及时,发现了2个潜在bug
- 示例: 依赖关系图帮助我们识别了并行任务

### 协作方面

- 示例: Daily Standup很高效,没有超时

---

## 3. What Could Be Improved ⚠️ (可改进的地方)

### 技术债务

- 示例: Story-003的Auth逻辑缺少单元测试
- **Action**: 在下个Sprint补充测试

### 流程问题

- 示例: 时间预估不准确,Story-008超时3小时
- **Action**: 下次对视频集成类任务预留更多buffer

### 工具/环境

- 示例: Supabase文档不完善,调试Trigger花了很多时间
- **Action**: 整理一份Supabase最佳实践文档

---

## 4. Action Items 🎯 (下一步行动)

| 行动项                  | 负责人 | 截止日期 | 状态    |
| ----------------------- | ------ | -------- | ------- |
| 补充Story-003的单元测试 | @dev1  | Week X+1 | Pending |
| 整理Supabase调试指南    | @dev2  | Week X+1 | Pending |
| 调整后续Story的时间预估 | @lead  | 立即     | Pending |

---

## 5. Metrics & Data 📊 (数据指标)

### 计划 vs 实际

| 指标          | 计划 | 实际 | 偏差 |
| ------------- | ---- | ---- | ---- |
| 完成Stories数 | 5    | 4    | -20% |
| 总工时        | 30h  | 36h  | +20% |
| Story Points  | 25   | 20   | -20% |
| Bug数量       | -    | 3    | -    |

### 速度趋势

- **本Sprint速度**: 20 points / 36 hours = 0.56 points/hour
- **上Sprint速度**: N/A (首次)
- **趋势**: 🆕 基线建立

### 质量指标

- **代码审查发现问题数**: 5
- **生产环境Bug数**: 0 (尚未上线)
- **测试覆盖率**: 65% (目标80%)

---

## 6. Lessons Learned 💡 (经验教训)

### 技术经验

1. **Supabase Auth Trigger最佳实践**
   - 问题: 初次配置Trigger时,发现权限问题
   - 解决: 使用`SECURITY DEFINER`修饰符
   - 文档位置: `docs/guides/supabase-auth-sync.md`

2. **Next.js Server Actions的坑**
   - 问题: 在Client Component中调用Server Action报序列化错误
   - 解决: 确保返回值是Plain Object,不能是Prisma Model
   - 代码示例: `src/actions/example.ts`

### 流程经验

1. **时间预估技巧**
   - 对于首次接触的技术(如Tiptap编辑器),预估时间应×1.5
   - 集成类Story(需要对接外部服务)应至少预留2小时debug时间

2. **Code Review效率**
   - 小PR(< 200行)审查速度快,建议Story拆得更细

---

## 7. Team Morale 😊 (团队士气)

**整体评分**: ⭐⭐⭐⭐ (4/5)

**士气高涨的原因**:

- 完成了首个可用的功能模块
- 技术栈选型正确,开发体验好

**需要关注的问题**:

- 部分Story的Debug时间过长,有些挫败感
- 需要更多的正向反馈和里程碑庆祝

---

## 8. Next Sprint Planning 🚀 (下期规划)

### 优先级调整

- **提升优先级**: Story-XXX (因为用户反馈需求迫切)
- **降低优先级**: Story-YYY (可以延后到V1.1)

### 容量规划

- **上Sprint实际速度**: 0.56 points/hour
- **下Sprint可用时间**: 40 hours
- **预计完成**: 40 × 0.56 = 22 Story Points
- **建议认领**: 20 points (留10%缓冲)

### 技术准备

- [ ] 学习Recharts文档 (为Story-018做准备)
- [ ] 搭建Staging环境 (开始需要测试部署)

---

## 9. 附录: 会议照片/截图

_(可选) 粘贴白板照片、Miro截图、数据图表等_

---

**记录人**: @your-name
**下次回顾时间**: [Phase X+1结束时]
```

---

## 📝 已完成的回顾会议

### Phase 0: Pre-Project (Kickoff)

**会议时间**: 2025-12-09
**参与者**: 项目启动团队
**目标**: 确定技术栈和开发计划

#### 关键决策

1. ✅ 采用 Next.js + Supabase (MVP优先)
2. ✅ 遵循 BMAD-METHOD 故事驱动开发
3. ✅ 预计6周完成MVP

#### 风险识别

- ⚠️ Supabase Auth同步机制需要验证
- ⚠️ 视频播放和CDN方案需要技术选型
- ⚠️ 数学公式渲染需要测试 KaTeX 性能

#### 第一个Sprint目标

- 完成 Story-001 到 Story-005 (Foundation)
- 搭建完整的开发环境
- 建立CI/CD Pipeline

---

## 🎓 回顾会议最佳实践

### 准备工作 (会议前)

1. 收集本Sprint的数据 (Completed Stories, 工时, Bug数)
2. 准备好要讨论的话题 (每人至少想1个Went Well和1个Could Improve)
3. 预约会议室/Zoom链接

### 会议进行 (45-60分钟)

1. **5分钟**: 回顾Sprint目标和数据
2. **15分钟**: What Went Well (每人轮流分享)
3. **15分钟**: What Could Be Improved (每人轮流分享)
4. **15分钟**: 提出Action Items并分配责任人
5. **10分钟**: 规划下个Sprint的重点

### 会议原则

- ✅ **安全空间**: 可以自由批评流程,不针对个人
- ✅ **聚焦未来**: 过去的问题是为了改进未来
- ✅ **具体行动**: 每个"Could Improve"必须对应至少1个Action Item
- ❌ **避免甩锅**: 不要把问题归咎于某个人
- ❌ **避免空谈**: "下次我们要更努力" 不是有效的Action Item

---

**维护说明**:

- 每次回顾会议后,将会议记录追加到本文档
- 保留历史记录,便于追踪改进趋势
- 每季度做一次跨Phase的宏观回顾
