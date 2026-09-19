import neo4j, { Driver } from "neo4j-driver";

let driver: Driver | null = null;

export async function connectNeo4j() {
  if (driver) return driver;

  const uri = process.env.NEO4J_URI?.trim();
  const username = process.env.NEO4J_USERNAME?.trim();
  const password = process.env.NEO4J_PASSWORD?.trim();

  if (!uri || !username || !password) {
    throw new Error(
      "Neo4j environment variables (NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD) are not fully set"
    );
  }

  driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
    disableLosslessIntegers: true,
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes (helps with Aura free tier wake-ups)
  });

  // Verify connection
  try {
    await driver.getServerInfo();
    console.log("Connected to Neo4j successfully");
  } catch (error) {
    console.error("Failed to connect to Neo4j", error);
    throw error;
  }

  return driver;
}
