import { Router } from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, requireManager } from "../middleware/auth.js";
import { createError } from "../middleware/errorHandler.js";

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createKudosSchema = z.object({
  toUserId: z.string().cuid("Invalid user ID"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message too long"),
  tagIds: z.array(z.string().cuid()).optional(),
  isPublic: z.boolean().default(true),
  monetaryAmount: z.number().min(0).optional(),
  currency: z.string().default("USD"),
});

const updateKudosSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message too long"),
  tagIds: z.array(z.string().cuid()).optional(),
  isPublic: z.boolean().optional(),
});

const approveKudosSchema = z.object({
  reason: z.string().optional(),
});

// Helper function to check if kudos requires approval
const requiresApproval = (
  fromUserRole: string,
  toUserRole: string,
): boolean => {
  return fromUserRole === "ADMIN" && toUserRole === "USER";
};

// Create kudos
router.post(
  "/",
  authMiddleware,
  validateRequest({ body: createKudosSchema }),
  async (req, res, next) => {
    try {
      const { toUserId, message, tagIds, isPublic, monetaryAmount, currency } =
        req.body;
      const fromUserId = req.user!.id;

      // Get sender and recipient
      const [fromUser, toUser] = await Promise.all([
        prisma.user.findUnique({ where: { id: fromUserId } }),
        prisma.user.findUnique({ where: { id: toUserId } }),
      ]);

      if (!fromUser || !toUser) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Check budget if monetary amount is provided
      if (monetaryAmount && monetaryAmount > 0) {
        const budget = await prisma.budget.findUnique({
          where: { userId: fromUserId },
        });

        if (!budget) {
          return res.status(400).json({
            error: "No budget allocated. Please contact your manager.",
          });
        }

        const availableBudget = budget.totalBudget - budget.usedBudget;
        const availableMonthlyBudget = budget.monthlyBudget - budget.usedBudget;

        if (availableBudget < monetaryAmount) {
          return res.status(400).json({
            error: `Insufficient budget. Available: $${availableBudget.toFixed(2)}, Required: $${monetaryAmount.toFixed(2)}`,
          });
        }

        if (availableMonthlyBudget < monetaryAmount) {
          return res.status(400).json({
            error: `Insufficient monthly budget. Available: $${availableMonthlyBudget.toFixed(2)}, Required: $${monetaryAmount.toFixed(2)}`,
          });
        }

        // Deduct from budget
        await prisma.budget.update({
          where: { id: budget.id },
          data: {
            usedBudget: { increment: monetaryAmount },
          },
        });
      }

      // Check if approval is required
      const needsApproval = requiresApproval(fromUser.role, toUser.role);
      const status = needsApproval ? "PENDING" : "APPROVED";

      // Create kudos
      const kudos = await prisma.kudos.create({
        data: {
          fromUserId,
          toUserId,
          message,
          isPublic,
          status,
          monetaryAmount: monetaryAmount || 0,
          currency,
          ...(tagIds &&
            tagIds.length > 0 && {
              tags: {
                connect: tagIds.map((id) => ({ id })),
              },
            }),
        },
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
              department: true,
            },
          },
          toUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
              department: true,
            },
          },
          tags: true,
        },
      });

      // Create activity
      await prisma.activity.create({
        data: {
          type: "KUDOS",
          userId: fromUserId,
          targetUserId: toUserId,
          message: `gave kudos${monetaryAmount ? ` worth $${monetaryAmount}` : ""} to ${toUser.name}`,
          kudosId: kudos.id,
        },
      });

      // Update user stats if approved
      if (status === "APPROVED") {
        await Promise.all([
          prisma.user.update({
            where: { id: fromUserId },
            data: { totalKudosSent: { increment: 1 } },
          }),
          prisma.user.update({
            where: { id: toUserId },
            data: { totalKudosReceived: { increment: 1 } },
          }),
        ]);
      }

      // Create notification for recipient
      await prisma.notification.create({
        data: {
          userId: toUserId,
          type: status === "APPROVED" ? "SUCCESS" : "INFO",
          title:
            status === "APPROVED"
              ? "New Kudos Received!"
              : "Kudos Pending Approval",
          message:
            status === "APPROVED"
              ? `You received kudos${monetaryAmount ? ` worth $${monetaryAmount}` : ""} from ${fromUser.name}!`
              : `${fromUser.name} sent you kudos (pending approval)`,
        },
      });

      res.status(201).json({
        message:
          status === "APPROVED"
            ? "Kudos sent successfully!"
            : "Kudos sent and pending approval",
        kudos,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get all kudos (with filters)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const {
      page = "1",
      limit = "20",
      fromUserId,
      toUserId,
      status,
      isPublic,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (fromUserId) where.fromUserId = fromUserId as string;
    if (toUserId) where.toUserId = toUserId as string;
    if (status) where.status = status as string;
    if (isPublic !== undefined) where.isPublic = isPublic === "true";

    // If not admin/manager, only show public kudos or user's own
    if (!["ADMIN", "MANAGER"].includes(req.user!.role)) {
      where.OR = [
        { isPublic: true },
        { fromUserId: req.user!.id },
        { toUserId: req.user!.id },
      ];
    }

    const [kudos, total] = await Promise.all([
      prisma.kudos.findMany({
        where,
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
              department: true,
            },
          },
          toUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
              department: true,
            },
          },
          tags: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.kudos.count({ where }),
    ]);

    res.json({
      kudos,
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

// Get kudos by ID
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const kudos = await prisma.kudos.findUnique({
      where: { id },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            department: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            department: true,
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
    });

    if (!kudos) {
      return res.status(404).json({
        error: "Kudos not found",
      });
    }

    // Check permissions
    if (
      !kudos.isPublic &&
      kudos.fromUserId !== req.user!.id &&
      kudos.toUserId !== req.user!.id &&
      !["ADMIN", "MANAGER"].includes(req.user!.role)
    ) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    res.json({ kudos });
  } catch (error) {
    next(error);
  }
});

// Update kudos (only by sender or admin)
router.put(
  "/:id",
  authMiddleware,
  validateRequest({ body: updateKudosSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { message, tagIds, isPublic } = req.body;

      const kudos = await prisma.kudos.findUnique({
        where: { id },
        include: { tags: true },
      });

      if (!kudos) {
        return res.status(404).json({
          error: "Kudos not found",
        });
      }

      // Check permissions
      if (kudos.fromUserId !== req.user!.id && req.user!.role !== "ADMIN") {
        return res.status(403).json({
          error: "You can only edit your own kudos",
        });
      }

      // Update kudos
      const updatedKudos = await prisma.kudos.update({
        where: { id },
        data: {
          message,
          isPublic,
          ...(tagIds && {
            tags: {
              set: tagIds.map((tagId) => ({ id: tagId })),
            },
          }),
        },
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
              department: true,
            },
          },
          toUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
              department: true,
            },
          },
          tags: true,
        },
      });

      res.json({
        message: "Kudos updated successfully",
        kudos: updatedKudos,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Approve kudos (admin/manager only)
router.post(
  "/:id/approve",
  requireManager,
  validateRequest({ body: approveKudosSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const kudos = await prisma.kudos.findUnique({
        where: { id },
        include: {
          fromUser: true,
          toUser: true,
        },
      });

      if (!kudos) {
        return res.status(404).json({
          error: "Kudos not found",
        });
      }

      if (kudos.status !== "PENDING") {
        return res.status(400).json({
          error: "Kudos is not pending approval",
        });
      }

      // Update kudos status
      await prisma.kudos.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvalReason: reason,
        },
      });

      // Update user stats
      await Promise.all([
        prisma.user.update({
          where: { id: kudos.fromUserId },
          data: { totalKudosSent: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: kudos.toUserId },
          data: { totalKudosReceived: { increment: 1 } },
        }),
      ]);

      // Create notification for recipient
      await prisma.notification.create({
        data: {
          userId: kudos.toUserId,
          type: "SUCCESS",
          title: "Kudos Approved!",
          message: `Kudos from ${kudos.fromUser.name} has been approved!`,
        },
      });

      res.json({
        message: "Kudos approved successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

// Reject kudos (admin/manager only)
router.post(
  "/:id/reject",
  requireManager,
  validateRequest({ body: approveKudosSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const kudos = await prisma.kudos.findUnique({
        where: { id },
        include: {
          fromUser: true,
          toUser: true,
        },
      });

      if (!kudos) {
        return res.status(404).json({
          error: "Kudos not found",
        });
      }

      if (kudos.status !== "PENDING") {
        return res.status(400).json({
          error: "Kudos is not pending approval",
        });
      }

      // Update kudos status
      await prisma.kudos.update({
        where: { id },
        data: {
          status: "REJECTED",
          approvalReason: reason,
        },
      });

      // Create notification for sender
      await prisma.notification.create({
        data: {
          userId: kudos.fromUserId,
          type: "WARNING",
          title: "Kudos Rejected",
          message: `Your kudos to ${kudos.toUser.name} was rejected${reason ? `: ${reason}` : ""}`,
        },
      });

      res.json({
        message: "Kudos rejected successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

// Delete kudos (only by sender or admin)
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const kudos = await prisma.kudos.findUnique({
      where: { id },
    });

    if (!kudos) {
      return res.status(404).json({
        error: "Kudos not found",
      });
    }

    // Check permissions
    if (kudos.fromUserId !== req.user!.id && req.user!.role !== "ADMIN") {
      return res.status(403).json({
        error: "You can only delete your own kudos",
      });
    }

    // Delete kudos (this will cascade to related records)
    await prisma.kudos.delete({
      where: { id },
    });

    // Update user stats if kudos was approved
    if (kudos.status === "APPROVED") {
      await Promise.all([
        prisma.user.update({
          where: { id: kudos.fromUserId },
          data: { totalKudosSent: { decrement: 1 } },
        }),
        prisma.user.update({
          where: { id: kudos.toUserId },
          data: { totalKudosReceived: { decrement: 1 } },
        }),
      ]);
    }

    res.json({
      message: "Kudos deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Get kudos tags
router.get("/tags/all", authMiddleware, async (req, res, next) => {
  try {
    const tags = await prisma.kudosTag.findMany({
      orderBy: { name: "asc" },
    });

    res.json({ tags });
  } catch (error) {
    next(error);
  }
});

export default router;
