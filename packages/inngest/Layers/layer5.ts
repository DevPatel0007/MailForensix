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

export async function getCampaignCluster(gmailMessageId: string) {
  const driver = await connectNeo4j();
  const session = driver.session();

  try {
    const query = `
      MATCH (e1:Email { id: $gmailMessageId })
      
      OPTIONAL MATCH (e1)-[:HAS_DOMAIN]->(d:Domain)
      OPTIONAL MATCH (e1)-[:HAS_IP]->(ip:IP)
      OPTIONAL MATCH (sender:Person)-[:SENT]->(e1)
      
      OPTIONAL MATCH (e2_domain:Email)-[:HAS_DOMAIN]->(d) WHERE e2_domain.id <> e1.id
      OPTIONAL MATCH (e2_ip:Email)-[:HAS_IP]->(ip) WHERE e2_ip.id <> e1.id
      OPTIONAL MATCH (sender)-[:SENT]->(e2_sender:Email) WHERE e2_sender.id <> e1.id
      
      WITH e1, collect(DISTINCT e2_domain) + collect(DISTINCT e2_ip) + collect(DISTINCT e2_sender) AS raw_related
      UNWIND raw_related AS related_email
      WITH e1, DISTINCT related_email
      WHERE related_email IS NOT NULL
      
      RETURN {
        id: related_email.id,
        subject: related_email.subject,
        date: related_email.date
      } AS relatedEmail
    `;

    const result = await session.run(query, { gmailMessageId });
    return result.records.map(record => record.get("relatedEmail"));
  } catch (error) {
    console.error("Error retrieving campaign cluster from Neo4j:", error);
    return [];
  } finally {
    await session.close();
  }
}
