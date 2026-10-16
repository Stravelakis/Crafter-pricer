# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [SemVer](https://semver.org/).

## [0.2.0] - Unreleased

### Added

- Expected period revenue setting for presumptive tax; the price panel shows the effective tax rate.
- Market search results are saved in the browser and survive a page refresh.
- Secret for the Google Sheets bridge, with a reset button.
- 32 automated tests (pricing maths, taxes, price reading, CSV export), ESLint, Prettier, CI on every PR.
- Repo standards files: HANDOFF, GUIDE, INSTALL, DEPLOY, STANDARDS, CONNECT-AGENTS, SECURITY, CODE_OF_CONDUCT, LICENSE, NOTICE, templates, Dependabot, secret-scan hook.
- Docs site (`docs-site/`, GitHub Pages) with Dev / English / ELI5 reading levels, screenshots, share card and a live calculator running the real pricing engine.
- Semantic colour tokens (`primary`, `accent`, `destructive`, …) on top of the existing palette.

### Changed

- Fonts are self-hosted instead of loaded from Google Fonts.
- Animations respect the system "reduce motion" setting; the background grid stops when idle.
- Package manager is bun; local dev port is 26419.
- Removed 10 unused libraries.

### Fixed

- Presumptive tax charged a full bracket (for example a flat yearly fee) on every single quote.
- European prices such as `1.234,56 €` were misread; `$1234.56` was read as 123; discounts and shipping costs were taken as the item price.
- The Google Sheets bridge accepted rows from anyone who had the URL.
- The optional spreadsheet ID in Settings was never sent to the bridge script.

### Security

- Sheets bridge now requires a per-install secret.
- No third-party requests for fonts (GDPR).

## [0.1.0] - 2026-09-04

### Added

- First version: machine fleet with depreciation and running cost, labor, overhead, VAT, profit and presumptive tax, margin/markup, market benchmarks, competitor search, AI machine specs and photos, offer letters, Google Sheets log, presets.
