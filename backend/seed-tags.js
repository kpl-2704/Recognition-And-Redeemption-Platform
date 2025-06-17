import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultTags = [
  {
    name: "Teamwork",
    emoji: "🤝",
    color: "bg-blue-100 text-blue-800",
  },
  {
    name: "Leadership",
    emoji: "👑",
    color: "bg-purple-100 text-purple-800",
  },
  {
    name: "Innovation",
    emoji: "💡",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    name: "Communication",
    emoji: "💬",
    color: "bg-green-100 text-green-800",
  },
  {
    name: "Problem Solving",
    emoji: "🔧",
    color: "bg-orange-100 text-orange-800",
  },
  {
    name: "Mentorship",
    emoji: "📚",
    color: "bg-indigo-100 text-indigo-800",
  },
  {
    name: "Creativity",
    emoji: "🎨",
    color: "bg-pink-100 text-pink-800",
  },
  {
    name: "Reliability",
    emoji: "✅",
    color: "bg-emerald-100 text-emerald-800",
  },
  {
    name: "Positive Attitude",
    emoji: "😊",
    color: "bg-rose-100 text-rose-800",
  },
  {
    name: "Going Above & Beyond",
    emoji: "⭐",
    color: "bg-amber-100 text-amber-800",
  },
];

async function seedTags() {
  try {
    console.log("🌱 Seeding kudos tags...");

    for (const tag of defaultTags) {
      const existingTag = await prisma.kudosTag.findFirst({
        where: { name: tag.name },
      });

      if (!existingTag) {
        await prisma.kudosTag.create({
          data: tag,
        });
        console.log(`✅ Created tag: ${tag.name} ${tag.emoji}`);
      } else {
        console.log(`⏭️  Tag already exists: ${tag.name} ${tag.emoji}`);
      }
    }

    console.log("🎉 Tags seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding tags:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTags();
