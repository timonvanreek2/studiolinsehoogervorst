export function parseDimensions(url: string): { width: number; height: number } | null {
  const match = url.match(/-(\d+)x(\d+)\.\w+(\?|$)/)
  if (!match) return null
  return { width: parseInt(match[1]), height: parseInt(match[2]) }
}
