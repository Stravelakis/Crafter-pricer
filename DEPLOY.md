# Deploy: Crafter-pricer (MarginCraft)

## Where it runs

**Cloudflare Pages** (planned, not created yet), connected to this GitHub repo. Every merge into `main` deploys to production; every PR gets its own preview URL on `*.pages.dev`.

### One-time setup (owner)

1. Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** → **Import an existing Git repository** → pick `Stravelakis/Crafter-pricer`.
2. Build settings:

   | Setting | Value |
   | --- | --- |
   | Production branch | `main` |
   | Framework preset | React (Vite) |
   | Build command | `bun install --frozen-lockfile && bun run build` |
   | Build output directory | `dist` |

3. **Settings → Variables and Secrets** (build variables, both environments):

   | Name | Value | Why |
   | --- | --- | --- |
   | `BUN_VERSION` | `1.4.2` | Same bun as CI and the lockfile |
   | `SKIP_DEPENDENCY_INSTALL` | `true` | The build command installs with the frozen lockfile instead |

4. Save and deploy. Optional: add a custom domain under **Custom domains**.

Source: [Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/), [Pages build image](https://developers.cloudflare.com/pages/configuration/build-image/).

## Docs site

https://docs.stravelakis.com/Crafter-pricer/ — built from `docs-site/` by `.github/workflows/docs-site.yml` on every `v*` tag, or by hand (Actions → Deploy docs site → Run workflow). One-time: Settings → Pages → Source: **GitHub Actions**; Settings → Environments → `github-pages` → allow tags `v*`.

## Environment variables

None for the app (see `.env.example`). Only the two build variables above.

## Release

Follow the release gate in STANDARDS.md §2 (README/HANDOFF current, full audit, `gitleaks git -v` clean, CHANGELOG entry), then:

1. Bump `version` in `package.json`, the version badge in README.md, and add the CHANGELOG entry.
2. Merge the PR into `main` (CI green). Pages deploys automatically.
3. Tag and push: `git tag vX.Y.Z && git push origin vX.Y.Z`, then create the GitHub Release (notes auto-generated, summary line by hand).

## Rollback

- Cloudflare: **Workers & Pages** → project → **Deployments** → pick the last good one → **Rollback to this deployment**.
- Git: `git revert <merge commit>` on a branch, PR, merge. Never force-push `main`.

## After deploying, check

- [ ] Studio loads and shows a price for the default preset
- [ ] Settings → Tax → Presumptive shows an effective % on the Studio price panel
- [ ] Browser dev tools → Network: no requests to fonts.googleapis.com or other unexpected hosts
- [ ] Browser console shows no errors
