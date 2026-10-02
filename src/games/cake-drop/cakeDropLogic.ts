export function doesLayerLand(dropX: number, targetX: number, landDistance: number) {
  return Math.abs(dropX - targetX) <= landDistance
}

export function getCakeDropSpeed(
  baseSpeed: number,
  layerCount: number,
  rampPerLayer: number,
  maxBonus: number,
) {
  const safeLayers = Math.max(0, layerCount)
  const bonus = Math.min(safeLayers * rampPerLayer, maxBonus)
  return baseSpeed + bonus
}
