# 开发与贡献

项目采用轻量 GitHub Flow。较大的功能或问题先开 Issue 记录目标，小改动直接提交 PR 即可。Git 仓库建立后，建议从 main 创建功能分支，完成检查后合并；单人维护不要求额外审批者。

## Agent 协作

Codex、Pi 和 Claude Code 使用同一份 [AGENTS.md](AGENTS.md) 项目约定。Claude Code 的 [CLAUDE.md](CLAUDE.md) 只导入公共规则，不维护副本。启动与加载方式见 [Agent 开发说明](docs/agent-development.md)。

Agent 完成任务时应记录改动文件、实际执行的检查及未验证项。涉及跨客户端行为的插件，在自身 README 中分别记录 Codex、Pi、Claude Code 的版本、配置前提和验证结果；不适用项说明原因。

## 插件开发

1. 在 packages/<功能名>/ 创建独立插件包，按对应运行环境声明入口。
2. 包含唯一 name、version、private: true 和 README.md；当前只做个人本地使用。
3. 在 README 中记录用途、配置、安装路径和验证方式。
4. 不把登录信息、完整请求日志或本地配置写入仓库。

## 本地检查

使用 Node.js 24 或更高版本，无需安装第三方依赖：

```bash
npm run check
```

检查覆盖根清单、packages/ 和 templates/ 中各子包的基础元数据、README、main/hooks 文件路径，以及这些目录和 scripts/ 中 .js/.mjs/.cjs 文件的语法。它不导入插件，也不调用外部服务。

这不是完整的 magpie 清单校验或运行测试。新增 TypeScript、JSX、构建步骤或其他类型入口时，同步补充对应检查；不要把当前 JavaScript 检查当成它们已经通过验证。行为变更应按需增加测试，并按根 README 在沙箱中验证加载和实际请求。

## 提交前检查

除 Node.js 外，提交检查需要 pre-commit 和 Gitleaks。当前验证版本为 pre-commit 4.6.2、Gitleaks 8.30.1；CI 固定使用这些版本。它们是开发工具，不是插件或 npm 的依赖。

macOS 可通过 Homebrew 安装；其他平台按 [pre-commit](https://pre-commit.com/#installation) 和 [Gitleaks](https://github.com/gitleaks/gitleaks#installing) 官方说明安装。Homebrew 可能提供更新版本，请用版本命令核对：

```bash
brew install pre-commit gitleaks
pre-commit --version
gitleaks version
```

在已经初始化或克隆的 Git 仓库根目录安装本地 hook，每个 checkout 执行一次：

```bash
pre-commit install
```

之后每次 `git commit` 自动运行基础文件检查和 Gitleaks 暂存区扫描。手动验证本次变更时，替换以下示例文件为实际变更文件：

```bash
pre-commit run --files .pre-commit-config.yaml .github/workflows/ci.yml
```

基础钩子检查 JSON/YAML/TOML、文件名大小写冲突、合并冲突标记、超大文件、私钥、文件末尾换行、行尾空格和 LF 换行。格式钩子可能修改文件，需检查修改后重新暂存。Gitleaks 使用本机二进制及 `.gitleaks.toml` 默认规则，不接收文件列表：无论使用 `--files` 还是 `--all-files`，该 hook 都只扫描整个暂存区中的新增内容，不扫描全部工作区或历史。

首次启用时应手动检查全部文件，并单独检查历史；后续通常只检查本次变更：

```bash
pre-commit run --all-files --show-diff-on-failure
gitleaks git --redact --no-banner --config .gitleaks.toml --log-opts="--all"
```

尚未初始化 Git 或要检查未跟踪文件时，可单独扫描当前目录；它不替代 Git 历史扫描：

```bash
gitleaks dir --redact --no-banner --config .gitleaks.toml .
```

不要通过 `SKIP=gitleaks` 或 `--no-verify` 绕过本地密钥检查。缺少工具时先安装；误报按 [SECURITY.md](SECURITY.md) 做最小范围处理，真实凭据先撤销或轮换。

## CI 检查

CI 在 main 推送、PR 和手动触发时执行以下三个 job，与 `.github/settings.yml` 的必需状态检查名称保持一致：

- `check`：使用 Node.js 24 运行 `npm run check`。
- `pre-commit`：运行全文件基础钩子；仅在 CI 设置 `SKIP=gitleaks`，因为暂存区为空，密钥扫描由独立 job 完成。
- `gitleaks`：下载固定版本官方 CLI 并核对发布的 SHA-256 校验和；完整拉取历史后执行 `gitleaks git --log-opts="--all"`，包括已从当前文件删除、但仍留在历史中的密钥。扫描范围是本次 checkout 已拉取的 refs，不包括其他克隆或远端未取回的 refs。

CI 仅使用 `contents: read`，checkout 不持久化凭据；密钥扫描使用 `--redact`，不发表评论或上传扫描报告。直接运行 CLI，不依赖 gitleaks-action 的许可证或 PR API。CI 在推送后运行，不能替代提交前的本地检查，也不能使已泄漏的凭据失效。

## 提交与 PR

推荐 Conventional Commits，说明使用中文，例如：

```text
feat(request-tweaks): 添加请求上下文处理
fix(personal-tools): 修复空结果处理
chore(ci): 调整插件检查
```

PR 说明问题、结果、影响范围及实际完成的验证。避免把“语法通过”表述为“插件运行正常”。

## GitHub 元数据

.github/ISSUE_TEMPLATE 提供缺陷、功能和维护表单；PR 模板和 CODEOWNERS 分别提供变更说明框架与维护者信息。

.github/settings.yml 是可选 Settings App 配置，也可作为手动设置参考。GitHub 不会原生应用它；若要启用，需要用户另外授权 App。维护类 Issue 使用 maintenance 标签，新建远端后应手动创建该标签或由 App 同步。分支保护以 main 为约定，要求 check、pre-commit、gitleaks 通过，审批数为 0，管理员保留绕过权限。

Dependabot 当前只更新 GitHub Actions，不更新 pre-commit 的 hook rev、CLI 或 pip 版本。更新这些版本时同步核对 `.pre-commit-config.yaml`、CI 和本文，并重新验证暂存区与历史中的测试密钥确实会被拦截。新增包依赖后，应按实际包管理器补充锁文件及更新规则。当前不自动发布 npm 包或 GitHub Release。

这些模板参考 [qsoyq/ai-assistant](https://github.com/qsoyq/ai-assistant)，已按个人 magpie 插件集合调整。
