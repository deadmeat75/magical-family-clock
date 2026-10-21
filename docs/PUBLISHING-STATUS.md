# Publication status

Published release candidate: https://github.com/deadmeat75/magical-family-clock/releases/tag/v0.1.0-rc.1

The release asset `magical-family-clock.js` was downloaded independently and matches the tested local bundle byte for byte.

SHA-256: `fae2bf47822ecf6efd6341225efecf0edeb7bc38522c3c599ceb4a2447e4db10`

- Release workflow succeeded: https://github.com/deadmeat75/magical-family-clock/actions/runs/39540993481
- Tag test/package workflow succeeded: https://github.com/deadmeat75/magical-family-clock/actions/runs/39540993547
- HACS validation ran: https://github.com/deadmeat75/magical-family-clock/actions/runs/39540993546

HACS reported **6/8 checks passed**. The only failures were a missing repository description and missing topics. These are repository metadata, not application code or compiled-asset failures. No checks were disabled to force a pass.

## Owner action needed

On the GitHub repository page, edit **About** using its gear button:

- Description: `A customizable Home Assistant family-location clock card with visual setup, animated hands, and seasonal artwork.`
- Topics: `home-assistant`, `hacs`, `lovelace-custom-card`, `home-assistant-custom-card`

Save, then open **Actions → HACS validation → Run workflow**, choosing `main`. This updates repository metadata without replacing any Home Assistant files or rebuilding the release bundle.

The environment's direct GitHub API requests returned a proxy CONNECT denial. `api.github.com` was added to the saved environment draft, but applying that network change requires reviewing/saving environment settings and publishing the environment. The existing GitHub CLI authentication was not established as usable. No tokens were printed or committed.

Real Home Assistant 2026.10.2 dashboard/selector acceptance passed, and HACS 2.0.5 was installed in a disposable test instance with its setup form loading successfully. Authenticated HACS repository installation/update is still unverified and requires a real GitHub authorization connection. This candidate does not claim public default-store approval or production verification.
