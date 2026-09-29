import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom'

import GameLibraryPage from '../pages/GameLibraryPage'

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
import FreezeDancePage from '../games/freeze-dance/FreezeDancePage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<GameLibraryPage />}
        />

        <Route
          path="/games/memory"
          element={<MemoryPage />}
        />

        <Route
          path="/games/copy-me"
          element={<CopyMePage />}
        />

        <Route
          path="/games/spot-the-difference"
          element={<SpotTheDifferencePage />}
        />

        <Route
          path="/games/cake-drop"
          element={<CakeDropPage />}
        />

        <Route
          path="/games/parker"
          element={<ParkerPage />}
        />

        <Route
          path="/games/find-the-unicorn"
          element={<FindTheUnicornPage />}
        />

        <Route
          path="/games/bug-jump"
          element={<BugJumpPage />}
        />

        <Route
          path="/games/find-the-floor"
          element={<FindTheFloorPage />}
        />

        <Route
          path="/games/tug-of-war"
          element={<TugOfWarPage />}
        />

        <Route
          path="/games/bubble-pop"
          element={<BubblePopPage />}
        />

        <Route path="/games/whack-bug" element={<WhackBugPage />} />
        <Route path="/games/snail-race" element={<SnailRacePage />} />
        <Route path="/games/octo-stack" element={<OctoStackPage />} />
        <Route path="/games/unicorn-dash" element={<UnicornDashPage />} />
        <Route path="/games/parker-wash" element={<ParkerWashPage />} />
        <Route path="/games/freeze-dance" element={<FreezeDancePage />} />
      </Routes>
    </BrowserRouter>
  )
}
