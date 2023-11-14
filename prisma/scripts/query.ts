import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const polls = await prisma.poll.findMany();
  console.log(polls);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
