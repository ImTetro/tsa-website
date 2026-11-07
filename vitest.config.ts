import { defineConfig } from 'vitest/config';
// unit tests only; browser tests run through `npm run e2e`
export default defineConfig({ test: { include: ['tests/*.test.ts'] } });
