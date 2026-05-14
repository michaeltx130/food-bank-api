import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/lapaz/schema.prisma",
  migrations: {
    path: "prisma/lapaz/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});