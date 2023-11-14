import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const poll = await prisma.poll.create({
    data: {
      title: "What is your favourite colour?",
      description:
        "We are researching our clients' favourite colours. We would appreciate you completing this poll!",
      maxVotesPerOption: 1,
      maxVotesPerAccessCode: 1,
      closingAt: new Date(2023, 12, 31, 23, 59, 59),
    },
  });
  console.log(poll);
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
