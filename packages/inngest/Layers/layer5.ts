import { connectNeo4j } from "@repo/neo4j";

export interface Layer5Input {
  gmailMessageId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  senderIp?: string;
  domain?: string;
}

export async function analyzeLayer5(input: Layer5Input) {
  const driver = await connectNeo4j();
  const session = driver.session();

  try {
    const query = `
      // 1. Create/Match the Sender and Recipient Person nodes
      MERGE (sender:Person { email: $from })
      MERGE (recipient:Person { email: $to })

      // 2. Create the Email node
      MERGE (email:Email { id: $gmailMessageId })
      SET email.subject = $subject, email.date = $date

      // 3. Connect Person -> Email
      MERGE (sender)-[:SENT]->(email)
      MERGE (email)-[:RECEIVED_BY]->(recipient)

      // 4. Handle Domain (if provided)
      WITH email, sender, recipient
      CALL {
        WITH email
        WITH email WHERE $domain IS NOT NULL
        MERGE (d:Domain { name: $domain })
        MERGE (email)-[:HAS_DOMAIN]->(d)
        RETURN count(*) AS d_count
      }

      // 5. Handle Sender IP (if provided)
      WITH email
      CALL {
        WITH email
        WITH email WHERE $senderIp IS NOT NULL
        MERGE (ip:IP { address: $senderIp })
        MERGE (email)-[:HAS_IP]->(ip)
        RETURN count(*) AS ip_count
      }

      RETURN email.id AS id
    `;

    const result = await session.run(query, {
      gmailMessageId: input.gmailMessageId,
      from: input.from,
      to: input.to,
      subject: input.subject || "No Subject",
      date: input.date || new Date().toISOString(),
      domain: input.domain || null,
      senderIp: input.senderIp || null,
    });

    return {
      success: true,
      recordsCreated: result.records.length,
    };
  } catch (error) {
    console.error("Error persisting Layer 5 to Neo4j:", error);
    throw error;
  } finally {
    await session.close();
  }
}
