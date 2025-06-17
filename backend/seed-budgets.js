import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedBudgets() {
  try {
    console.log("🌱 Seeding budgets...");

    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users`);

    // Create budgets for each user
    for (const user of users) {
      const existingBudget = await prisma.budget.findUnique({
        where: { userId: user.id },
      });

      if (!existingBudget) {
        // Give different budgets based on role
        const totalBudget = user.role === "admin" ? 1000 : 500;
        const monthlyBudget = user.role === "admin" ? 200 : 100;

        await prisma.budget.create({
          data: {
            userId: user.id,
            totalBudget,
            monthlyBudget,
            usedBudget: 0,
          },
        });

        console.log(
          `✅ Created budget for ${user.name}: $${totalBudget} total, $${monthlyBudget} monthly`,
        );
      } else {
        console.log(`⏭️  Budget already exists for ${user.name}`);
      }
    }

    console.log("🎉 Budget seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding budgets:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBudgets();
