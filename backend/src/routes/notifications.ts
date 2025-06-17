import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// Get user notifications
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { page = "1", limit = "20", isRead } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = { userId: req.user!.id };
    if (isRead !== undefined) where.isRead = isRead === "true";

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      notifications,
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

// Mark notification as read
router.put("/:id/read", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }

    if (notification.userId !== req.user!.id) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    res.json({
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read
router.put("/read-all", authMiddleware, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user!.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }

    if (notification.userId !== req.user!.id) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
