// Community releases deliberately do not reuse the upstream tag namespace.
const { execFileSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require("node:fs");
const { join, resolve } = require("node:path");

const VERSION = "(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)";
const VERSION_RE = new RegExp(`^${VERSION}$`);
const TAG_RE = new RegExp(`^v${VERSION}-zh$`);
const SHA_RE = /^[a-f0-9]{40}$/;
const ASSETS = ["docs-root.tar.gz", "docs-archive.tar.gz"];
const REPOSITORY = "laity-cqf/headplane-zh-cn";
const LEGACY_REPOSITORY = "CM-Chenqf/headplane-zh-cn";
const run = (command, args, options = {}) =>
  (
    execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
      ...options,
    }) ?? ""
  ).trim();
const git = (...args) => run("git", args);
const gh = (...args) => run("gh", args);
const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const digest = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
const api = (path) => JSON.parse(gh("api", path));
const releases = (repo) =>
  JSON.parse(gh("api", "--paginate", "--slurp", `repos/${repo}/releases?per_page=100`)).flat();

function parseTag(tag) {
  const match = TAG_RE.exec(tag);
  if (!match) throw new Error("Expected a community release tag: vX.Y.Z-zh");
  const parts = match.slice(1).map(Number);
  if (!parts.every(Number.isSafeInteger)) throw new Error("Version is too large");
  return {
    version: parts.slice(0, 3).join("."),
    minor: parts.slice(0, 2).join("."),
    parts,
  };
}

function compareTags(a, b) {
  const aa = parseTag(a).parts;
  const bb = parseTag(b).parts;
  for (let i = 0; i < aa.length; i++) if (aa[i] !== bb[i]) return aa[i] < bb[i] ? -1 : 1;
  return 0;
}

function publishedVersions(items) {
  return items
    .filter((r) => !r.draft && !r.prerelease && r.published_at && TAG_RE.test(r.tag_name))
    .map((r) => r.tag_name)
    .sort((a, b) => compareTags(b, a));
}

function validateState(state, { allowLegacy = false } = {}) {
  if (
    state?.schemaVersion !== 2 ||
    (state.repository !== REPOSITORY && !(allowLegacy && state.repository === LEGACY_REPOSITORY)) ||
    !["development", "stable"].includes(state.channel) ||
    state.upstream?.repository !== "tale/headplane" ||
    !VERSION_RE.test(state.upstream?.version ?? "") ||
    !SHA_RE.test(state.upstream?.commit ?? "") ||
    Object.hasOwn(state, "revision") ||
    typeof state.publicationReady !== "boolean"
  )
    throw new Error("Invalid .github/fork-release.json");
  parseTag(`v${state.upstream.version}-zh`);
  if (Object.hasOwn(state, "communityRelease")) {
    const release = state.communityRelease;
    if (
      !release ||
      !VERSION_RE.test(release.version ?? "") ||
      release.upstreamCommit !== state.upstream.commit ||
      !release.notes ||
      !["en", "zh-CN"].every(
        (locale) => typeof release.notes[locale] === "string" && release.notes[locale].trim(),
      )
    )
      throw new Error(
        "Invalid community release: record its version, pinned upstream and bilingual notes",
      );
    const parsed = parseTag(`v${release.version}-zh`);
    if (
      parsed.minor !== parseTag(`v${state.upstream.version}-zh`).minor ||
      compareTags(`v${release.version}-zh`, `v${state.upstream.version}-zh`) <= 0
    )
      throw new Error("Invalid community release: use a newer patch in the same upstream series");
  }
  return state;
}

function validateTag(state, tag, packageVersion) {
  validateState(state);
  const parsed = parseTag(tag);
  if (state.channel !== "stable" || !state.publicationReady)
    throw new Error("Only an accepted stable commit can be published");
  if (
    parsed.version !== (state.communityRelease?.version ?? state.upstream.version) ||
    packageVersion !== state.upstream.version
  )
    throw new Error("Tag must match the recorded release; package version must match upstream");
  return parsed;
}

function imageMissing(status, body) {
  // Authentication, transport and server errors must never mean "unused tag".
  return (
    status === 404 &&
    Array.isArray(body.errors) &&
    body.errors.length > 0 &&
    body.errors.every((e) => ["MANIFEST_UNKNOWN", "NAME_UNKNOWN"].includes(e.code))
  );
}

async function assertUnusedImage(image, tag) {
  const path = image.replace(/^ghcr\.io\//, "");
  if (!process.env.GH_TOKEN || !process.env.GITHUB_ACTOR)
    throw new Error("Authenticated registry check requires GH_TOKEN and GITHUB_ACTOR");
  const auth = Buffer.from(`${process.env.GITHUB_ACTOR}:${process.env.GH_TOKEN}`).toString(
    "base64",
  );
  const token = await fetch(
    `https://ghcr.io/token?service=ghcr.io&scope=${encodeURIComponent(`repository:${path}:pull,push`)}`,
    {
      headers: { Authorization: `Basic ${auth}` },
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!token.ok)
    throw new Error(
      `Registry authorization failed (${token.status}); refusing to assume a tag is unused`,
    );
  const credentials = await token.json();
  if (!credentials.token) throw new Error("Registry did not return a token");
  const response = await fetch(`https://ghcr.io/v2/${path}/manifests/${tag}`, {
    headers: {
      Authorization: `Bearer ${credentials.token}`,
      Accept:
        "application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json",
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (response.ok)
    throw new Error(
      `Image ${image}:${tag} already exists; keep the existing image and select an unused release version`,
    );
  const body = await response.json();
  if (!imageMissing(response.status, body))
    throw new Error(`Cannot confirm unused image tag (${response.status})`);
}

function metadata(state, options) {
  validateState(state, options);
  const version = state.communityRelease?.version ?? state.upstream.version;
  return {
    tag: `v${version}-zh`,
    image_tag: `v${version}`,
    version: `${version}-zh`,
    minor: version.split(".").slice(0, 2).join("."),
    image: `ghcr.io/${state.repository.toLowerCase()}`,
  };
}

async function preflight(state, tag) {
  const meta = metadata(state);
  validateTag(state, tag, json("package.json").version);
  if (process.env.GITHUB_REPOSITORY !== state.repository)
    throw new Error("Wrong publishing repository");
  const sha = git("rev-parse", "HEAD");
  git("fetch", "--no-tags", "origin", "refs/heads/stable");
  if (git("rev-parse", "FETCH_HEAD^{commit}") !== sha)
    throw new Error("Publish the currently accepted stable commit");
  git(
    "fetch",
    "--no-tags",
    `https://github.com/${state.upstream.repository}.git`,
    `refs/tags/v${state.upstream.version}`,
  );
  if (git("rev-parse", "FETCH_HEAD^{commit}") !== state.upstream.commit)
    throw new Error("Upstream release tag no longer matches the pinned source");
  git("merge-base", "--is-ancestor", state.upstream.commit, sha);
  const all = releases(state.repository);
  if (all.some((r) => r.tag_name === tag))
    throw new Error(
      "Release or draft already exists; inspect the partial run without replacing its tag or assets",
    );
  for (const workflow of ["build.yaml", "i18n-check.yaml", "docs.yaml"]) {
    const runs = api(
      `repos/${state.repository}/actions/workflows/${workflow}/runs?branch=stable&event=push&head_sha=${sha}&per_page=100`,
    ).workflow_runs;
    if (
      !runs.length ||
      runs[0].head_sha !== sha ||
      runs[0].status !== "completed" ||
      runs[0].conclusion !== "success"
    )
      throw new Error(`${workflow} has not passed on this exact stable commit`);
  }
  await assertUnusedImage(meta.image, meta.image_tag);
  const published = publishedVersions(all);
  const newestMinor = published.find((t) => parseTag(t).minor === meta.minor);
  const result = {
    ...meta,
    sha,
    latest: !published.length || compareTags(tag, published[0]) > 0,
    minor_latest: !newestMinor || compareTags(tag, newestMinor) > 0,
  };
  for (const [key, value] of Object.entries(result)) {
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
  }
  return result;
}

function buildDocs(state, directory) {
  const { minor, version } = metadata(state);
  const output = resolve(directory);
  mkdirSync(output, { recursive: true });
  const vitepress = existsSync("docs/.vitepress/config.ts");
  const dist = vitepress ? "docs/.vitepress/dist" : "docs/build/client";
  function build(archived) {
    // Only clear the generated build output, never documentation sources.
    rmSync(dist, { recursive: true, force: true });
    const args =
      vitepress && archived
        ? ["exec", "vitepress", "build", "docs", "--base", `/${minor}/`]
        : ["docs:build"];
    run(process.platform === "win32" ? "pnpm.cmd" : "pnpm", args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: {
        ...process.env,
        HEADPLANE_DOCS_BASE: archived ? `/${minor}/` : "/",
        HEADPLANE_DOCS_CHANNEL: archived
          ? "archived"
          : state.channel === "development"
            ? "beta"
            : "latest",
        HEADPLANE_DOCS_VERSION:
          state.channel === "development" ? git("rev-parse", "--short", "HEAD") : version,
      },
    });
    run("tar", [
      "-czf",
      join(output, archived ? "docs-archive.tar.gz" : "docs-root.tar.gz"),
      "-C",
      !vitepress && archived ? `${dist}/${minor}` : dist,
      ".",
    ]);
  }
  build(false);
  build(true);
}

function bundle(state, directory, imageDirectory) {
  const meta = metadata(state);
  const sha = git("rev-parse", "HEAD");
  const output = resolve(directory);
  const images = ["final"].map((target) => {
    const record = json(join(imageDirectory, `${target}.json`));
    if (record.target !== target || !/^sha256:[a-f0-9]{64}$/.test(record.digest))
      throw new Error("Invalid image digest record");
    return {
      target,
      platforms: ["linux/amd64", "linux/arm64"],
      reference: `${meta.image}:${meta.image_tag}`,
      digest: record.digest,
    };
  });
  const manifest = {
    schemaVersion: 2,
    sourceArchives: {
      zip: `https://github.com/${state.repository}/archive/refs/tags/${meta.tag}.zip`,
      tar: `https://github.com/${state.repository}/archive/refs/tags/${meta.tag}.tar.gz`,
    },
    repository: state.repository,
    tag: meta.tag,
    sourceCommit: sha,
    upstream: state.upstream,
    ...(state.communityRelease ? { communityRelease: state.communityRelease } : {}),
    unofficial: true,
    images,
    assets: Object.fromEntries(
      ASSETS.map((name) => [name, { sha256: digest(join(output, name)) }]),
    ),
  };
  writeFileSync(join(output, "release-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  writeFileSync(
    join(output, "SHA256SUMS"),
    [...ASSETS, "release-manifest.json"]
      .map((name) => `${digest(join(output, name))}  ${name}\n`)
      .join(""),
  );
  const notes = `Community bilingual release / 社区中英双语版 ${meta.tag}\n\nThis is an unofficial fork of [tale/headplane](https://github.com/tale/headplane), not an official Chinese edition. 上游许可证和来源说明完整保留，本项目不是官方中文版。\n\n- Upstream / 上游: v${state.upstream.version} (${state.upstream.commit})\n- Source / 源码提交: ${sha}\n- Upstream release notes / 上游发行说明: https://github.com/tale/headplane/releases/tag/v${state.upstream.version}\n\n${images.map((i) => `- ${i.target}: \`${i.reference}\`\n  - \`${meta.image}@${i.digest}\``).join("\n")}\n\nThe image supports linux/amd64 and linux/arm64. 正式镜像支持 amd64 和 arm64。\n\nSource is available in GitHub’s Source code ZIP/tar.gz archives. English/Chinese documentation snapshots, image digests and checksums are attached. 源码使用 GitHub 自带 Source code ZIP/tar.gz，附件保留双语文档快照、镜像摘要和校验和。\n\nUse the full version tag or digest to pin deployments. 完整版本标签不重复发布；latest 和次版本别名会随发行前移。\n`;
  const summary = state.communityRelease
    ? `\nChanges / 更新说明\n\n${state.communityRelease.notes.en}\n\n${state.communityRelease.notes["zh-CN"]}\n\nThe community version is ${state.communityRelease.version}; the upstream base remains ${state.upstream.version}. 社区版本号为 ${state.communityRelease.version}，上游基础版本仍为 ${state.upstream.version}。\n`
    : "";
  writeFileSync(
    join(output, "release-notes.md"),
    notes.replace("\n\n- Upstream / 上游:", summary + "\n\n- Upstream / 上游:"),
  );
  return manifest;
}

function publish(state, directory, latest) {
  const meta = metadata(state);
  const manifest = json(join(directory, "release-manifest.json"));
  if (manifest.tag !== meta.tag || manifest.sourceCommit !== git("rev-parse", "HEAD"))
    throw new Error("Release bundle does not match checkout");
  for (const name of ASSETS)
    if (digest(join(directory, name)) !== manifest.assets[name].sha256)
      throw new Error(`Asset changed: ${name}`);
  // Upload every asset while still draft. Publication makes the tag/assets immutable.
  gh(
    "release",
    "create",
    meta.tag,
    "--repo",
    state.repository,
    "--verify-tag",
    "--draft",
    "--title",
    meta.tag,
    "--notes-file",
    join(directory, "release-notes.md"),
    ...[...ASSETS, "release-manifest.json", "SHA256SUMS"].map((n) => join(directory, n)),
  );
  gh(
    "release",
    "edit",
    meta.tag,
    "--repo",
    state.repository,
    "--draft=false",
    `--latest=${latest === "true"}`,
  );
  if (api(`repos/${state.repository}/releases/tags/${meta.tag}`).immutable !== true)
    throw new Error(
      "Published release is not immutable; restore the repository setting before moving aliases",
    );
}

async function main() {
  const [command, arg, arg2] = process.argv.slice(2);
  const state = validateState(json(".github/fork-release.json"));
  if (command === "info") console.log(JSON.stringify(metadata(state)));
  else if (command === "image-unused") {
    const meta = metadata(state);
    if (arg !== meta.image_tag) throw new Error("Unexpected image version");
    await assertUnusedImage(meta.image, arg);
  } else if (command === "preflight") console.log(JSON.stringify(await preflight(state, arg)));
  else if (command === "docs") buildDocs(state, arg);
  else if (command === "bundle") console.log(JSON.stringify(bundle(state, arg, arg2)));
  else if (command === "publish") publish(state, arg, arg2);
  else if (command === "tag") {
    const meta = metadata(state);
    validateTag(state, meta.tag, json("package.json").version);
    if (git("branch", "--show-current") !== "stable" || git("status", "--porcelain"))
      throw new Error("Use a clean stable checkout after CI passes");
    git("tag", "-a", meta.tag, "-m", `Unofficial bilingual Headplane ${meta.tag}`);
    console.log(
      `Created ${meta.tag}. Publish only this tag: git push origin refs/tags/${meta.tag}`,
    );
  } else
    throw new Error(
      "Use info, image-unused VERSION, preflight TAG, docs DIR, bundle DIR DIGEST_DIR, publish DIR LATEST, or tag",
    );
}

module.exports = {
  REPOSITORY,
  parseTag,
  compareTags,
  publishedVersions,
  validateState,
  validateTag,
  metadata,
  imageMissing,
  bundle,
  run,
};
if (require.main === module)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
