/* 模拟 client-modules 的 resolveMeta + 入口扫描，确认我们的包会被正确发现。 */
const { createRequire } = require("module");
const { readFileSync, existsSync } = require("fs");
const { join, dirname } = require("path");

const require_ = createRequire("C:/Users/xuenbo01/.dsh/profiles/web/package.json");

// 1. loader 条目的 name 必须能 resolve 到 package.json
const pkgPath = require_.resolve("dsh-v-theme/package.json");
console.log("package.json:", pkgPath);

// 2. dsh.client 声明
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const decl = pkg.dsh && pkg.dsh.client;
if (!decl) throw new Error("dsh.client missing");
if (decl.platform !== "web") throw new Error("platform must be web");
if (decl.inject && !Array.isArray(decl.inject)) throw new Error("inject must be string[]");
console.log("dsh.client:", JSON.stringify(decl));

// 3. exports["./client"] 解析 + 文件存在
const client = pkg.exports["./client"];
const clientRel = typeof client === "string" ? client : client && client.default;
if (typeof clientRel !== "string") throw new Error("./client export unresolved");
const clientPath = join(dirname(pkgPath), clientRel);
if (!existsSync(clientPath)) throw new Error("client bundle missing: " + clientPath);
console.log("client bundle:", clientPath, `(${readFileSync(clientPath).length} bytes)`);

// 4. cordis.patch.yml 存在且声明了 insert
const patchPath = join(dirname(pkgPath), pkg.dsh.bundle.patch);
if (!existsSync(patchPath)) throw new Error("patch missing");
const patch = readFileSync(patchPath, "utf8");
if (!/id:\s*dsh-v-theme/.test(patch) || !/name:\s*dsh-v-theme/.test(patch)) throw new Error("patch entry malformed");
console.log("cordis.patch.yml: ok");

// 5. inject 声明的包都能从 profile 解析（fiber 治理依赖）
for (const dep of decl.inject || []) {
  require_.resolve(dep + "/package.json");
  console.log("inject dep resolvable:", dep);
}

console.log("\nHOST-SIDE DISCOVERY: PASS");
