#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

function checkEnvVariable(name: string): boolean {
  const value = process.env[name];
  if (!value) {
    console.error(`\x1b[31mERROR: ${name} is not set in your environment.\x1b[0m`);
    console.error(`Please add it to your .env file.`);
    return false;
  }
  return true;
}

if (!checkEnvVariable('SUPABASE_SERVICE_ROLE_KEY')) {
  console.error('You can find this key in:');
  console.error('Supabase Dashboard > Project > Settings > API > service_role key\n');
  process.exit(1);
}

const seedFilePath = path.resolve(__dirname, '../prisma/seed.ts');
const tsconfigPath = path.resolve(__dirname, '../prisma/tsconfig.seed.json');

if (!fs.existsSync(seedFilePath)) {
  console.error(`\x1b[31mERROR: Seed file not found at ${seedFilePath}\x1b[0m`);
  process.exit(1);
}

if (!fs.existsSync(tsconfigPath)) {
  console.error(`\x1b[31mERROR: tsconfig file not found at ${tsconfigPath}\x1b[0m`);
  process.exit(1);
}

console.log('\x1b[36mRunning seed with Supabase Auth integration using ts-node...\x1b[0m');

try {
  execSync(`npx ts-node-esm --skipIgnore --skipProject --transpileOnly ${seedFilePath}`, {
    stdio: 'inherit',
    env: {
      ...process.env,

      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  });

  console.log('\x1b[32mSeed completed successfully!\x1b[0m');
} catch (error) {
  console.error('\x1b[31mSeed failed.\x1b[0m');
  process.exit(1);
}
