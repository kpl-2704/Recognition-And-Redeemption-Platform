import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// Get activity feed
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { page = "1", limit = "20", type, userId } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (type) where.type = type as string;
    if (userId) where.userId = userId as string;

    // If not admin/manager, only show public activities or user's own
    if (!["ADMIN", "MANAGER"].includes(req.user!.role)) {
      where.OR = [{ userId: req.user!.id }, { targetUserId: req.user!.id }];
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
              department: true,
            },
          },
          targetUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
              department: true,
            },
          },
          kudos: {
            include: {
              fromUser: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
              toUser: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
              tags: true,
            },
          },
          feedback: {
            include: {
              fromUser: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
              toUser: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.activity.count({ where }),
    ]);

    res.json({
      activities,
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

// Get activity by ID
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            department: true,
          },
        },
        targetUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            department: true,
          },
        },
        kudos: {
          include: {
            fromUser: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            toUser: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            tags: true,
            comments: {
              include: {
                fromUser: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
        feedback: {
          include: {
            fromUser: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            toUser: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            comments: {
              include: {
                fromUser: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!activity) {
      return res.status(404).json({
        error: "Activity not found",
      });
    }

    res.json({ activity });
  } catch (error) {
    next(error);
  }
});

export default router;
