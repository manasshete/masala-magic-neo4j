export interface PageRankLink {
  source: string;
  target: string;
}

/**
 * Classic power-iteration PageRank over a small in-memory directed graph.
 * Dangling nodes (no outgoing links) redistribute their mass evenly across
 * all nodes each iteration, otherwise they'd leak rank out of the system.
 */
export function computePageRank(
  nodeIds: string[],
  links: PageRankLink[],
  damping = 0.85,
  iterations = 40
): Map<string, number> {
  const n = nodeIds.length;
  if (n === 0) return new Map();

  const outLinks = new Map<string, string[]>();
  for (const id of nodeIds) outLinks.set(id, []);
  for (const { source, target } of links) {
    if (!outLinks.has(source) || !outLinks.has(target)) continue;
    outLinks.get(source)!.push(target);
  }

  let scores = new Map<string, number>(nodeIds.map((id) => [id, 1 / n]));

  for (let iter = 0; iter < iterations; iter++) {
    let danglingMass = 0;
    for (const id of nodeIds) {
      const out = outLinks.get(id)!;
      if (out.length === 0) danglingMass += scores.get(id)!;
    }

    const base = (1 - damping) / n + (damping * danglingMass) / n;
    const next = new Map<string, number>(nodeIds.map((id) => [id, base]));

    for (const id of nodeIds) {
      const out = outLinks.get(id)!;
      if (out.length === 0) continue;
      const share = (damping * scores.get(id)!) / out.length;
      for (const target of out) {
        next.set(target, next.get(target)! + share);
      }
    }

    scores = next;
  }

  return scores;
}

/** Normalizes scores to [0, 1] by dividing by the max score (min stays proportional). */
export function normalizeScores(scores: Map<string, number>): Map<string, number> {
  const max = Math.max(...scores.values(), 1e-9);
  return new Map([...scores].map(([id, s]) => [id, s / max]));
}
