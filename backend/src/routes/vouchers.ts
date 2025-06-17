import { Router } from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, requireManager } from "../middleware/auth.js";

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createVoucherSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
  type: z.enum([
    "GIFT_CARD",
    "MEAL_VOUCHER",
    "TRANSPORT",
    "ENTERTAINMENT",
    "OTHER",
  ]),
  value: z.number().positive("Value must be positive"),
  description: z.string().min(1, "Description is required"),
  expiresAt: z.string().datetime().optional(),
});

const updateVoucherSchema = z.object({
  type: z
    .enum(["GIFT_CARD", "MEAL_VOUCHER", "TRANSPORT", "ENTERTAINMENT", "OTHER"])
    .optional(),
  value: z.number().positive("Value must be positive").optional(),
  description: z.string().min(1, "Description is required").optional(),
  expiresAt: z.string().datetime().optional(),
});

// Create voucher (admin/manager only)
router.post(
  "/",
  requireManager,
  validateRequest({ body: createVoucherSchema }),
  async (req, res, next) => {
    try {
      const { userId, type, value, description, expiresAt } = req.body;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      // Create voucher
      const voucher = await prisma.voucher.create({
        data: {
          userId,
          type,
          value,
          description,
          ...(expiresAt && { expiresAt: new Date(expiresAt) }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });

      // Create activity
      await prisma.activity.create({
        data: {
          type: "VOUCHER",
          userId: req.user!.id,
          targetUserId: userId,
          message: `awarded ${type.toLowerCase().replace("_", " ")} voucher to ${user.name}`,
        },
      });

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId,
          type: "SUCCESS",
          title: "New Voucher Awarded!",
          message: `You received a ${type.toLowerCase().replace("_", " ")} voucher worth $${value}`,
        },
      });

      res.status(201).json({
        message: "Voucher created successfully",
        voucher,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get all vouchers (with filters)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { page = "1", limit = "20", userId, type, isRedeemed } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (userId) where.userId = userId as string;
    if (type) where.type = type as string;
    if (isRedeemed !== undefined) where.isRedeemed = isRedeemed === "true";

    // If not admin/manager, only show user's own vouchers
    if (!["ADMIN", "MANAGER"].includes(req.user!.role)) {
      where.userId = req.user!.id;
    }

    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.voucher.count({ where }),
    ]);

    res.json({
      vouchers,
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

// Get voucher by ID
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const voucher = await prisma.voucher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!voucher) {
      return res.status(404).json({
        error: "Voucher not found",
      });
    }

    // Check permissions
    if (
      voucher.userId !== req.user!.id &&
      !["ADMIN", "MANAGER"].includes(req.user!.role)
    ) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    res.json({ voucher });
  } catch (error) {
    next(error);
  }
});

// Update voucher (admin/manager only)
router.put(
  "/:id",
  requireManager,
  validateRequest({ body: updateVoucherSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { type, value, description, expiresAt } = req.body;

      const voucher = await prisma.voucher.findUnique({
        where: { id },
      });

      if (!voucher) {
        return res.status(404).json({
          error: "Voucher not found",
        });
      }

      // Update voucher
      const updatedVoucher = await prisma.voucher.update({
        where: { id },
        data: {
          ...(type && { type }),
          ...(value && { value }),
          ...(description && { description }),
          ...(expiresAt && { expiresAt: new Date(expiresAt) }),
        },
        include: {
          user: {
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
        message: "Voucher updated successfully",
        voucher: updatedVoucher,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Redeem voucher
router.post("/:id/redeem", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const voucher = await prisma.voucher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!voucher) {
      return res.status(404).json({
        error: "Voucher not found",
      });
    }

    // Check permissions
    if (voucher.userId !== req.user!.id) {
      return res.status(403).json({
        error: "You can only redeem your own vouchers",
      });
    }

    // Check if already redeemed
    if (voucher.isRedeemed) {
      return res.status(400).json({
        error: "Voucher has already been redeemed",
      });
    }

    // Check if expired
    if (voucher.expiresAt && new Date() > voucher.expiresAt) {
      return res.status(400).json({
        error: "Voucher has expired",
      });
    }

    // Redeem voucher
    const redeemedVoucher = await prisma.voucher.update({
      where: { id },
      data: {
        isRedeemed: true,
        redeemedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        type: "VOUCHER",
        userId: req.user!.id,
        message: `redeemed ${voucher.type.toLowerCase().replace("_", " ")} voucher`,
      },
    });

    res.json({
      message: "Voucher redeemed successfully",
      voucher: redeemedVoucher,
    });
  } catch (error) {
    next(error);
  }
});

// Delete voucher (admin/manager only)
router.delete("/:id", requireManager, async (req, res, next) => {
  try {
    const { id } = req.params;

    const voucher = await prisma.voucher.findUnique({
      where: { id },
    });

    if (!voucher) {
      return res.status(404).json({
        error: "Voucher not found",
      });
    }

    // Delete voucher
    await prisma.voucher.delete({
      where: { id },
    });

    res.json({
      message: "Voucher deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
