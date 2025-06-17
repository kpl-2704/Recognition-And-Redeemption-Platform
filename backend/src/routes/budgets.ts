import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, requireManager } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validation.js";
import { z } from "zod";

const router = express.Router();
const prisma = new PrismaClient();

// Schema for budget operations
const updateBudgetSchema = z.object({
  totalBudget: z.number().min(0).optional(),
  monthlyBudget: z.number().min(0).optional(),
});

const allocateBudgetSchema = z.object({
  userId: z.string(),
  amount: z.number().min(0),
  type: z.enum(["total", "monthly"]),
});

// Get user's budget
router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    let budget = await prisma.budget.findUnique({
      where: { userId },
    });

    // Create budget if it doesn't exist
    if (!budget) {
      budget = await prisma.budget.create({
        data: {
          userId,
          totalBudget: 0,
          usedBudget: 0,
          monthlyBudget: 0,
        },
      });
    }

    // Check if monthly budget needs reset
    const now = new Date();
    const resetDate = new Date(budget.resetDate);
    const monthsDiff =
      (now.getFullYear() - resetDate.getFullYear()) * 12 +
      (now.getMonth() - resetDate.getMonth());

    if (monthsDiff >= 1) {
      budget = await prisma.budget.update({
        where: { id: budget.id },
        data: {
          usedBudget: 0,
          resetDate: now,
        },
      });
    }

    res.json({
      budget: {
        id: budget.id,
        totalBudget: budget.totalBudget,
        usedBudget: budget.usedBudget,
        monthlyBudget: budget.monthlyBudget,
        availableBudget: budget.totalBudget - budget.usedBudget,
        availableMonthlyBudget: budget.monthlyBudget - budget.usedBudget,
        resetDate: budget.resetDate,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update user's budget (admin/manager only)
router.put(
  "/me",
  authMiddleware,
  requireManager,
  validateRequest({ body: updateBudgetSchema }),
  async (req, res, next) => {
    try {
      const userId = req.user!.id;
      const { totalBudget, monthlyBudget } = req.body;

      let budget = await prisma.budget.findUnique({
        where: { userId },
      });

      if (!budget) {
        budget = await prisma.budget.create({
          data: {
            userId,
            totalBudget: totalBudget || 0,
            monthlyBudget: monthlyBudget || 0,
          },
        });
      } else {
        budget = await prisma.budget.update({
          where: { id: budget.id },
          data: {
            totalBudget:
              totalBudget !== undefined ? totalBudget : budget.totalBudget,
            monthlyBudget:
              monthlyBudget !== undefined
                ? monthlyBudget
                : budget.monthlyBudget,
          },
        });
      }

      res.json({
        budget: {
          id: budget.id,
          totalBudget: budget.totalBudget,
          usedBudget: budget.usedBudget,
          monthlyBudget: budget.monthlyBudget,
          availableBudget: budget.totalBudget - budget.usedBudget,
          availableMonthlyBudget: budget.monthlyBudget - budget.usedBudget,
          resetDate: budget.resetDate,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Allocate budget to user (admin only)
router.post(
  "/allocate",
  authMiddleware,
  requireManager,
  validateRequest({ body: allocateBudgetSchema }),
  async (req, res, next) => {
    try {
      const { userId, amount, type } = req.body;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      let budget = await prisma.budget.findUnique({
        where: { userId },
      });

      if (!budget) {
        budget = await prisma.budget.create({
          data: {
            userId,
            totalBudget: type === "total" ? amount : 0,
            monthlyBudget: type === "monthly" ? amount : 0,
            usedBudget: 0,
          },
        });
      } else {
        budget = await prisma.budget.update({
          where: { id: budget.id },
          data: {
            totalBudget:
              type === "total"
                ? budget.totalBudget + amount
                : budget.totalBudget,
            monthlyBudget:
              type === "monthly"
                ? budget.monthlyBudget + amount
                : budget.monthlyBudget,
          },
        });
      }

      // Create notification for user
      await prisma.notification.create({
        data: {
          userId,
          type: "INFO",
          title: "Budget Allocated",
          message: `You have been allocated $${amount} ${type} budget for giving kudos.`,
        },
      });

      res.json({
        message: `Budget allocated successfully`,
        budget: {
          id: budget.id,
          totalBudget: budget.totalBudget,
          usedBudget: budget.usedBudget,
          monthlyBudget: budget.monthlyBudget,
          availableBudget: budget.totalBudget - budget.usedBudget,
          availableMonthlyBudget: budget.monthlyBudget - budget.usedBudget,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get all budgets (admin only)
router.get("/all", authMiddleware, requireManager, async (req, res, next) => {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            role: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    const budgetsWithAvailable = budgets.map((budget) => ({
      ...budget,
      availableBudget: budget.totalBudget - budget.usedBudget,
      availableMonthlyBudget: budget.monthlyBudget - budget.usedBudget,
    }));

    res.json({
      budgets: budgetsWithAvailable,
    });
  } catch (error) {
    next(error);
  }
});

// Get budget by user ID (admin/manager only)
router.get(
  "/user/:userId",
  authMiddleware,
  requireManager,
  async (req, res, next) => {
    try {
      const { userId } = req.params;

      const budget = await prisma.budget.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              department: true,
              role: true,
            },
          },
        },
      });

      if (!budget) {
        return res.status(404).json({
          error: "Budget not found",
        });
      }

      res.json({
        budget: {
          ...budget,
          availableBudget: budget.totalBudget - budget.usedBudget,
          availableMonthlyBudget: budget.monthlyBudget - budget.usedBudget,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
