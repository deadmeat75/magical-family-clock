#!/usr/bin/env bash
set -euo pipefail
: "${RELEASE_TAG:?Set RELEASE_TAG to the tested release tag}"
node --input-type=module <<'JS'
import {readFileSync,existsSync} from 'node:fs';
const version=JSON.parse(readFileSync('package.json')).version;
const hacs=JSON.parse(readFileSync('hacs.json'));
if(process.env.RELEASE_TAG!==`v${version}`)throw Error('Tag/package mismatch');
if(!hacs.content_in_root || hacs.filename!=='magical-family-clock.js' || !existsSync(hacs.filename))throw Error('HACS needs the committed root bundle');
JS
sha256sum magical-family-clock.js
release_record=$(mktemp)
trap 'rm -f "$release_record"' EXIT
require_no_assets() {
  node --input-type=module - "$release_record" <<'JS'
import {readFileSync} from 'node:fs';
const release=JSON.parse(readFileSync(process.argv[2]));
if(!Array.isArray(release.assets) || release.assets.length)throw Error('Refusing an asset-bearing release: HACS must use the tagged root file. Existing published assets will not be removed automatically.');
JS
}
release_flags=(--latest)
if [[ "$RELEASE_TAG" == *-* ]]; then release_flags=(--prerelease --latest=false); fi
if gh release view "$RELEASE_TAG" --json assets > "$release_record"; then
  require_no_assets
  gh release edit "$RELEASE_TAG" --draft=false "${release_flags[@]}"
else
  # No file arguments: HACS falls back to raw.githubusercontent.com at this tag,
  # bypassing GitHub release redirects with headers too large for HACS 2.0.5.
  gh release create "$RELEASE_TAG" --verify-tag --notes-file docs/RELEASE-NOTES.md --title "Magical Family Clock $RELEASE_TAG" "${release_flags[@]}"
fi
gh release view "$RELEASE_TAG" --json assets > "$release_record"
require_no_assets
