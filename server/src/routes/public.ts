import { Router, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../index";

const router = Router();

const responseSchema = z.object({
  response: z.string().min(1, "Response text is required").max(500),
});

const visitSchema = z.object({
  device: z.string().optional(),
  country: z.string().optional(),
  userAgent: z.string().optional(),
});

// GET /api/public/proposals/:slug - Get public presentation data
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);

    const proposal = await prisma.proposal.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        recipientName: true,
        question: true,
        icon: true,
        gifUrl: true,
        gifProvider: true,
        spotifyUrl: true,
        loveNote: true,
        buttonAnimation: true,
        published: true,
        createdAt: true,
        photos: {
          select: {
            id: true,
            url: true,
            position: true,
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!proposal) {
      return res.status(404).json({ error: "Proposal page not found" });
    }

    if (!proposal.published) {
      return res.status(403).json({ error: "This proposal is currently private or unpublished." });
    }

    return res.json({ proposal });
  } catch (error) {
    console.error("Get public proposal error:", error);
    return res.status(500).json({ error: "Failed to load proposal" });
  }
});

// POST /api/public/proposals/:slug/respond - Submit recipient answer ("YES!", etc.)
router.post("/:slug/respond", async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const validated = responseSchema.parse(req.body);

    const proposal = await prisma.proposal.findUnique({
      where: { slug },
      select: { id: true, published: true },
    });

    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    if (!proposal.published) {
      return res.status(403).json({ error: "Proposal is not published" });
    }

    const savedResponse = await prisma.proposalResponse.create({
      data: {
        proposalId: proposal.id,
        response: validated.response,
      },
    });

    return res.status(201).json({
      message: "Response recorded! 🎉",
      responseId: savedResponse.id,
      timestamp: savedResponse.createdAt,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || "Validation error" });
    }
    console.error("Submit response error:", error);
    return res.status(500).json({ error: "Failed to record response" });
  }
});

// POST /api/public/proposals/:slug/visit - Record visitor view
router.post("/:slug/visit", async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const validated = visitSchema.parse(req.body || {});

    const proposal = await prisma.proposal.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    const userAgent = validated.userAgent || String(req.headers["user-agent"] || "unknown");

    await prisma.visitor.create({
      data: {
        proposalId: proposal.id,
        userAgent: userAgent.slice(0, 255),
        device: validated.device || "desktop/mobile",
        country: validated.country || "unknown",
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error("Record visit error:", error);
    return res.status(500).json({ error: "Failed to record visitor" });
  }
});

export default router;
