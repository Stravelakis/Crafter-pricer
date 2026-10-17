# Standards

This repo follows strav's repo standards (`repo standards/STANDARDS.md` in CLAUDE SPACE; copy in the Blacksmith repo at `standards/STANDARDS.md`).

Differences for this repo:

- **No installer** (§6 does not apply): MarginCraft is a website.
- **Hosting is Cloudflare Pages** (planned; see DEPLOY.md).
- **Local dev port:** 26419 (to record in PORTS.md).
- **Docs site (§7):** built early (owner's request) in `docs-site/` from the langplay copy of the theme, at https://dnd-world.github.io/Crafter-pricer/. The "Try it" section runs the app's real pricing engine (`src/lib/calc.ts`) instead of the code playground, which only suits code libraries.
- **Version badge** is static while the repo is private (shields.io can't read private repos); switch to a dynamic badge when public.
- **No Dockerfile** (§5): static site.
