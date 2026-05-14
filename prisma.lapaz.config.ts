import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: "nodes/lapaz.env" }); 

export default defineConfig({
  schema: "prisma/lapaz/schema.prisma",
  migrations: {
    path: "prisma/lapaz/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});