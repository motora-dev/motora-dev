import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node -r tsconfig-paths/register prisma/seed/upsert-articles.ts',
  },
  datasource: {
    url: process.env.DIRECT_URL ?? 'postgresql://dummy:5432/db',
  },
});
