# Mars AI Extensions

本仓库仅公开 Mars AI 的扩展源码与发行元数据：

- `plugins/`：历史 SNF 插件源码，供审查、学习和迁移；
- `skills/`：可被客户端导入的技能内容；
- `packages/host-contracts/`：插件编译所需的公开宿主类型契约；
- GitHub Releases：官方 Windows 客户端安装包、校验和与发行说明。

官网、市场服务、构建 Runner、部署配置、数据库与运行时数据不属于本仓库，也未随本仓库开源。桌面客户端当前仅发布二进制安装包；客户端源代码不在此仓库。

## Windows 客户端

从 [Releases](../../releases) 下载与系统架构匹配的安装包，并用同一 Release 中的 `SHA256SUMS.txt` 校验文件完整性。下载地址只应来自本仓库的已发布 Release。

## 插件与技能

每个可由市场发布的扩展必须在仓库根目录提供 `mars-extension.json`，声明类型、版本、许可证、权限、兼容范围和完整性清单。当前 `plugins/` 下的历史插件没有该清单，不能直接上传到市场；它们应在迁移后以独立扩展仓库或目录发布。

技能目录使用 `skills/<skill-id>/SKILL.md`。请参阅 [skills/README.md](skills/README.md)。

## 本地检查

`node scripts/verify-public-repository.mjs` 会校验公开树中不含常见凭据、环境文件、数据库或构建产物。
