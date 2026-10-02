import type { ComponentType } from 'react'
import MemoryPage from '../games/memory/MemoryPage'
import CopyMePage from '../games/copy-me/CopyMePage'
import SpotTheDifferencePage from '../games/spot-the-difference/SpotTheDifferencePage'
import CakeDropPage from '../games/cake-drop/CakeDropPage'
import ParkerPage from '../games/parker/ParkerPage'
import FindTheUnicornPage from '../games/find-the-unicorn/FindTheUnicornPage'
import BugJumpPage from '../games/bug-jump/BugJumpPage'
import FindTheFloorPage from '../games/find-the-floor/FindTheFloorPage'
import TugOfWarPage from '../games/tug-of-war/TugOfWarPage'
import BubblePopPage from '../games/bubble-pop/BubblePopPage'
import WhackBugPage from '../games/whack-bug/WhackBugPage'
import SnailRacePage from '../games/snail-race/SnailRacePage'
import OctoStackPage from '../games/octo-stack/OctoStackPage'
import UnicornDashPage from '../games/unicorn-dash/UnicornDashPage'
import ParkerWashPage from '../games/parker-wash/ParkerWashPage'
import SkateboardWheelsPage from '../games/skateboard-wheels/SkateboardWheelsPage'
import ConnectFourPage from '../games/connect-four/ConnectFourPage'
import RosiesBakeryPage from '../games/rosies-bakery/RosiesBakeryPage'
import WaterRouterPage from '../games/water-router/WaterRouterPage'
import EveningWalkPage from '../games/evening-walk/EveningWalkPage'
import { gameCatalog, type GameCatalogEntry, type GameId } from './gameCatalog'

const componentByGameId: Record<GameId, ComponentType> = {
  memory: MemoryPage,
  'copy-me': CopyMePage,
  'spot-it': SpotTheDifferencePage,
  'cake-drop': CakeDropPage,
  parker: ParkerPage,
  'find-unicorn': FindTheUnicornPage,
  'bug-jump': BugJumpPage,
  'find-floor': FindTheFloorPage,
  'bubble-pop': BubblePopPage,
  'tug-of-war': TugOfWarPage,
  'whack-bug': WhackBugPage,
  'snail-race': SnailRacePage,
  'octo-stack': OctoStackPage,
  'unicorn-dash': UnicornDashPage,
  'parker-wash': ParkerWashPage,
  'skateboard-wheels': SkateboardWheelsPage,
  'connect-four': ConnectFourPage,
  'rosie-bakery': RosiesBakeryPage,
  'water-router': WaterRouterPage,
  'evening-walk': EveningWalkPage,
}

type RegisteredGame = GameCatalogEntry & {
  id: GameId
  Component: ComponentType
}

export const gameRegistry: readonly RegisteredGame[] = gameCatalog.map((game) => ({
  ...game,
  Component: componentByGameId[game.id],
}))
