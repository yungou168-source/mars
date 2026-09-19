# Contributing to Mars AI Extensions

感谢你帮助 Mars AI 建立可审查、可验证的扩展生态。当前根 README 与贡献文档以简体中文维护；未来翻译请遵循 [`docs/i18n/README.md`](docs/i18n/README.md)。

## 你可以贡献什么

| 类型 | 位置 | 要求 |
| --- | --- | --- |
| 文档或图示 | 根 README、`docs/` | 准确、可维护，不描述私有实现或未发布能力 |
| 技能 | `skills/<skill-id>/` | `SKILL.md`、`mars-extension.json`、许可证、完整性清单 |
| 可上架扩展 | 独立目录或仓库 | 根清单、许可证、README、构建与测试说明；不得依赖私有实现 |
| 历史插件迁移 | `plugins/` 的派生项目 | 保留来源说明，补齐清单、测试和公开宿主契约兼容性 |

`plugins/` 下的历史 SNF 源码仅供学习与迁移，不能直接上传市场。

## 提交前检查

```bash
pnpm install
pnpm typecheck
pnpm verify
```

每个市场可发布扩展必须在根目录提供 `mars-extension.json`，声明版本、许可证、兼容范围、最小权限和所有可加载文件的 SHA-256。不要提交 `.exe`、`.msi`、构建目录、凭据、用户数据、部署配置或私有服务代码。

## Pull Request

1. 从 `main` 创建一个职责单一的分支。
2. 在 PR 中说明用户价值、受影响目录、测试结果与安全影响。
3. 涉及扩展时，附上清单变更、权限理由和兼容范围。
4. 维护者会审查公开边界、许可证、完整性、文档和可复现性。

安全漏洞请遵循 [`SECURITY.md`](SECURITY.md) 私下报告，不要在公开 Issue 或 PR 中暴露凭据、用户数据或可直接利用的细节。

## 客户端发行

Windows 安装包只作为 GitHub Release assets 发布。不要向 Git 提交 `.exe`、`.msi` 或 `SHA256SUMS.txt`；客户端源码不在本仓库。