# Release checklist

The current package version is **0.4.1 — Crafted Living World**. Visual review is complete and the user authorized proceeding after omitting F01. Record verification accurately; publication does not establish acceptance on every browser or a user's HACS instance.

1. Install from the lockfile with `npm ci`, then run `npm run build`, `npm test` and `npm run test:browser`. System Chromium may be selected with `MFC_CHROMIUM=/usr/bin/chromium`.
2. Check the production bundle is deterministic and self-contained. Confirm `hacs.json` points to the root `magical-family-clock.js`.
3. Review real Home Assistant evidence, screenshots, guides, compatibility and size limits. Keep the separate original clock and the user's installation intact.
4. Confirm the public repository metadata and HACS validation results. Missing About description/topics require repository-owner permissions; document these separately from package tests.
5. Update package/lockfile versions, changelog and release notes. Commit source, assets, tests, guides, evidence and the compiled bundle together.
6. Push the reviewed commit to `main` and run/check its **Test and package** workflow.
7. With the user's release authorization, push the matching `v0.4.1` tag. The **Release** workflow verifies version equality and the compiled artifact, runs unit/browser checks and attaches `magical-family-clock.js` to a stable GitHub release using its workflow token.
8. Verify the release is published, not a draft/prerelease, and that the downloaded asset matches the tested bundle byte for byte. Record workflow URLs, release commit and SHA-256 in `PUBLISHING-STATUS.md`.
9. Install/update through HACS in an authorized connected instance when available. Default-store submission is separate; do not claim HACS approval or an authenticated update without evidence.

Git push and GitHub API reads work through platform authentication. Repository metadata writes return HTTP 403 (integration permissions); never put credentials in source or documentation. A pushed tag alone is not proof that release publication succeeded.
