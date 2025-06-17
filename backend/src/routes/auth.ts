import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import { createError } from "../middleware/errorHandler.js";

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().optional(),
  role: z
    .string()
    .refine((val) => ["user", "admin", "manager"].includes(val.toLowerCase()), {
      message: "Role must be 'user', 'admin', or 'manager'",
    })
    .transform((val) => val.toUpperCase())
    .default("USER"),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  department: z.string().optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

// Login route
router.post(
  "/login",
  validateRequest({ body: loginSchema }),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      // Generate JWT token
      if (!process.env.JWT_SECRET) {
        throw createError("JWT_SECRET not configured", 500);
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as SignOptions,
      );

      // Update last login (you might want to add this field to your schema)
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      });

      // Return user data (excluding password)
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: "Login successful",
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Register route
router.post(
  "/register",
  validateRequest({ body: registerSchema }),
  async (req, res, next) => {
    try {
      const { name, email, password, department, role } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        return res.status(409).json({
          error: "User with this email already exists",
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          department,
          role,
        },
      });

      // Generate JWT token
      if (!process.env.JWT_SECRET) {
        throw createError("JWT_SECRET not configured", 500);
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as SignOptions,
      );

      // Return user data (excluding password)
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get current user profile
router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        department: true,
        joinedAt: true,
        totalKudosReceived: true,
        totalKudosSent: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put(
  "/me",
  authMiddleware,
  validateRequest({ body: updateProfileSchema }),
  async (req, res, next) => {
    try {
      const { name, department, avatar } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          ...(name && { name }),
          ...(department !== undefined && { department }),
          ...(avatar && { avatar }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          department: true,
          joinedAt: true,
          totalKudosReceived: true,
          totalKudosSent: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Change password
router.put("/change-password", authMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters",
      });
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    });

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Logout (client-side token removal, but we can invalidate if needed)
router.post("/logout", authMiddleware, async (req, res) => {
  // In a more sophisticated setup, you might want to add the token to a blacklist
  // For now, we'll just return success since JWT tokens are stateless
  res.json({
    message: "Logged out successfully",
  });
});

export default router;
