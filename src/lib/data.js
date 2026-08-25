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

export const GITHUB_URL = 'https://github.com/Yoda-quelltask/gauntletbench';
export const ISSUES_URL = 'https://github.com/Yoda-quelltask/gauntletbench/issues';

/* ---------- schema v2 additions ---------- */

/** Suite → GAUNTLET axis mapping (formal designation, fixed editorially). */
export const SUITE_AXIS = {
  '1a': 'g', '1b': 'a', '1c': 'e', '1d': 'u', '1d2': 'u',
  '1e': 'g', '1g': 'n', '1g2': 'n', '1h': 'l', '1i': 'l',
};

const scoringLabel = (s) => (s === 'claude-judge-0-20' ? 'LLM-judged 0–20' : s);

/** One-line formal descriptor, e.g. "Live one-shot builds (runtime-verified) — 4 tests, LLM-judged 0–20". */
export function suiteDescriptor(suite) {
  if (!suite) return null;
  return `${suite.name} — ${suite.test_count} tests, ${scoringLabel(suite.scoring)}`;
}

/**
 * Parse a rounds-frontmatter suite string ("1H", "1A/1B", "1I") into
 * designation objects: suite chip label, display name, axis badge, descriptor.
 */
export function parseSuiteDesignation(str) {
  if (!str) return [];
  return String(str)
    .split(/[\/,+\s]+/)
    .filter(Boolean)
    .map((tok) => {
      const id = tok.toLowerCase();
      const suite = suitesById[id] ?? null;
      const axisKey = SUITE_AXIS[id] ?? null;
      return {
        id,
        label: tok.toUpperCase(),
        name: suite?.name ?? null,
        descriptor: suiteDescriptor(suite),
        axisKey,
        axisLetter: axisKey ? axisMeta[axisKey].letter : null,
        axisName: axisKey ? axisMeta[axisKey].name : null,
      };
    });
}

/** Build-time site stats for the hero. */
export const siteStats = {
  models: raw.models.length,
  suites: raw.suites.length,
  perTestResults: raw.models.reduce(
    (n, m) =>
      n + Object.values(m.suites).reduce((k, c) => k + (c.per_test?.length ?? 0), 0),
    0
  ),
};

/** Tooltip for the small-model class chip. */
export const SMALL_TIP =
  'Under 8B total parameters — phone/edge class. Scored on the same suites; compare within class.';
