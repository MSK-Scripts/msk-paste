/**
 * Tiny helper for reading integer-valued env variables.
 *
 * Returns `fallback` when the variable is missing OR cannot be parsed as a
 * finite integer. Tolerates accidental whitespace / inline comments: anything
 * after the first non-digit char is ignored (systemd's `EnvironmentFile=`
 * keeps inline `# comments` as part of the value, which would otherwise
 * yield `Number("1048576   # 1 MB")` === NaN).
 */
export function envInt(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) return fallback
  const match = raw.trim().match(/^-?\d+/)
  if (!match) return fallback
  const n = Number(match[0])
  return Number.isFinite(n) ? n : fallback
}
