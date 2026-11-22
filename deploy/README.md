# Community Docker deployment

[简体中文](./README.zh-CN.md)

This is the unofficial bilingual fork of [tale/headplane](https://github.com/tale/headplane). Upstream licensing and attribution remain intact. Confirm [v0.8.3-zh](https://github.com/laity-cqf/headplane-zh-cn/releases/tag/v0.8.3-zh) has been published before pulling the image.

Run Docker and Docker Compose with an existing Headscale instance. Keep the supported Headscale range of upstream 0.8.2; CI tests 0.27.0, 0.27.1, 0.28.0, 0.29.0 and 0.29.1.

1. Copy this directory to the deployment host. Run `cp .env.example .env` and `cp config.yaml.example config.yaml`.
2. Run `docker inspect headscale --format '{{json .NetworkSettings.Networks}}'` (replace the container name as needed). Set `HEADSCALE_DOCKER_NETWORK` in `.env` to that existing network.
3. Set `headscale.url` in `config.yaml` to Headscale's service name and container port on that network. Set `server.base_url` to the browser-facing origin without `/admin`.
4. Run `openssl rand -hex 16` and replace `server.cookie_secret` with the resulting 32-character value. For HTTPS through a reverse proxy, set `server.cookie_secure: true`; the HTTP example uses `false`.
5. Run `docker compose pull` and `docker compose up -d`. Open `http://HOST:3000/admin`, replacing `HOST` with the deployment host.
6. Create an API key with `docker exec headscale headscale apikeys create --expiration 90d`, then sign in with that key. Switch English / 简体中文 in the header.
7. Check `docker compose ps` and `docker compose logs --tail=100 headplane`. The image's healthcheck verifies Headplane and its real Headscale connection.

The named volume preserves Headplane data across restarts. The minimal configuration enables device, user and policy management through Headscale's API. Editing Headscale configuration, DNS settings or OIDC restrictions requires the optional integration and shared files described in [Docker installation](../docs/install/docker.md). Browser SSH and Agent setup are also opt-in.

The full image tag `v0.8.3` remains fixed. `latest` and `0.8` follow later published versions. Future releases publish only the final image, supporting amd64 and arm64. No Cloudflare account or documentation hosting is required.
