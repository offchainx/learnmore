# Conversation Ledger

> 粒度规则：只记录“每个有效回合”，不记录纯寒暄或重复确认。

| date | topic | new conclusions | files touched | next step |
|---|---|---|---|---|
| 2026-04-22 | UI 重构 spec/harness 初始化 | 确认极简双文档、`codex-plans/`、`harness/`、每个有效回合保存、工作流主线 + 页面域双层结构 | 根目录、子 spec、`codex-plans/*`、`harness/*` | 进入 `ws-00` 做 route 与 must-keep 盘点 |
| 2026-04-23 | ws-00 route freeze complete | 已完成 51 条 URL 的 route inventory，冻结页面域归属与 must-keep 功能，并把根任务台切到新的 `ws-01` | `tasks.md`, `specs/ws-00-scope-and-route-freeze/tasks.md`, `harness/route-inventory.md` | 进入 `ws-01` 做 v0 参考复刻 |
| 2026-04-23 | ws-01 scope reshuffle | 将原 `ws-01 ~ ws-04` 顺延为 `ws-02 ~ ws-05`，并把新 `ws-01` 改为 v0 参考复刻与 prompt 协助 | `tasks.md`, `spec.md`, `specs/ws-*` | 先推进新的 `ws-01` |
