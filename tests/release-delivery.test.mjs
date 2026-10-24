import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
const version = JSON.parse(readFileSync("package.json")).version;
function publish(t, initial) {
  const dir = mkdtempSync(join(tmpdir(), "mfc-delivery-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const state = join(dir, "state.json");
  writeFileSync(state, JSON.stringify({ ...initial, calls: [] }));
  writeFileSync(
    join(dir, "gh"),
    `#!/usr/bin/env node
const fs=require('node:fs'),path=process.env.MFC_RELEASE_FIXTURE,state=JSON.parse(fs.readFileSync(path));
const args=process.argv.slice(2);state.calls.push(args);
if(args[1]==='create')state.exists=true;
fs.writeFileSync(path,JSON.stringify(state));
if(args[1]==='view'){if(!state.exists)process.exit(1);process.stdout.write(JSON.stringify({assets:state.assets}));}
`,
    { mode: 0o755 },
  );
  const result = spawnSync("bash", ["scripts/publish-hacs-release.sh"], {
    env: {
      ...process.env,
      PATH: dir + ":" + process.env.PATH,
      RELEASE_TAG: "v" + version,
      MFC_RELEASE_FIXTURE: state,
    },
    encoding: "utf8",
  });
  return { result, state: JSON.parse(readFileSync(state)) };
}
test("published HACS releases have no assets so the tagged root bundle is selected", (t) => {
  const { result, state } = publish(t, { exists: false, assets: [] });
  assert.equal(result.status, 0, result.stderr);
  const create = state.calls.find((args) => args[1] === "create");
  assert.ok(create.includes("--verify-tag"));
  assert.ok(!create.includes("magical-family-clock.js"));
  assert.ok(
    !state.calls.some((args) => ["upload", "delete-asset"].includes(args[1])),
  );
});
test("re-publishing a source-only release remains safe and idempotent", (t) => {
  const { result, state } = publish(t, { exists: true, assets: [] });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(state.calls.some((args) => args[1] === "edit"));
  assert.ok(!state.calls.some((args) => args[1] === "create"));
});
test("existing asset-bearing releases are refused without removing historical downloads", (t) => {
  const { result, state } = publish(t, {
    exists: true,
    assets: [{ name: "magical-family-clock.js" }],
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Refusing an asset-bearing release/);
  assert.ok(state.calls.every((args) => args[1] === "view"));
});
