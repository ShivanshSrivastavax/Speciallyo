import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_NEON_DATABASE_URL || "postgresql://neondb_owner:npg_7jFHJBXTW0Ct@ep-odd-feather-b3vzyjlp-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

// Initialize the Neon serverless SQL API plugin
export const sql = neon(databaseUrl);

// Helper for generating random IDs (UUID v4 format)
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Neon Serverless Direct Database API Plugin
 */
export const neonApi = {
  // Public Proposal View
  async getPublicProposal(slug) {
    const proposals = await sql`
      SELECT id, slug, "recipientName", question, icon, "gifUrl", "gifProvider", 
             "spotifyUrl", "loveNote", "buttonAnimation", published, "createdAt"
      FROM "Proposal"
      WHERE slug = ${slug} AND published = true
      LIMIT 1
    `;
    return proposals[0] || null;
  },

  // Record Recipient "YES" Response
  async submitResponse(slug, responseText) {
    const proposals = await sql`
      SELECT id FROM "Proposal" WHERE slug = ${slug} AND published = true LIMIT 1
    `;
    if (!proposals[0]) {
      throw new Error("Proposal not found");
    }

    const newId = generateId();
    const result = await sql`
      INSERT INTO "ProposalResponse" (id, "proposalId", response, "createdAt")
      VALUES (${newId}, ${proposals[0].id}, ${responseText}, NOW())
      RETURNING id, "createdAt"
    `;
    return result[0];
  },

  // Record Visitor Log
  async recordVisit(slug, { device, userAgent }) {
    const proposals = await sql`
      SELECT id FROM "Proposal" WHERE slug = ${slug} LIMIT 1
    `;
    if (!proposals[0]) return null;

    const newId = generateId();
    await sql`
      INSERT INTO "Visitor" (id, "proposalId", "userAgent", device, country, "createdAt")
      VALUES (${newId}, ${proposals[0].id}, ${userAgent || 'browser'}, ${device || 'Desktop'}, 'unknown', NOW())
    `;
    return true;
  },

  // Get Creator's Proposals
  async getUserProposals(userId) {
    const proposals = await sql`
      SELECT p.*,
        (SELECT COUNT(*)::int FROM "ProposalResponse" r WHERE r."proposalId" = p.id) as response_count,
        (SELECT COUNT(*)::int FROM "Visitor" v WHERE v."proposalId" = p.id) as visitor_count
      FROM "Proposal" p
      WHERE p."userId" = ${userId}
      ORDER BY p."createdAt" DESC
    `;
    return proposals.map((p) => ({
      ...p,
      _count: {
        responses: p.response_count || 0,
        visitors: p.visitor_count || 0,
      },
    }));
  },

  // Get Responses and Visitor logs for a proposal
  async getProposalResponses(proposalId, userId) {
    const proposals = await sql`
      SELECT id, "recipientName", question, slug FROM "Proposal" 
      WHERE id = ${proposalId} AND "userId" = ${userId} LIMIT 1
    `;
    if (!proposals[0]) throw new Error("Proposal not found");

    const responses = await sql`
      SELECT * FROM "ProposalResponse" 
      WHERE "proposalId" = ${proposalId} 
      ORDER BY "createdAt" DESC
    `;

    const visitors = await sql`
      SELECT * FROM "Visitor" 
      WHERE "proposalId" = ${proposalId} 
      ORDER BY "createdAt" DESC 
      LIMIT 50
    `;

    return {
      proposalInfo: proposals[0],
      responses,
      visitors,
    };
  },

  // Create a new proposal directly in Neon Postgres
  async createProposal(userId, data) {
    const id = generateId();
    const cleanName = (data.recipientName || 'proposal').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
    const slug = data.slug || `${cleanName}-${Math.random().toString(36).substring(2, 7)}`;

    const result = await sql`
      INSERT INTO "Proposal" (
        id, "userId", slug, "recipientName", question, icon, "gifUrl", 
        "gifProvider", "spotifyUrl", "loveNote", "buttonAnimation", published, "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${userId}, ${slug}, ${data.recipientName}, ${data.question}, 
        ${data.icon || '💖'}, ${data.gifUrl || null}, ${data.gifProvider || 'custom'}, 
        ${data.spotifyUrl || null}, ${data.loveNote || null}, 
        ${data.buttonAnimation || 'evader'}, ${data.published !== false}, NOW(), NOW()
      )
      RETURNING *
    `;
    return result[0];
  },

  // Delete Proposal
  async deleteProposal(proposalId, userId) {
    await sql`
      DELETE FROM "Proposal" WHERE id = ${proposalId} AND "userId" = ${userId}
    `;
    return true;
  },
};

export default neonApi;
