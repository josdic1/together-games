import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import GameLibraryPage from '../pages/GameLibraryPage'
import { GamePlayersProvider } from '../shared/GamePlayers'
import { findGameByPath, gamePath } from './gameCatalog'
import { gameRegistry } from './gameRegistry'

function GameRoutes() {
  const location = useLocation()
  const game = findGameByPath(location.pathname)

  return (
    <GamePlayersProvider key={location.pathname} game={game}>
      <Routes>
        <Route path="/" element={<GameLibraryPage />} />
        {gameRegistry.map(({ id, Component, ...definition }) => (
          <Route key={id} path={gamePath(definition)} element={<Component />} />
        ))}
        {gameRegistry.flatMap((gameDefinition) =>
          (gameDefinition.legacyPaths ?? []).map((legacyPath) => (
            <Route
              key={legacyPath}
              path={legacyPath}
              element={<Navigate replace to={gamePath(gameDefinition)} />}
            />
          )),
        )}
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </GamePlayersProvider>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <GameRoutes />
    </BrowserRouter>
  )
}
