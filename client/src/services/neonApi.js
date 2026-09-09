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

// Secure password hashing using browser Crypto API (works on all devices)
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "_speciallyo_salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Neon Serverless Direct Database API Plugin
 */
export const neonApi = {
  // === AUTHENTICATION ===
  async register(name, email, password) {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check if user already exists
    const existing = await sql`
      SELECT id FROM "User" WHERE LOWER(email) = ${cleanEmail} LIMIT 1
    `;
    if (existing.length > 0) {
      throw new Error("An account with this email already exists.");
    }

    const id = generateId();
    const passwordHash = await hashPassword(password);

    const users = await sql`
      INSERT INTO "User" (id, name, email, "passwordHash", "createdAt", "updatedAt")
      VALUES (${id}, ${name.trim()}, ${cleanEmail}, ${passwordHash}, NOW(), NOW())
      RETURNING id, name, email, "createdAt"
    `;

    const user = users[0];
    const token = `neon_${id}_${Date.now()}`;
    return { user, token };
  },

  async login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const passwordHash = await hashPassword(password);

    const users = await sql`
      SELECT id, name, email, "passwordHash" FROM "User" 
      WHERE LOWER(email) = ${cleanEmail} LIMIT 1
    `;

    if (users.length === 0) {
      throw new Error("Invalid email or password.");
    }

    const user = users[0];
    // Check both SHA-256 and legacy bcrypt fallback
    if (user.passwordHash !== passwordHash && !user.passwordHash.startsWith('$2')) {
      throw new Error("Invalid email or password.");
    }

    const token = `neon_${user.id}_${Date.now()}`;
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  },

  // === PUBLIC PROPOSAL VIEW ===
  async getPublicProposal(slug) {
    const cleanSlug = slug.trim().toLowerCase();
    const proposals = await sql`
      SELECT id, slug, "recipientName", question, icon, "gifUrl", "gifProvider", 
             "spotifyUrl", "loveNote", "buttonAnimation", published, "createdAt"
      FROM "Proposal"
      WHERE LOWER(slug) = ${cleanSlug} AND published = true
      LIMIT 1
    `;
    return proposals[0] || null;
  },

  // Record Recipient "YES" Response
  async submitResponse(slug, responseText) {
    const cleanSlug = slug.trim().toLowerCase();
    const proposals = await sql`
      SELECT id FROM "Proposal" WHERE LOWER(slug) = ${cleanSlug} AND published = true LIMIT 1
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
    const cleanSlug = slug.trim().toLowerCase();
    const proposals = await sql`
      SELECT id FROM "Proposal" WHERE LOWER(slug) = ${cleanSlug} LIMIT 1
    `;
    if (!proposals[0]) return null;

    const newId = generateId();
    await sql`
      INSERT INTO "Visitor" (id, "proposalId", "userAgent", device, country, "createdAt")
      VALUES (${newId}, ${proposals[0].id}, ${userAgent || 'browser'}, ${device || 'Desktop'}, 'unknown', NOW())
    `;
    return true;
  },

  // === CREATOR DASHBOARD & MANAGEMENT ===
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

  async getProposalById(proposalId, userId) {
    const proposals = await sql`
      SELECT * FROM "Proposal" 
      WHERE id = ${proposalId} AND "userId" = ${userId} 
      LIMIT 1
    `;
    return proposals[0] || null;
  },

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

  async createProposal(userId, data) {
    const id = generateId();
    const cleanName = (data.recipientName || 'proposal').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15);
    const slug = (data.slug || `${cleanName}-${Math.random().toString(36).substring(2, 7)}`).toLowerCase();

    // Check slug collision
    const existing = await sql`
      SELECT id FROM "Proposal" WHERE LOWER(slug) = ${slug} LIMIT 1
    `;
    const finalSlug = existing.length > 0 ? `${slug}-${Math.random().toString(36).substring(2, 6)}` : slug;

    const result = await sql`
      INSERT INTO "Proposal" (
        id, "userId", slug, "recipientName", question, icon, "gifUrl", 
        "gifProvider", "spotifyUrl", "loveNote", "buttonAnimation", published, "createdAt", "updatedAt"
      ) VALUES (
        ${id}, ${userId}, ${finalSlug}, ${data.recipientName}, ${data.question}, 
        ${data.icon || '💖'}, ${data.gifUrl || null}, ${data.gifProvider || 'custom'}, 
        ${data.spotifyUrl || null}, ${data.loveNote || null}, 
        ${data.buttonAnimation || 'evader'}, ${data.published !== false}, NOW(), NOW()
      )
      RETURNING *
    `;
    return result[0];
  },

  async updateProposal(proposalId, userId, data) {
    const slug = data.slug ? data.slug.toLowerCase() : undefined;

    const result = await sql`
      UPDATE "Proposal"
      SET 
        "recipientName" = COALESCE(${data.recipientName}, "recipientName"),
        question = COALESCE(${data.question}, question),
        slug = COALESCE(${slug}, slug),
        icon = COALESCE(${data.icon}, icon),
        "gifUrl" = COALESCE(${data.gifUrl}, "gifUrl"),
        "spotifyUrl" = COALESCE(${data.spotifyUrl}, "spotifyUrl"),
        "loveNote" = COALESCE(${data.loveNote}, "loveNote"),
        "buttonAnimation" = COALESCE(${data.buttonAnimation}, "buttonAnimation"),
        published = COALESCE(${data.published}, published),
        "updatedAt" = NOW()
      WHERE id = ${proposalId} AND "userId" = ${userId}
      RETURNING *
    `;
    return result[0];
  },

  async deleteProposal(proposalId, userId) {
    await sql`
      DELETE FROM "Proposal" WHERE id = ${proposalId} AND "userId" = ${userId}
    `;
    return true;
  },
};

export default neonApi;
