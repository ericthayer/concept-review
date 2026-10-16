# DMNS · Z-space concept

A concept redesign of the Denver Museum of Nature & Science website: the museum at night, navigated
through depth. Static multi-page site, TypeScript compiled to native ES modules, custom elements in
light DOM, motion from View Transitions and scroll-driven CSS.

Not the official DMNS site. Ticketing, membership, donations and search link out to dmns.org.

## Run

Node 22+.

```sh
npm ci
npm run build      # tsc → .build/, then scripts/build.ts → dist/
npm run dev        # build + static server on http://localhost:4321
npm run check      # tsc, eslint, unit, contrast, budgets, links, Playwright + axe
```

Notices expire by build date (America/Denver). `BUILD_DATE=YYYY-MM-DD npm run build` pins it.

Status by build step is in [CHANGELOG.md](CHANGELOG.md).
