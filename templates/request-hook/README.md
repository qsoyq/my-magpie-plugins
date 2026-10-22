# 异步网关请求钩子模板

复制到 packages/<功能名>/ 后，修改 package.json 的 name 和本文档，再实现 hooks.js。

当前模板没有实际业务行为：onRequest 返回 undefined，保持请求不变。没有依赖，无需构建。

## 接口

- 运行于 Bun 插件宿主，可以使用异步 I/O。
- onRequest(body, ctx) 返回对象会替换请求；返回 undefined 会丢弃原地修改、保留原请求。
- 不修改 model、stream、tools、tool_choice；相关改动会被宿主回滚。
- 对外 fetch 使用 ctx.signal；每个钩子默认预算为 1 秒。
- ctx.options 为插件配置；不要在源码里写密钥或记录完整请求内容。

## 验证

从本包目录执行语法检查（需要 Node.js）：

```bash
node --check hooks.js
```

安装与加载验证使用根 README 的沙箱步骤。语法通过不代表已验证 magpie 加载或真实请求。

[官方接口文档](https://usemagpie.ai/docs/zh/plugins#gateway-request)
