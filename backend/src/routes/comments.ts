import { Router } from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createCommentSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message too long"),
  kudosId: z.string().cuid("Invalid kudos ID").optional(),
  feedbackId: z.string().cuid("Invalid feedback ID").optional(),
});

const updateCommentSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message too long"),
});

// Create comment
router.post(
  "/",
  authMiddleware,
  validateRequest({ body: createCommentSchema }),
  async (req, res, next) => {
    try {
      const { message, kudosId, feedbackId } = req.body;
      const fromUserId = req.user!.id;

      // Validate that only one of kudosId or feedbackId is provided
      if (!kudosId && !feedbackId) {
        return res.status(400).json({
          error: "Either kudosId or feedbackId is required",
        });
      }

      if (kudosId && feedbackId) {
        return res.status(400).json({
          error: "Cannot comment on both kudos and feedback simultaneously",
        });
      }

      // Check if the kudos/feedback exists and user has access
      if (kudosId) {
        const kudos = await prisma.kudos.findUnique({
          where: { id: kudosId },
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
      }

      if (feedbackId) {
        const feedback = await prisma.feedback.findUnique({
          where: { id: feedbackId },
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
      }

      // Create comment
      const comment = await prisma.comment.create({
        data: {
          fromUserId,
          kudosId,
          feedbackId,
          message,
        },
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          kudos: {
            include: {
              fromUser: {
                select: {
                  id: true,
                  name: true,
                },
              },
              toUser: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          feedback: {
            include: {
              fromUser: {
                select: {
                  id: true,
                  name: true,
                },
              },
              toUser: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Create notification for the owner of the kudos/feedback
      const targetUserId = kudosId
        ? (await prisma.kudos.findUnique({ where: { id: kudosId } }))
            ?.fromUserId
        : (await prisma.feedback.findUnique({ where: { id: feedbackId } }))
            ?.fromUserId;

      if (targetUserId && targetUserId !== req.user!.id) {
        await prisma.notification.create({
          data: {
            userId: targetUserId,
            type: "INFO",
            title: "New Comment",
            message: `${req.user!.email} commented on your ${kudosId ? "kudos" : "feedback"}`,
          },
        });
      }

      res.status(201).json({
        message: "Comment added successfully",
        comment,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get comments for kudos or feedback
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { kudosId, feedbackId, page = "1", limit = "20" } = req.query;

    if (!kudosId && !feedbackId) {
      return res.status(400).json({
        error: "Either kudosId or feedbackId is required",
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    if (kudosId) where.kudosId = kudosId as string;
    if (feedbackId) where.feedbackId = feedbackId as string;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: limitNum,
      }),
      prisma.comment.count({ where }),
    ]);

    res.json({
      comments,
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

// Get comment by ID
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        kudos: {
          include: {
            fromUser: {
              select: {
                id: true,
                name: true,
              },
            },
            toUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        feedback: {
          include: {
            fromUser: {
              select: {
                id: true,
                name: true,
              },
            },
            toUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    res.json({ comment });
  } catch (error) {
    next(error);
  }
});

// Update comment (only by author)
router.put(
  "/:id",
  authMiddleware,
  validateRequest({ body: updateCommentSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { message } = req.body;

      const comment = await prisma.comment.findUnique({
        where: { id },
      });

      if (!comment) {
        return res.status(404).json({
          error: "Comment not found",
        });
      }

      // Check permissions
      if (comment.fromUserId !== req.user!.id) {
        return res.status(403).json({
          error: "You can only edit your own comments",
        });
      }

      // Update comment
      const updatedComment = await prisma.comment.update({
        where: { id },
        data: { message },
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      res.json({
        message: "Comment updated successfully",
        comment: updatedComment,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Delete comment (only by author or admin)
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    // Check permissions
    if (comment.fromUserId !== req.user!.id && req.user!.role !== "ADMIN") {
      return res.status(403).json({
        error: "You can only delete your own comments",
      });
    }

    // Delete comment
    await prisma.comment.delete({
      where: { id },
    });

    res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
