# Release checklist

The current package version is 0.2.0. Do not label it production-verified until the live acceptance checks in VALIDATION.md are complete.

1. Run `npm ci`, `npm run build`, `npm test`, and the Chromium browser project with `npm run test:browser`. Confirm the compiled bundle matches the checked-in asset.
2. Complete live Home Assistant and HACS acceptance on a separate test dashboard; keep the existing installation intact.
3. Confirm the GitHub repository is public, with a concise description and topics such as `home-assistant`, `lovelace-custom-card`, and `hacs`.
4. Run the manual **HACS validation** GitHub workflow. Resolve validation results before claiming acceptance.
5. Review screenshots, accessibility, documentation, and remaining compatibility notes. Record actual Home Assistant, HACS and browser versions tested.
6. Update package version and changelog, rebuild, and commit source, lockfile, documentation, screenshots, and `magical-family-clock.js` together.
7. Push a matching `v0.2.0` tag only after acceptance. The release workflow checks version equality, runs tests in Chromium, and attaches `magical-family-clock.js` to the GitHub release using its workflow token.
8. Test installation and an update through HACS. Public default-store submission is separate and requires HACS review; no approval is implied by custom-repository installation.

The environment’s Git read operation and dry-run push succeeded. Its injected GitHub CLI token failed authentication; no token values were inspected. A release cannot currently be created through that CLI. Do not put tokens into source or setup instructions. Use authorized GitHub credentials or the repository’s GitHub Actions release workflow after acceptance.

The release candidate is published separately from a stable production release. Check the repository release page for the actual workflow result; a local tag or pushed workflow alone does not establish release publication.
