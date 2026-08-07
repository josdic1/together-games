import { BrowserRouter, Route, Routes } from "react-router-dom";
import MemoryPage from "../games/memory/MemoryPage";
import CopyMePage from "../games/copy-me/CopyMePage";
import SpotTheDifferencePage from "../games/spot-the-difference/SpotTheDifferencePage";
import GameLibraryPage from "../pages/GameLibraryPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GameLibraryPage />} />
        <Route path="/games/memory" element={<MemoryPage />} />
        <Route path="/games/copy-me" element={<CopyMePage />} />
        <Route
          path="/games/spot-the-difference"
          element={<SpotTheDifferencePage />}
        />
      </Routes>
    </BrowserRouter>
  );
}
