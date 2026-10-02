export type GameMode = 'solo' | 'cooperative' | 'alternating' | 'simultaneous' | 'versus'

export type GameCatalogEntry = {
  id: string
  slug: string
  title: string
  mode: GameMode
  menuArt: string
  legacyPaths?: readonly string[]
}

export const gameCatalog = [
  { id: 'memory', slug: 'memory', title: 'Memory', mode: 'alternating', menuArt: '/art/menu-original/memory.png' },
  { id: 'copy-me', slug: 'copy-me', title: 'Copy Me', mode: 'alternating', menuArt: '/art/menu-original/copy-me.png' },
  { id: 'spot-it', slug: 'spot-the-difference', title: 'Spot It!', mode: 'cooperative', menuArt: '/art/menu-original/spot-it.png' },
  { id: 'cake-drop', slug: 'cake-drop', title: 'Cake Drop', mode: 'alternating', menuArt: '/art/menu-original/cake-drop.png' },
  { id: 'parker', slug: 'parker', title: 'Parker', mode: 'solo', menuArt: '/art/menu-original/parker.png' },
  { id: 'find-unicorn', slug: 'find-the-unicorn', title: 'Find Unicorn', mode: 'cooperative', menuArt: '/art/menu-original/find-unicorn.png' },
  { id: 'bug-jump', slug: 'bug-jump', title: 'Bug Jump', mode: 'solo', menuArt: '/art/menu-original/bug-jump.png' },
  { id: 'find-floor', slug: 'find-the-floor', title: 'Find the Floor', mode: 'cooperative', menuArt: '/art/menu-original/find-floor.png' },
  { id: 'bubble-pop', slug: 'bubble-pop', title: 'Bubble Pop', mode: 'cooperative', menuArt: '/art/menu-original/bubble-pop.png' },
  { id: 'tug-of-war', slug: 'tug-of-war', title: 'Tug of War', mode: 'simultaneous', menuArt: '/art/menu-original/tug-of-war.png' },
  { id: 'whack-bug', slug: 'whack-bug', title: 'Whack Bug', mode: 'solo', menuArt: '/art/menu-original/whack-bug.png' },
  { id: 'snail-race', slug: 'snail-race', title: 'Snail Race', mode: 'solo', menuArt: '/art/menu-original/snail-race.png' },
  { id: 'octo-stack', slug: 'octo-stack', title: 'Octo Stack', mode: 'cooperative', menuArt: '/art/menu-original/octo-stack.png' },
  { id: 'unicorn-dash', slug: 'unicorn-dash', title: 'Unicorn Dash', mode: 'solo', menuArt: '/art/menu-original/unicorn-dash.png' },
  { id: 'parker-wash', slug: 'parker-wash', title: 'Parker Wash', mode: 'cooperative', menuArt: '/art/menu-original/parker-wash.png' },
  {
    id: 'skateboard-wheels',
    slug: 'skateboard-wheels',
    title: 'Skateboard Wheels',
    mode: 'cooperative',
    menuArt: '/art/menu-new/skateboard-wheels.svg',
    legacyPaths: ['/games/freeze-dance'],
  },
  { id: 'connect-four', slug: 'connect-four', title: 'Connect Four', mode: 'alternating', menuArt: '/art/menu-new/connect-four.svg' },
  {
    id: 'rosie-bakery',
    slug: 'rosies-bakery',
    title: 'Wizard Douglas Bakery',
    mode: 'alternating',
    menuArt: '/art/menu-new/rosie-bakery.svg',
    legacyPaths: ['/games/richie-bakery'],
  },
  { id: 'water-router', slug: 'water-router', title: 'Water Router', mode: 'cooperative', menuArt: '/art/menu-new/water-router.svg' },
  { id: 'evening-walk', slug: 'evening-walk', title: 'Evening Walk', mode: 'cooperative', menuArt: '/art/menu-new/evening-walk.svg' },
] as const satisfies readonly GameCatalogEntry[]

export type GameId = (typeof gameCatalog)[number]['id']
export type Game = (typeof gameCatalog)[number]

export function gamePath(game: Pick<GameCatalogEntry, 'slug'>) {
  return `/games/${game.slug}`
}

export function findGameByPath(pathname: string): Game | undefined {
  return gameCatalog.find((game) => gamePath(game) === pathname)
}
