// GitHub metadata may use authentication; asset downloads and image pulls do not.
const assert = require("node:assert/strict");
const { createHash } = require("node:crypto");
const { mkdirSync, readFileSync, writeFileSync } = require("node:fs");
const { resolve, join } = require("node:path");
const { REPOSITORY, metadata, validateState, parseTag, run } = require("./fork-release.cjs");

function validateSnapshot(release, files, state, sha, tag) {
  // Immutable snapshots retain the owner recorded when they were published.
  const meta = metadata(state, { allowLegacy: true });
  assert.equal(tag, meta.tag);
  assert.equal(release.tag_name, tag);
  assert.equal(release.draft, false);
  assert.equal(release.prerelease, false);
  assert.equal(release.immutable, true);
  const manifest = JSON.parse(files.get("release-manifest.json"));
  assert.ok([1, 2].includes(manifest.schemaVersion), "Unknown release manifest schema");
  const assets = ["docs-root.tar.gz", "docs-archive.tar.gz"];
  if (manifest.schemaVersion === 1) assets.unshift("source.tar.gz");
  const expected = [...assets, "release-manifest.json"].sort();
  const checked = new Set();
  for (const line of files.get("SHA256SUMS").toString("utf8").trim().split("\n")) {
    const match = /^([a-f0-9]{64})  ([a-zA-Z0-9.-]+)$/.exec(line);
    assert.ok(match && expected.includes(match[2]), "Invalid checksum entry");
    assert.ok(!checked.has(match[2]), "Duplicate checksum entry");
    checked.add(match[2]);
    assert.equal(createHash("sha256").update(files.get(match[2])).digest("hex"), match[1]);
  }
  assert.deepEqual([...checked].sort(), expected);
  assert.deepEqual(Object.keys(manifest.assets).sort(), assets.sort());
  for (const name of assets)
    assert.equal(
      manifest.assets[name].sha256,
      createHash("sha256").update(files.get(name)).digest("hex"),
    );
  assert.equal(manifest.tag, tag);
  assert.equal(manifest.repository, state.repository);
  assert.equal(manifest.sourceCommit, sha);
  assert.deepEqual(manifest.upstream, state.upstream);
  assert.deepEqual(manifest.communityRelease, state.communityRelease);
  assert.equal(manifest.unofficial, true);
  const targets = manifest.schemaVersion === 1 ? ["final", "debug-shell"] : ["final"];
  assert.deepEqual(manifest.images.map((image) => image.target).sort(), targets.sort());
  for (const image of manifest.images) {
    assert.equal(
      image.reference,
      manifest.schemaVersion === 1
        ? `${meta.image}:${meta.tag}${image.target === "final" ? "" : "-shell"}`
        : `${meta.image}:${meta.image_tag}`,
    );
    assert.match(image.digest, /^sha256:[a-f0-9]{64}$/);
    assert.deepEqual(image.platforms, ["linux/amd64", "linux/arm64"]);
  }
  if (manifest.schemaVersion === 2) {
    assert.deepEqual(manifest.sourceArchives, {
      zip: `https://github.com/${state.repository}/archive/refs/tags/${tag}.zip`,
      tar: `https://github.com/${state.repository}/archive/refs/tags/${tag}.tar.gz`,
    });
  }
  return {
    pullReference: `ghcr.io/${REPOSITORY}:${meta.image_tag}`,
    digest: manifest.images.find((i) => i.target === "final").digest,
  };
}

async function download(url, authenticated = false) {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, {
      headers:
        authenticated && process.env.GH_TOKEN
          ? { Authorization: `Bearer ${process.env.GH_TOKEN}` }
          : {},
      signal: AbortSignal.timeout(120_000),
    });
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    if (attempt >= 2 || ![429, 500, 502, 503, 504].includes(response.status))
      throw new Error(`Download failed: ${response.status} ${url}`);
    await new Promise((done) => setTimeout(done, 2000 * (attempt + 1)));
  }
}

async function main() {
  const state = validateState(JSON.parse(readFileSync(".github/fork-release.json", "utf8")), {
    allowLegacy: true,
  });
  const tag = process.env.RELEASE_TAG;
  parseTag(tag);
  assert.equal(tag, metadata(state, { allowLegacy: true }).tag);
  const directory = resolve(process.argv[2]);
  mkdirSync(directory, { recursive: true });
  const release = JSON.parse(
    await download(`https://api.github.com/repos/${REPOSITORY}/releases/tags/${tag}`, true),
  );
  const files = new Map();
  const names = ["docs-root.tar.gz", "docs-archive.tar.gz", "release-manifest.json", "SHA256SUMS"];
  if (release.assets.some((a) => a.name === "source.tar.gz")) names.push("source.tar.gz");
  for (const name of names) {
    const asset = release.assets.find((item) => item.name === name);
    assert.ok(asset, `Missing release asset ${name}`);
    const data = await download(asset.browser_download_url);
    files.set(name, data);
    writeFileSync(join(directory, name), data);
  }
  const result = validateSnapshot(release, files, state, run("git", ["rev-parse", "HEAD"]), tag);
  writeFileSync(
    join(directory, "verification-result.json"),
    JSON.stringify(result, null, 2) + "\n",
  );
  console.log(
    `Immutable ${tag}: source identity, bilingual docs and checksums verified; Docker ${result.pullReference}`,
  );
}

module.exports = { validateSnapshot };
if (require.main === module)
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
