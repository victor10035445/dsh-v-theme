/**
 * dsh-v-theme — 宿主端入口。
 *
 * 主题是纯客户端特性，这里不注册任何宿主服务；本入口存在的唯一理由是让
 * profile 的 cordis loader 有一个可解析的宿主插件（client-modules 通过
 * 本包的 dsh.client 声明发现并托管 lib/client.js）。
 */

/** 插件名（loader 条目展示用）。 */
export const name = "dsh-v-theme";

/** 无宿主服务依赖。 */
export const inject = [];

/** 无宿主侧逻辑。 */
export function apply() {}
