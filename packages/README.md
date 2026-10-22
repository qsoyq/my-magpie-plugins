# 实际插件

每个独立功能建立一个目录：packages/<功能名>/。

小插件推荐结构：

- package.json：唯一包名、private: true，以及该插件类型的入口声明。
- README.md：用途、安装路径、配置、运行环境与验证方法。
- 入口文件：例如网关钩子的 hooks.js、供应商/工具插件的 index.ts。

目前没有实际功能插件。新增异步网关钩子可复制 ../templates/request-hook；其他类型请按对应官方文档创建。
