import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../index";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Apply auth middleware to all proposal management routes
router.use(authenticateToken);

const createProposalSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required"),
  question: z.string().min(1, "Proposal question is required"),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/i, "Slug must contain only letters, numbers, and dashes").optional(),
  icon: z.string().optional(),
  gifUrl: z.string().optional(),
  gifProvider: z.string().optional(),
  spotifyUrl: z.string().optional(),
  loveNote: z.string().optional(),
  buttonAnimation: z.string().default("evader"),
  published: z.boolean().default(true),
  photos: z.array(z.string()).optional(),
});

const updateProposalSchema = createProposalSchema.partial();

const generateSlug = (recipientName: string): string => {
  const cleanName = recipientName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 15);
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${cleanName || "proposal"}-${randomSuffix}`;
};

// GET /api/proposals - List all user proposals with counts
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const proposals = await prisma.proposal.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            responses: true,
            visitors: true,
            photos: true,
          },
        },
        responses: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ proposals });
  } catch (error) {
    console.error("Get proposals error:", error);
    return res.status(500).json({ error: "Failed to fetch proposals" });
  }
});

// POST /api/proposals - Create a new proposal
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const validated = createProposalSchema.parse(req.body);

    let slug = validated.slug;
    if (!slug) {
      slug = generateSlug(validated.recipientName);
    }

    let existing = await prisma.proposal.findUnique({ where: { slug } });
    if (existing) {
      if (validated.slug) {
        return res.status(400).json({ error: "This custom URL slug is already taken. Please choose another." });
      }
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const proposal = await prisma.proposal.create({
      data: {
        userId,
        slug,
        recipientName: validated.recipientName,
        question: validated.question,
        icon: validated.icon || "💖",
        gifUrl: validated.gifUrl,
        gifProvider: validated.gifProvider || "custom",
        spotifyUrl: validated.spotifyUrl,
        loveNote: validated.loveNote,
        buttonAnimation: validated.buttonAnimation || "evader",
        published: validated.published !== undefined ? validated.published : true,
        photos: validated.photos && validated.photos.length > 0 ? {
          create: validated.photos.map((url, index) => ({
            url,
            position: index,
          })),
        } : undefined,
      },
      include: {
        photos: true,
      },
    });

    return res.status(201).json({ proposal });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || "Validation error" });
    }
    console.error("Create proposal error:", error);
    return res.status(500).json({ error: "Failed to create proposal" });
  }
});

// GET /api/proposals/:id - Get full proposal details (owner only)
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const proposal = await prisma.proposal.findFirst({
      where: { id, userId },
      include: {
        photos: { orderBy: { position: "asc" } },
        responses: { orderBy: { createdAt: "desc" } },
        visitors: { orderBy: { createdAt: "desc" } },
        _count: {
          select: {
            responses: true,
            visitors: true,
          },
        },
      },
    });

    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    return res.json({ proposal });
  } catch (error) {
    console.error("Get proposal by ID error:", error);
    return res.status(500).json({ error: "Failed to fetch proposal" });
  }
});

// PUT /api/proposals/:id - Update proposal
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const validated = updateProposalSchema.parse(req.body);

    const existing = await prisma.proposal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    if (validated.slug && validated.slug !== existing.slug) {
      const slugTaken = await prisma.proposal.findUnique({
        where: { slug: validated.slug },
      });
      if (slugTaken) {
        return res.status(400).json({ error: "This custom URL slug is already taken" });
      }
    }

    if (validated.photos) {
      await prisma.photo.deleteMany({ where: { proposalId: id } });
    }

    const updated = await prisma.proposal.update({
      where: { id },
      data: {
        recipientName: validated.recipientName,
        question: validated.question,
        slug: validated.slug,
        icon: validated.icon,
        gifUrl: validated.gifUrl,
        gifProvider: validated.gifProvider,
        spotifyUrl: validated.spotifyUrl,
        loveNote: validated.loveNote,
        buttonAnimation: validated.buttonAnimation,
        published: validated.published,
        photos: validated.photos ? {
          create: validated.photos.map((url, index) => ({
            url,
            position: index,
          })),
        } : undefined,
      },
      include: {
        photos: true,
      },
    });

    return res.json({ proposal: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || "Validation error" });
    }
    console.error("Update proposal error:", error);
    return res.status(500).json({ error: "Failed to update proposal" });
  }
});

// DELETE /api/proposals/:id - Delete proposal
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const existing = await prisma.proposal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    await prisma.proposal.delete({ where: { id } });

    return res.json({ message: "Proposal deleted successfully" });
  } catch (error) {
    console.error("Delete proposal error:", error);
    return res.status(500).json({ error: "Failed to delete proposal" });
  }
});

// GET /api/proposals/:id/responses - Get responses list
router.get("/:id/responses", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);

    const proposal = await prisma.proposal.findFirst({
      where: { id, userId },
      include: {
        responses: {
          orderBy: { createdAt: "desc" },
        },
        visitors: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    return res.json({
      responses: proposal.responses,
      visitors: proposal.visitors,
      proposalInfo: {
        recipientName: proposal.recipientName,
        question: proposal.question,
        slug: proposal.slug,
      },
    });
  } catch (error) {
    console.error("Get proposal responses error:", error);
    return res.status(500).json({ error: "Failed to fetch responses" });
  }
});

export default router;
