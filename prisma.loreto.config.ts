import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: "nodes/loreto.env" }); 

export default defineConfig({
  schema: "prisma/loreto/schema.prisma",
  migrations: {
    path: "prisma/loreto/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});