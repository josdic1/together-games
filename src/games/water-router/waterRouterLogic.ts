export type WaterCell = { row: number; col: number }
export type WaterDirection = { dr: number; dc: number }
export type WaterPhase = 'flowing' | 'lost' | 'escaped'
export type WaterFlow = { path: WaterCell[]; direction: WaterDirection; phase: WaterPhase }

export const WATER_RIGHT: WaterDirection = { dr: 0, dc: 1 }
const WATER_DIRS: WaterDirection[] = [
  WATER_RIGHT,
  { dr: 1, dc: 0 },
  { dr: -1, dc: 0 },
  { dr: 0, dc: -1 },
]

export function waterCellKey(cell: WaterCell) {
  return `${cell.row}:${cell.col}`
}

function sameDirection(a: WaterDirection, b: WaterDirection) {
  return a.dr === b.dr && a.dc === b.dc
}

export function freshWaterFlow(rows: number): WaterFlow {
  return {
    path: [{ row: Math.floor(rows / 2), col: 0 }],
    direction: WATER_RIGHT,
    phase: 'flowing',
  }
}

export function advanceWaterFlow(
  current: WaterFlow,
  blocks: ReadonlySet<string>,
  rows: number,
  cols: number,
): WaterFlow {
  if (current.phase !== 'flowing') return current

  const currentCell = current.path[current.path.length - 1]
  if (!currentCell) return { ...current, phase: 'lost' }

  const reverse = { dr: -current.direction.dr, dc: -current.direction.dc }
  const options = [
    current.direction,
    ...WATER_DIRS.filter(
      (candidate) =>
        !sameDirection(candidate, current.direction) &&
        !sameDirection(candidate, reverse),
    ),
  ]

  for (const candidate of options) {
    const next = {
      row: currentCell.row + candidate.dr,
      col: currentCell.col + candidate.dc,
    }

    if (next.col >= cols) return { ...current, direction: candidate, phase: 'escaped' }
    if (next.row < 0 || next.row >= rows || next.col < 0) continue

    const nextKey = waterCellKey(next)
    if (blocks.has(nextKey)) continue
    if (current.path.some((cell) => waterCellKey(cell) === nextKey)) {
      return { ...current, phase: 'lost' }
    }

    return {
      path: [...current.path, next],
      direction: candidate,
      phase: 'flowing',
    }
  }

  return { ...current, phase: 'lost' }
}
