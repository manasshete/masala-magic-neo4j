import neo4j, { Driver, Session } from "neo4j-driver";

let driver: Driver | null = null;

export function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;
    if (!uri || !username || !password) {
      throw new Error(
        "Missing NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD environment variables"
      );
    }
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  }
  return driver;
}

export function getSession(): Session {
  return getDriver().session();
}

const LABELS = [
  "User",
  "Preference",
  "Task",
  "Commitment",
  "Decision",
  "Reason",
  "Outcome",
  "Goal",
  "Experience",
  "Fact",
];

export async function ensureConstraints(): Promise<void> {
  const session = getSession();
  try {
    for (const label of LABELS) {
      await session.run(
        `CREATE CONSTRAINT IF NOT EXISTS FOR (n:${label}) REQUIRE n.id IS UNIQUE`
      );
    }
  } finally {
    await session.close();
  }
}

export async function verifyConnection(): Promise<boolean> {
  const session = getSession();
  try {
    await session.run("RETURN 1");
    return true;
  } finally {
    await session.close();
  }
}

export async function closeDriver(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

function serializeValue(v: unknown): unknown {
  if (v == null) return v;
  if (neo4j.isInt(v as any)) return (v as any).toNumber();
  if (
    neo4j.isDateTime(v as any) ||
    neo4j.isDate(v as any) ||
    neo4j.isLocalDateTime(v as any) ||
    neo4j.isLocalTime(v as any) ||
    neo4j.isTime(v as any) ||
    neo4j.isDuration(v as any)
  ) {
    return (v as any).toString();
  }
  if (Array.isArray(v)) return v.map(serializeValue);
  return v;
}

/** Converts a Neo4j node record into a plain JSON-serializable object, including its label. */
export function toPlainNode<T extends Record<string, unknown>>(node: any): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node.properties)) {
    out[k] = serializeValue(v);
  }
  if (node.labels && node.labels.length > 0) {
    out.label = node.labels[0];
  }
  return out as T;
}
