# Changelog

## Step 1 · Data + resolver

- Seed content from the brief in `content/*.json` with validating, typed loaders (`src/lib/content.ts`).
- `RoutePosition` map for every §4 route (`src/lib/coordinates.ts`) and the pure `resolveTransition`
  with unit tests for every branch.
- The Directory carries `spans: [1, 2, 3]`: it is the one room that shows every floor, so walking from it
  into a hall is `enter` and back is `exit`, as §14 requires. Without it the "floor change wins" rule
  would turn Directory → Prehistoric Journey into `ascend`, contradicting the acceptance criteria.
