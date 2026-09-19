import neo4j from 'neo4j-driver';

async function test() {
  const uri = 'neo4j+s://84bb0d69.databases.neo4j.io';
  const user = '84bb0d69';
  const pass = 'dYjWtbJQBQNIHaQMos_-Q-unrpkbytKpW_1Be-Ba5Uo';

  console.log('Connecting to', uri);
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, pass), {
    disableLosslessIntegers: true,
  });

  try {
    const serverInfo = await driver.getServerInfo();
    console.log('Connection successful!', serverInfo);
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await driver.close();
  }
}

test();
