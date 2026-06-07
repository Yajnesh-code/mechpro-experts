import { app } from "./app.js";
import { prisma } from "./config/prisma.js";
import { env } from "./config/env.js";

const server = app.listen(env.port, () => {
  console.log(`MechPro Experts API running on http://localhost:${env.port}`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
