import { Router } from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, requireManager } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createFeedbackSchema = z.object({
  toUserId: z.string().cuid("Invalid user ID").optional(),
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message too long"),
  type: z.enum(["POSITIVE", "CONSTRUCTIVE", "GENERAL"]),
  isPublic: z.boolean().default(true),
  isAnonymous: z.boolean().default(false),
});

const updateFeedbackSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message too long"),
  type: z.enum(["POSITIVE", "CONSTRUCTIVE", "GENERAL"]).optional(),
  isPublic: z.boolean().optional(),
});

// Create feedback
router.post(
  "/",
  authMiddleware,
  validateRequest({ body: createFeedbackSchema }),
  async (req, res, next) => {
    try {
      const { toUserId, message, type, isPublic, isAnonymous } = req.body;
      const fromUserId = req.user!.id;

      // Get sender and recipient (if specified)
      const [fromUser, toUser] = await Promise.all([
        prisma.user.findUnique({ where: { id: fromUserId } }),
        toUserId ? prisma.user.findUnique({ where: { id: toUserId } }) : null,
      ]);

      if (!fromUser || (toUserId && !toUser)) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Create feedback
      const feedback = await prisma.feedback.create({
        data: {
          fromUserId,
          toUserId,
          message,
          type,
          isPublic,
          isAnonymous,
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
        },
      });

      // Create activity
      await prisma.activity.create({
        data: {
          type: "FEEDBACK",
          userId: fromUserId,
          targetUserId: toUserId,
          message: toUser
            ? `gave ${type.toLowerCase()} feedback to ${toUser.name}`
            : `submitted ${type.toLowerCase()} feedback`,
          feedbackId: feedback.id,
        },
      });

      // Create notification for recipient if specified
      if (toUserId) {
        await prisma.notification.create({
          data: {
            userId: toUserId,
            type: "INFO",
            title: "New Feedback Received",
            message: `You received ${type.toLowerCase()} feedback${isAnonymous ? " (anonymous)" : ` from ${fromUser.name}`}`,
          },
        });
      }

      res.status(201).json({
        message: "Feedback submitted successfully",
        feedback,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get all feedback (with filters)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const {
      page = "1",
      limit = "20",
      fromUserId,
      toUserId,
      type,
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
    if (type) where.type = type as string;
    if (status) where.status = status as string;
    if (isPublic !== undefined) where.isPublic = isPublic === "true";

    // If not admin/manager, only show public feedback or user's own
    if (!["ADMIN", "MANAGER"].includes(req.user!.role)) {
      where.OR = [
        { isPublic: true },
        { fromUserId: req.user!.id },
        { toUserId: req.user!.id },
      ];
    }

    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
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
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.feedback.count({ where }),
    ]);

    res.json({
      feedback,
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

// Get feedback by ID
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.feedback.findUnique({
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

    if (!feedback) {
      return res.status(404).json({
        error: "Feedback not found",
      });
    }

    // Check permissions
    if (
      !feedback.isPublic &&
      feedback.fromUserId !== req.user!.id &&
      feedback.toUserId !== req.user!.id &&
      !["ADMIN", "MANAGER"].includes(req.user!.role)
    ) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    res.json({ feedback });
  } catch (error) {
    next(error);
  }
});

// Update feedback (only by sender or admin)
router.put(
  "/:id",
  authMiddleware,
  validateRequest({ body: updateFeedbackSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { message, type, isPublic } = req.body;

      const feedback = await prisma.feedback.findUnique({
        where: { id },
      });

      if (!feedback) {
        return res.status(404).json({
          error: "Feedback not found",
        });
      }

      // Check permissions
      if (feedback.fromUserId !== req.user!.id && req.user!.role !== "ADMIN") {
        return res.status(403).json({
          error: "You can only edit your own feedback",
        });
      }

      // Update feedback
      const updatedFeedback = await prisma.feedback.update({
        where: { id },
        data: {
          message,
          type,
          isPublic,
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
        },
      });

      res.json({
        message: "Feedback updated successfully",
        feedback: updatedFeedback,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Review feedback (admin/manager only)
router.post("/:id/review", requireManager, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "REVIEWED", "FLAGGED"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
      });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        fromUser: true,
        toUser: true,
      },
    });

    if (!feedback) {
      return res.status(404).json({
        error: "Feedback not found",
      });
    }

    // Update feedback status
    await prisma.feedback.update({
      where: { id },
      data: { status },
    });

    // Create notification for sender
    await prisma.notification.create({
      data: {
        userId: feedback.fromUserId,
        type: status === "FLAGGED" ? "WARNING" : "INFO",
        title: `Feedback ${status.toLowerCase()}`,
        message: `Your feedback has been ${status.toLowerCase()}`,
      },
    });

    res.json({
      message: "Feedback status updated successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Delete feedback (only by sender or admin)
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const feedback = await prisma.feedback.findUnique({
      where: { id },
    });

    if (!feedback) {
      return res.status(404).json({
        error: "Feedback not found",
      });
    }

    // Check permissions
    if (feedback.fromUserId !== req.user!.id && req.user!.role !== "ADMIN") {
      return res.status(403).json({
        error: "You can only delete your own feedback",
      });
    }

    // Delete feedback (this will cascade to related records)
    await prisma.feedback.delete({
      where: { id },
    });

    res.json({
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
