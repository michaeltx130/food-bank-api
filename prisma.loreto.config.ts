import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/loreto/schema.prisma",
  migrations: {
    path: "prisma/loreto/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});