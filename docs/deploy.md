# Deployment

The showroom ships as one container image and runs on the author's server `mary`
(`ssh mary`, public IPv4 `208.87.129.64` — no IPv6), behind the Nginx Proxy Manager container
`nginx-proxy-manager-mary` on the external network `reverse-proxy-nw`. The apex `lgdweb.fr` and
`www.lgdweb.fr` point at this one service.

## Registry and image reference

CI publishes to the GitHub Container Registry under the repository's own name, lowercased:

```
ghcr.io/tituxmetal/lgdweb-hub
```

`docker-publish` tags each default-branch build `sha-<commit>`, `<branch>`, `latest` and `prod`.
The image is publicly pullable without credentials, so `mary` needs no registry login. Anything
referring to the image agrees on the same reference:

- `docker/compose.yaml` → `image: ghcr.io/tituxmetal/lgdweb-hub:prod`
- `scripts/docker-build.sh` → `REGISTRY="ghcr.io/tituxmetal"`
- `package.json` → `docker:push` pushes `ghcr.io/tituxmetal/lgdweb-hub:latest`

## Stack

`docker/compose.yaml` is the stack content. `mary` deploys through **Portainer stacks**, not a git
checkout: paste that file into a new stack (as `pif-is-fake-mary` and its siblings do) and deploy.
The stack joins `reverse-proxy-nw` and `default-nw`, and carries the runtime settings the image
expects:

```yaml
environment:
  NODE_ENV: production
  HOST: 0.0.0.0
  PORT: 3000
```

No port is published: Nginx Proxy Manager reaches the container by name as `lgdweb-hub:3000` on
the shared network. Port 3000 is free on `mary`.

To roll the stack onto a newly published image, use Portainer's **Pull and redeploy** action on
the stack: it re-pulls `:prod` and recreates the container with the same configuration.

## DNS

The `lgdweb.fr` zone lives at Infomaniak (`ns31`/`ns32.infomaniak.com`). Today the apex and `www`
point at Infomaniak's hosting proxy — `A 84.16.66.164`, `AAAA 2001:1600:0:aaaa::2:14`, plus the
hosting TXT marker `"1|portfolio.lang-guillaume.com"` — and the apex currently redirects to
`portfolio.lang-guillaume.com`. The cutover is real:

- apex `A` → `208.87.129.64`, and the apex `AAAA` record **must be removed** (`mary` has no IPv6,
  so an IPv6-preferring client would keep hitting Infomaniak).
- `www` likewise.
- Leave `MX` and `SPF` alone: mail stays at Infomaniak.

## Nginx Proxy Manager

Add one proxy host for `lgdweb.fr` and `www.lgdweb.fr`, forwarding to `lgdweb-hub:3000` over
`http` (the container is resolved by name on `reverse-proxy-nw`), with:

- Websockets support enabled — the Tetris endpoint is `/ws/tetris`.
- Block Common Exploits and Force SSL enabled, HTTP/2 on.
- A new Let's Encrypt certificate for the apex plus `www` — issued only once DNS already points
  at `mary`.

## CI rule and ordering

CI builds and publishes the image; it never deploys. `validate` and `docker-check` gate every pull
request (the image is built, booted and probed), and `docker-publish` runs only on the default
branch or a manual dispatch — it pushes to GHCR and stops there. Only a default-branch build moves
the floating `prod` and `latest` tags: a manual dispatch from any other ref publishes its branch
and `sha` tags as a preview alone.

Because the image is published only from the default branch, the first production rollout is a
human checkpoint that cannot precede the merge:

1. Merge — CI publishes `ghcr.io/tituxmetal/lgdweb-hub:prod`.
2. Deploy the Portainer stack on `mary`.
3. Point `lgdweb.fr` (A → `208.87.129.64`, delete AAAA) and `www` at `mary` in the Infomaniak zone.
4. Add the Nginx Proxy Manager proxy host and issue the certificate.
5. Visit from outside the machine: the list, one project, and a shared link's preview.
