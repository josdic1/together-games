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
      </Routes>
    </BrowserRouter>
  )
}
