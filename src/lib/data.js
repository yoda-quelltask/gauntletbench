import raw from '../data/gauntlet-data.json';

export const data = raw;

/** Axis display order: G A U N T L E T clockwise from top. */
export const AXIS_ORDER = ['g', 'a', 'u', 'n', 't', 'l', 'e', 'tp'];

export const axisMeta = Object.fromEntries(raw.axes.map((a) => [a.key, a]));
export const suitesById = Object.fromEntries(raw.suites.map((s) => [s.id, s]));

/** Default leaderboard order: axes_scored desc, then Generalist score desc. */
export const rankedModels = [...raw.models].sort(
  (a, b) =>
    b.axes_scored - a.axes_scored ||
    (b.axes.g ?? -1) - (a.axes.g ?? -1)
);

/** Format a 0-100 axis value: trim trailing .0 */
export function fmtAxis(v) {
  if (v == null) return null;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

/** Format any number with up to 1 decimal, trimming .0 */
export function fmt1(v) {
  if (v == null) return null;
  const r = Math.round(v * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

/** Color band class for a 0-100 axis score. */
export function scoreClass(v) {
  if (v == null) return 'na';
  if (v >= 90) return 'hi';
  if (v >= 75) return 'good';
  if (v >= 50) return 'mid';
  return 'low';
}

/** Human timestamp from generated_at, e.g. "2026-08-17 02:05 UTC" */
export const generatedAt = raw.generated_at.slice(0, 16).replace('T', ' ') + ' UTC';

export const GITHUB_URL = 'https://github.com/davelessa/gauntletbench';
export const ISSUES_URL = 'https://github.com/davelessa/gauntletbench/issues';
