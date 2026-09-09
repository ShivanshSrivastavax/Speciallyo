import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../index";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key";

// Registration validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Login validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        passwordHash,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || "Validation error" });
    }
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error during registration" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(validatedData.password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || "Validation error" });
    }
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error during login" });
  }
});

// GET /api/auth/me
router.get("/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Auth me error:", error);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

export default router;
