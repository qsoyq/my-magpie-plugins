# My magpie plugins

个人 magpie 插件集合。一个目录管理多个独立插件包，每个插件可以单独添加、启停和配置。

## 目录结构

```text
my-magpie-plugins/
├── .github/                  # Issue/PR 模板、CODEOWNERS、CI 和仓库设置
├── README.md
├── AGENTS.md                 # Codex / Pi / Claude Code 公共约定
├── CLAUDE.md                 # Claude Code 导入入口
├── CONTRIBUTING.md           # 开发流程和检查范围
├── SECURITY.md               # 凭据与漏洞报告约定
├── package.json              # 私有 workspace 根包，不是 magpie 插件入口
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .pre-commit-config.yaml   # 本地提交检查和暂存区密钥扫描
├── .gitleaks.toml            # 继承 Gitleaks 默认检测规则
├── docs/
│   └── agent-development.md  # 三种 Agent 的开发与兼容性验证说明
├── scripts/
│   └── check.mjs             # 无第三方依赖的基础检查
├── packages/                 # 每个实际功能一个插件包
│   └── README.md
└── templates/
    └── request-hook/         # Bun 异步网关钩子模板
        ├── README.md
        ├── package.json
        └── hooks.js
```

## 使用 Codex / Pi / Claude Code 开发

三种 Agent 共用根目录 [AGENTS.md](AGENTS.md)。Codex 和 Pi 读取该文件，Claude Code 通过 [CLAUDE.md](CLAUDE.md) 导入；公共规则只维护一份。

从本项目或目标 worktree 根目录启动 `codex`、`pi` 或 `claude` 即可。启动方式、指令加载与更新，以及插件运行时兼容性记录要求，见 [Agent 开发说明](docs/agent-development.md)。

这里的支持指开发工作流；各插件对三种 Agent 的运行时兼容性，需要在插件 README 中分别记录验证结果。

## 检查与协作

使用 Node.js 24 或更高版本，在根目录执行 `npm run check`，无需先安装依赖。检查包元数据、README、main/hooks 入口路径及 JavaScript 语法；不替代 magpie 沙箱加载和行为验证。

本地使用 pre-commit 检查文件格式、私钥和暂存区中的密钥；安装及运行方式见 [CONTRIBUTING.md](CONTRIBUTING.md#提交前检查)。`npm run check` 仍不依赖这些工具。

GitHub Actions 在 main 推送、PR 和手动触发时运行 check、pre-commit、gitleaks 三项检查，分别覆盖项目基础校验、全文件基础钩子和已拉取 Git 历史的密钥扫描。Issue/PR 模板使用中文；仓库设置按单人维护配置，不要求其他人审批。`.github/settings.yml` 需要 Settings App 或手动配置才生效，创建本地文件不会修改 GitHub 设置。

详细流程见 [CONTRIBUTING.md](CONTRIBUTING.md)，凭据处理见 [SECURITY.md](SECURITY.md)。

## 新增第一个插件

从本项目根目录执行，名称可按具体功能替换：

```bash
cp -R templates/request-hook packages/request-tweaks
```

将新包 package.json 的 name 改为唯一名称（例如 my-magpie-request-tweaks），更新其 README，再实现 hooks.js。模板当前返回 undefined，不改变请求。

模板只适用于异步网关请求钩子。供应商、MCP 工具、页面、moejs 中间件和 Agent 插件需要各自的入口与清单字段，不要直接套用 hooks.js。

## 添加和重载

本机已克隆项目后，按插件子目录添加：

```bash
magpie plugin add "$PWD/packages/request-tweaks"
```

这是实际安装操作；开发时建议先使用下文沙箱。不要添加 workspace 根目录：它没有插件入口，也不会递归安装 packages 中的插件。

修改源码后，在 magpie 应用中关闭再开启该插件。终端命令会按本地目录当前内容加载。

## 沙箱验证

本项目根目录下运行以下 Bash 命令，将测试配置隔离到临时目录：

```bash
sandbox_dir=$(mktemp -d)
plugin_path="$PWD/packages/request-tweaks"
magpie_sandbox() {
  env HOME="$sandbox_dir" \
    XDG_CONFIG_HOME="$sandbox_dir/.config" \
    XDG_CACHE_HOME="$sandbox_dir/.cache" \
    MAGPIE_ADDR=127.0.0.1:3499 magpie "$@"
}
magpie_sandbox plugin add "$plugin_path" </dev/null
magpie_sandbox plugin --json
```

上述命令只验证安装与加载；具体请求行为需要在沙箱中配置测试供应商后验证。此处 HOME 只作为子进程配置隔离，不改变当前 shell 的 HOME。

## 组织约定

- packages/<功能名>/ 各自包含 package.json、README 和入口文件；包名保持唯一。
- 很小的插件直接把入口放在包根目录；代码增长后再引入 src/ 和 tests/。
- 根包和各插件包默认 private，供本地目录加载。以后需要发布时逐包调整。
- Bun 可以直接加载 TypeScript；当前模板使用 JavaScript，没有构建步骤和第三方依赖。
- 不预建共享库；确实出现重复代码后再提取。不要让需要独立安装的插件依赖仓库外的相对路径。
- npm 安装不会运行安装脚本；不要依赖 postinstall 生成插件入口。
- workspaces 只用于组织包，不会自动安装插件。当前无依赖，不需要先运行包管理器安装。
- GitHub 整仓库安装不会自动选择子包；个人使用可先克隆再按本地子目录添加，未来再按需分别发布 npm 包。
- 密钥通过插件登录或本地环境提供，不写入源码或示例配置。

## 参考

依据 magpie 插件手册 2026-10-22 快照：

- [包结构](https://usemagpie.ai/docs/zh/plugins#package)
- [异步网关请求钩子](https://usemagpie.ai/docs/zh/plugins#gateway-request)
- [测试](https://usemagpie.ai/docs/zh/plugins#test)
- [发布](https://usemagpie.ai/docs/zh/plugins#publish)
