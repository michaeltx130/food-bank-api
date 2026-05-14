import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: "nodes/comondu.env" });

export default defineConfig({
  schema: "prisma/comondu/schema.prisma",
  migrations: {
    path: "prisma/comondu/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});