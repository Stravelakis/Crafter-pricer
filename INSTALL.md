# Install: Crafter-pricer (MarginCraft)

## Web

Not hosted yet. Once it is, nothing to install: open the link in README.md.

## From source

### Requirements

- [Bun](https://bun.sh) 1.4+
- [Git](https://git-scm.com)
- [gitleaks](https://github.com/gitleaks/gitleaks#installing) for the pre-commit secret check

### Steps

```bash
git clone https://github.com/Stravelakis/Crafter-pricer.git
cd Crafter-pricer
git config core.hooksPath githooks
bun install
bun run dev
```

Open http://localhost:26419. No `.env` is needed (see `.env.example`).

On macOS/Linux also run `chmod +x githooks/pre-commit` once.

### Check it works

The Studio opens with the "Pro studio" preset and a unit price in the top-right corner.

```bash
bun run test        # 32 tests
bun run lint
bun run typecheck
bun run build       # output in dist/
```
