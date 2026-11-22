const assert = require("node:assert/strict");
const { test } = require("node:test");
const { execFileSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const { mkdtempSync, readFileSync, writeFileSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { validateSnapshot } = require("./published-assets.cjs");
const {
  parseTag,
  publishedVersions,
  validateState,
  validateTag,
  metadata,
  imageMissing,
  bundle,
  run,
} = require("./fork-release.cjs");
const state = {
  schemaVersion: 2,
  repository: "laity-cqf/headplane-zh-cn",
  channel: "stable",
  upstream: { repository: "tale/headplane", version: "0.8.2", commit: "a".repeat(40) },
  publicationReady: true,
};

test("documentation subprocesses can stream output and still propagate build failures", () => {
  assert.equal(run(process.execPath, ["-e", "process.exit(0)"], { stdio: "inherit" }), "");
  assert.throws(() => run(process.execPath, ["-e", "process.exit(7)"], { stdio: "inherit" }));
});

test("a community maintenance version stays bound to its actual upstream source", () => {
  const communityRelease = {
    version: "0.8.3",
    upstreamCommit: state.upstream.commit,
    notes: {
      en: "Display and edit JSON policies containing ACL and Grants rules.",
      "zh-CN": "支持 JSON 策略中 ACL 与 Grants 规则的展示和编辑。",
    },
  };
  const maintenance = { ...state, communityRelease };
  assert.equal(validateTag(maintenance, "v0.8.3-zh", "0.8.2").version, "0.8.3");
  assert.equal(metadata(maintenance).image_tag, "v0.8.3");
  assert.throws(() => validateTag(maintenance, "v0.8.2-zh", "0.8.2"));
  assert.throws(() => validateTag(maintenance, "v0.8.3-zh", "0.8.3"));
  assert.throws(
    () =>
      validateState({
        ...maintenance,
        upstream: { ...state.upstream, version: "0.8.3", commit: "b".repeat(40) },
      }),
    /community release/,
  );
  for (const changes of [
    { version: "0.8.3-zh.1" },
    { version: "0.8.1" },
    { version: "0.9.0" },
    { upstreamCommit: "c".repeat(40) },
    { notes: { en: "English only" } },
  ])
    assert.throws(
      () =>
        validateState({
          ...state,
          communityRelease: { ...communityRelease, ...changes },
        }),
      /community release/,
    );
});

test("maintenance archives and public verification retain the upstream base and bilingual changes", () => {
  const maintenance = {
    ...state,
    communityRelease: {
      version: "0.8.3",
      upstreamCommit: state.upstream.commit,
      notes: { en: "ACL and Grants compatibility.", "zh-CN": "兼容 ACL 与 Grants 写法。" },
    },
  };
  const directory = mkdtempSync(join(tmpdir(), "headplane-maintenance-test-"));
  try {
    for (const name of ["docs-root.tar.gz", "docs-archive.tar.gz"])
      writeFileSync(join(directory, name), "bilingual documentation");
    writeFileSync(
      join(directory, "final.json"),
      JSON.stringify({
        target: "final",
        digest: `sha256:${"a".repeat(64)}`,
      }),
    );
    const manifest = bundle(maintenance, directory, directory);
    assert.equal(manifest.upstream.version, "0.8.2");
    assert.equal(manifest.communityRelease.version, "0.8.3");
    const notes = readFileSync(join(directory, "release-notes.md"), "utf8");
    assert.ok(notes.includes(maintenance.communityRelease.notes.en));
    assert.ok(notes.includes(maintenance.communityRelease.notes["zh-CN"]));
    const files = new Map(
      ["docs-root.tar.gz", "docs-archive.tar.gz", "release-manifest.json", "SHA256SUMS"].map(
        (name) => [name, readFileSync(join(directory, name))],
      ),
    );
    const release = { tag_name: "v0.8.3-zh", draft: false, prerelease: false, immutable: true };
    assert.equal(
      validateSnapshot(release, files, maintenance, manifest.sourceCommit, release.tag_name)
        .pullReference,
      "ghcr.io/laity-cqf/headplane-zh-cn:v0.8.3",
    );
    assert.throws(() =>
      validateSnapshot(
        release,
        files,
        {
          ...maintenance,
          communityRelease: {
            ...maintenance.communityRelease,
            notes: { en: "Changed", "zh-CN": "已改动" },
          },
        },
        manifest.sourceCommit,
        release.tag_name,
      ),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("release archives bind the exact Git source, the final image digest and documentation checksums", () => {
  const directory = mkdtempSync(join(tmpdir(), "headplane-release-test-"));
  try {
    for (const name of ["docs-root.tar.gz", "docs-archive.tar.gz"])
      writeFileSync(join(directory, name), "documentation snapshot");
    for (const target of ["final"])
      writeFileSync(
        join(directory, `${target}.json`),
        JSON.stringify({ target, digest: `sha256:${"a".repeat(64)}` }),
      );
    const manifest = bundle(state, directory, directory);
    assert.equal(
      manifest.sourceCommit,
      execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    );
    assert.deepEqual(
      manifest.images.map((image) => image.reference),
      ["ghcr.io/laity-cqf/headplane-zh-cn:v0.8.2"],
    );
    assert.equal(manifest.schemaVersion, 2);
    assert.equal(
      manifest.sourceArchives.tar,
      "https://github.com/laity-cqf/headplane-zh-cn/archive/refs/tags/v0.8.2-zh.tar.gz",
    );
    assert.deepEqual(Object.keys(manifest.assets).sort(), [
      "docs-archive.tar.gz",
      "docs-root.tar.gz",
    ]);
    for (const [name, record] of Object.entries(manifest.assets))
      assert.equal(
        record.sha256,
        createHash("sha256")
          .update(readFileSync(join(directory, name)))
          .digest("hex"),
      );
    assert.equal(readFileSync(join(directory, "SHA256SUMS"), "utf8").trim().split("\n").length, 3);
    assert.ok(
      readFileSync(join(directory, "release-notes.md"), "utf8").includes(
        "not an official Chinese edition",
      ),
    );
    writeFileSync(
      join(directory, "final.json"),
      JSON.stringify({ target: "debug-shell", digest: `sha256:${"b".repeat(64)}` }),
    );
    assert.throws(() => bundle(state, directory, directory), /digest record/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("community tags follow the exact upstream version without a revision suffix", () => {
  assert.deepEqual(parseTag("v0.8.2-zh").parts, [0, 8, 2]);
  for (const tag of [
    "v0.8.2",
    "v0.8.2-beta.1",
    "v0.8.2-zh.1",
    "v00.8.2-zh",
    "v0.8.02-zh",
    "v0.8.2-zh-shell",
    "--delete",
  ])
    assert.throws(() => parseTag(tag));
  assert.equal(validateTag(state, "v0.8.2-zh", "0.8.2").version, "0.8.2");
  assert.equal(metadata(state).image, "ghcr.io/laity-cqf/headplane-zh-cn");
  for (const bad of [
    { channel: "development" },
    { publicationReady: false },
    { upstream: { ...state.upstream, version: "0.8.3" } },
  ])
    assert.throws(() => validateTag({ ...state, ...bad }, "v0.8.2-zh", "0.8.2"));
  assert.throws(() => validateTag(state, "v0.8.2-zh", "0.8.1"));
  assert.throws(() => validateState({ ...state, repository: "tale/headplane" }));
  assert.throws(() => validateState({ ...state, revision: 1 }));
});

test("account rename keeps historical metadata readable but forbids publishing legacy or unrelated repositories", () => {
  const legacy = { ...state, repository: "CM-Chenqf/headplane-zh-cn" };
  assert.throws(() => validateTag(legacy, "v0.8.2-zh", "0.8.2"));
  assert.throws(() => metadata(legacy));
  assert.equal(metadata(legacy, { allowLegacy: true }).image, "ghcr.io/cm-chenqf/headplane-zh-cn");
  assert.throws(() => validateState({ ...state, repository: "other/fork" }, { allowLegacy: true }));
});

test("latest follows numeric upstream versions and ignores inherited, revision, draft and beta tags", () => {
  const published = (tag_name, rest = {}) => ({
    tag_name,
    published_at: "2026-11-16",
    draft: false,
    prerelease: false,
    ...rest,
  });
  assert.deepEqual(
    publishedVersions([
      published("v9.0.0"),
      published("v0.8.2-zh.1"),
      published("v0.8.2-zh"),
      published("v0.8.10-zh"),
      published("v0.9.0-zh"),
      published("v1.0.0-zh", { draft: true }),
      published("v2.0.0-zh", { prerelease: true }),
      published("v3.0.0-zh", { published_at: null }),
    ]),
    ["v0.9.0-zh", "v0.8.10-zh", "v0.8.2-zh"],
  );
});

test("registry auth, rate limit, network and server failures never authorize overwriting a tag", () => {
  assert.equal(imageMissing(404, { errors: [{ code: "MANIFEST_UNKNOWN" }] }), true);
  for (const [status, body] of [
    [401, { errors: [{ code: "UNAUTHORIZED" }] }],
    [403, {}],
    [429, {}],
    [500, {}],
    [404, {}],
    [404, { errors: [] }],
    [404, { errors: [{ code: "DENIED" }] }],
    [200, {}],
  ])
    assert.equal(imageMissing(status, body), false);
});
