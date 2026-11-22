# 社区 Docker 部署

[English](./README.md)

本项目是 [tale/headplane](https://github.com/tale/headplane) 的非官方中英双语 fork，保留上游许可证和来源说明。拉取前确认 [v0.8.3-zh](https://github.com/laity-cqf/headplane-zh-cn/releases/tag/v0.8.3-zh) 已正式发布。

部署主机需要 Docker、Docker Compose 及已运行的 Headscale。兼容范围沿用上游 0.8.2；CI 检查 0.27.0、0.27.1、0.28.0、0.29.0 和 0.29.1。

1. 将本目录复制到部署主机，执行 `cp .env.example .env` 和 `cp config.yaml.example config.yaml`。
2. 执行 `docker inspect headscale --format '{{json .NetworkSettings.Networks}}'`，容器名称按实际修改。在 `.env` 中将 `HEADSCALE_DOCKER_NETWORK` 设为查询到的现有网络。
3. 将 `config.yaml` 的 `headscale.url` 改为同网络中的 Headscale 服务名和容器端口。将 `server.base_url` 改为浏览器实际访问地址，不带 `/admin`。
4. 执行 `openssl rand -hex 16`，将输出的 32 个字符填入 `server.cookie_secret`。通过 HTTPS 反向代理访问时，将 `server.cookie_secure` 设为 `true`；此 HTTP 示例使用 `false`。
5. 执行 `docker compose pull` 和 `docker compose up -d`。打开 `http://HOST:3000/admin`，将 `HOST` 替换为部署主机地址。
6. 执行 `docker exec headscale headscale apikeys create --expiration 90d` 创建 API 密钥，使用该密钥登录。在顶部切换 English / 简体中文。
7. 执行 `docker compose ps` 和 `docker compose logs --tail=100 headplane` 检查状态。镜像自带健康检查会验证 Headplane 及其真实 Headscale 连接。

命名卷在容器重启后保留 Headplane 数据。此最小配置通过 Headscale API 管理设备、用户和策略；修改 Headscale 配置、DNS 设置及 OIDC 限制时，按 [Docker 安装文档](../docs/zh-CN/install/docker.md) 配置可选集成和共享文件。浏览器 SSH 和 Agent 也按需启用。

完整镜像标签 `v0.8.3` 固定保留；`latest` 和 `0.8` 随后续正式版本前移。后续仅发布普通正式镜像，保留 amd64、arm64。无需 Cloudflare 账号或文档托管服务。
