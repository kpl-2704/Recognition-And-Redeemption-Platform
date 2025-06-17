import { Router } from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, requireAdmin } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
  department: z.string().optional(),
  role: z.enum(["USER", "MANAGER", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
});

// Get all users (with search and filters)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const {
      page = "1",
      limit = "20",
      search,
      department,
      role,
      isActive,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
        { department: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (department) where.department = department as string;
    if (role) where.role = role as string;
    if (isActive !== undefined) where.isActive = isActive === "true";

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
        orderBy: { name: "asc" },
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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

// Update user (admin only for role changes, or own profile)
router.put(
  "/:id",
  authMiddleware,
  validateRequest({ body: updateUserSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, department, role, isActive, avatar } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Check permissions
      const isOwnProfile = req.user!.id === id;
      const isAdmin = req.user!.role === "ADMIN";

      if (!isOwnProfile && !isAdmin) {
        return res.status(403).json({
          error: "You can only edit your own profile",
        });
      }

      // Only admins can change role and active status
      if ((role !== undefined || isActive !== undefined) && !isAdmin) {
        return res.status(403).json({
          error: "Only admins can change user roles and status",
        });
      }

      // Check if email is being changed and if it's already taken
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (emailExists) {
          return res.status(409).json({
            error: "Email already in use",
          });
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email: email.toLowerCase() }),
          ...(department !== undefined && { department }),
          ...(role && { role }),
          ...(isActive !== undefined && { isActive }),
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
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Delete user (admin only)
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Prevent deleting own account
    if (req.user!.id === id) {
      return res.status(400).json({
        error: "You cannot delete your own account",
      });
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      message: "User deactivated successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Get user stats
router.get("/:id/stats", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        totalKudosReceived: true,
        totalKudosSent: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Get recent kudos received
    const recentKudosReceived = await prisma.kudos.findMany({
      where: {
        toUserId: id,
        status: "APPROVED",
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tags: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Get recent kudos sent
    const recentKudosSent = await prisma.kudos.findMany({
      where: {
        fromUserId: id,
        status: "APPROVED",
      },
      include: {
        toUser: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tags: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Get kudos by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const kudosByMonth = await prisma.kudos.groupBy({
      by: ["status"],
      where: {
        OR: [{ fromUserId: id }, { toUserId: id }],
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: {
        id: true,
      },
    });

    res.json({
      user,
      stats: {
        recentKudosReceived,
        recentKudosSent,
        kudosByMonth,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Search users
router.get("/search/users", authMiddleware, async (req, res, next) => {
  try {
    const { q, limit = "10" } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        error: "Search query is required",
      });
    }

    const limitNum = parseInt(limit as string);

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { department: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        department: true,
        totalKudosReceived: true,
        totalKudosSent: true,
      },
      orderBy: { name: "asc" },
      take: limitNum,
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
});

export default router;
