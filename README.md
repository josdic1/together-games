# Together Games

Together Games is a local-first collection of small illustrated games designed for two people to play side-by-side on a phone, tablet, or computer.

## Product rules

- The game library is the source of discovery; individual games stay visually distinct.
- Every game declares one real interaction mode: `solo`, `cooperative`, `alternating`, `simultaneous`, or `versus`.
- The shared player dock only appears when the game actually uses two people.
- Player names persist locally. Games must keep working if browser storage is unavailable.
- Color can reinforce state, but text or shape must also communicate it.
- Reduced-motion preferences are respected globally.

## Architecture

`src/app/gameCatalog.ts` is the product source of truth for game identity, canonical route, mode, and menu artwork.

`src/app/gameRegistry.tsx` maps every catalog ID to exactly one React component. The typed `Record<GameId, ComponentType>` intentionally makes an incomplete registration a TypeScript error.

`src/shared/GamePlayers.tsx` owns shared player names and game status. Solo games do not show the two-player dock.

`src/shared/storage.ts` is the only allowed direct `localStorage` boundary. It converts storage failures into safe fallbacks instead of gameplay crashes.

Pure game rules should live outside React components and be tested directly. Connect Four and Water Router are the first examples.

## Commands

```bash
npm ci
npm run dev
npm test
npm run lint
npm run build
```

The test command currently verifies:

- game IDs and routes are unique
- every catalog game has menu artwork
- legacy aliases do not collide with canonical routes
- Connect Four horizontal, vertical, and diagonal winner detection
- Water Router movement, turning, escape, and self-collision behavior

## Adding a game

1. Add its metadata to `src/app/gameCatalog.ts`.
2. Add its component to `componentByGameId` in `src/app/gameRegistry.tsx`.
3. Choose the correct game mode rather than defaulting to two-player behavior.
4. Add menu artwork under `public/art`.
5. Put deterministic rules in a pure module when possible and add tests.
6. Run `npm test`, `npm run lint`, and `npm run build` before shipping.

## Canonical naming

Current product names are authoritative. Historical names are not used internally.

- `/games/skateboard-wheels` is canonical. `/games/freeze-dance` temporarily redirects.
- `/games/rosies-bakery` is canonical. `/games/richie-bakery` temporarily redirects.

Those redirects are compatibility shims only and can be removed after old links are no longer in circulation.
