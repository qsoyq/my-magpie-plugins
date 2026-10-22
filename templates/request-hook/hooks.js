// Bun 插件宿主中的异步网关钩子。返回 undefined 保留原始请求。
export async function onRequest(_body, _ctx) {
  return undefined;
}
