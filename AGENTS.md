# 项目约定

这是 Codex、Pi 和 Claude Code 共用的项目指令。Codex/Pi 通过 AGENTS.md 加载；Claude Code 通过根 CLAUDE.md 导入本文件。公共规则只在这里维护。

## 开始工作

- 先读 README.md、CONTRIBUTING.md 和目标插件的 README；三种 Agent 的入口与验证说明见 docs/agent-development.md。
- 确认当前项目或 worktree 的真实路径和已有改动，保留用户未提交的工作。默认只修改本次任务所在项目；其他 checkout、全局 Agent 配置和已安装插件需要用户明确要求。
- 默认使用中文说明结果，保留代码标识符和命令原文。
- 所需工具或技能不可用时，使用仓库文档和官方资料继续可完成的工作，并说明缺少的验证；不依赖某台机器上的全局技能绝对路径。

## 插件开发

- 这是个人 magpie 插件集合；实际插件放在 packages/<功能名>/，模板放在 templates/。
- 每个插件独立声明入口和依赖，保持可单独安装。不要把 workspace 根包当作插件入口。
- 优先保持简单：没有需求时不添加构建系统、共享框架或自动发布流水线。
- 修改前阅读 CONTRIBUTING.md 和对应插件的 README，按功能核对 magpie 官方插件文档。
- 完成改动后执行 `npm run check`；提交前按 CONTRIBUTING.md 运行适用的 pre-commit 检查。新增 TypeScript/JSX 或其他入口类型时补充相应检查。CI 的 check、pre-commit、gitleaks job 与 .github/settings.yml 中的状态检查名称保持一致。
- Bun 钩子、moejs 中间件/Agent 和 iframe 页面能力不同，不混用 API。
- 不从 OpenCode 插件入口导出辅助函数；宿主可能把每个导出函数当作插件调用。网关 hooks 文件则按协议导出 onRequest/onResponse。
- 测试优先使用 README 的临时沙箱。未经用户要求，不安装到真实 magpie 配置、不改登录信息、不发布包。
- 新增行为按风险做相应验证；报告语法检查、加载检查与实际请求验证的区别。

## 跨 Agent 兼容与交付

- 本仓库支持用 Codex、Pi、Claude Code 开发；插件运行时对三者的兼容性须逐项验证。不要因公共指令已加载，就宣称插件兼容三种 Agent。
- 涉及请求格式、工具调用或客户端配置的功能，在插件 README 中记录目标 Agent、相关版本、配置前提、验证步骤和结果；未测的明确标为未验证。
- 结束时说明改了哪些文件、完成哪些检查、还有哪些限制。不要把静态检查通过当成真实请求验证通过。
- 只有用户要求时才执行提交、推送、发布或真实 magpie 安装；已明确授权的操作无需重复询问。
- 不在 CLAUDE.md 或各 Agent 专属目录复制公共规则；如需专属配置，只添加对应工具确实需要的差异。
