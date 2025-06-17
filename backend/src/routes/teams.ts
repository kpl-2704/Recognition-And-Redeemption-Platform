import { Router } from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, requireManager } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  memberIds: z.array(z.string().cuid()).optional(),
});

const updateTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").optional(),
});

const addMemberSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
  role: z.enum(["MEMBER", "LEADER", "ADMIN"]).default("MEMBER"),
});

// Create team (admin/manager only)
router.post(
  "/",
  requireManager,
  validateRequest({ body: createTeamSchema }),
  async (req, res, next) => {
    try {
      const { name, memberIds } = req.body;

      // Create team
      const team = await prisma.team.create({
        data: {
          name,
          ...(memberIds &&
            memberIds.length > 0 && {
              members: {
                create: memberIds.map((userId) => ({
                  userId,
                  role: "MEMBER",
                })),
              },
            }),
        },
        include: {
          members: {
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
            },
          },
        },
      });

      res.status(201).json({
        message: "Team created successfully",
        team,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get all teams
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        include: {
          members: {
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
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.team.count(),
    ]);

    res.json({
      teams,
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

// Get team by ID
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
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
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({
        error: "Team not found",
      });
    }

    res.json({ team });
  } catch (error) {
    next(error);
  }
});

// Update team (admin/manager only)
router.put(
  "/:id",
  requireManager,
  validateRequest({ body: updateTeamSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const team = await prisma.team.findUnique({
        where: { id },
      });

      if (!team) {
        return res.status(404).json({
          error: "Team not found",
        });
      }

      const updatedTeam = await prisma.team.update({
        where: { id },
        data: { name },
        include: {
          members: {
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
            },
          },
        },
      });

      res.json({
        message: "Team updated successfully",
        team: updatedTeam,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Add member to team (admin/manager only)
router.post(
  "/:id/members",
  requireManager,
  validateRequest({ body: addMemberSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { userId, role } = req.body;

      // Check if team exists
      const team = await prisma.team.findUnique({
        where: { id },
      });

      if (!team) {
        return res.status(404).json({
          error: "Team not found",
        });
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Check if user is already a member
      const existingMember = await prisma.teamMember.findUnique({
        where: {
          userId_teamId: {
            userId,
            teamId: id,
          },
        },
      });

      if (existingMember) {
        return res.status(409).json({
          error: "User is already a member of this team",
        });
      }

      // Add member
      const member = await prisma.teamMember.create({
        data: {
          userId,
          teamId: id,
          role,
        },
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
        },
      });

      res.status(201).json({
        message: "Member added successfully",
        member,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Remove member from team (admin/manager only)
router.delete(
  "/:id/members/:userId",
  requireManager,
  async (req, res, next) => {
    try {
      const { id, userId } = req.params;

      const member = await prisma.teamMember.findUnique({
        where: {
          userId_teamId: {
            userId,
            teamId: id,
          },
        },
      });

      if (!member) {
        return res.status(404).json({
          error: "Member not found in team",
        });
      }

      await prisma.teamMember.delete({
        where: {
          userId_teamId: {
            userId,
            teamId: id,
          },
        },
      });

      res.json({
        message: "Member removed successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

// Delete team (admin only)
router.delete("/:id", requireManager, async (req, res, next) => {
  try {
    const { id } = req.params;

    const team = await prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      return res.status(404).json({
        error: "Team not found",
      });
    }

    // Delete team (this will cascade to team members)
    await prisma.team.delete({
      where: { id },
    });

    res.json({
      message: "Team deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
