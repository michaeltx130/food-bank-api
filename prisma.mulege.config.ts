import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: "nodes/mulege.env" });

export default defineConfig({
  schema: "prisma/mulege/schema.prisma",
  migrations: {
    path: "prisma/mulege/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});