import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/comondu/schema.prisma",
  migrations: {
    path: "prisma/comondu/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});