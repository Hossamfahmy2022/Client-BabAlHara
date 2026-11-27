import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rawApiUrl = process.env.API_BASE_URL ?? process.env.NG_APP_API_BASE_URL;
const isVercelBuild = process.env.VERCEL === '1';

if (rawApiUrl !== undefined || isVercelBuild) {
  const normalizedUrl = (rawApiUrl ?? '').trim().replace(/\/+$/, '');
  const content = `export const environment = {\n  apiBaseUrl: ${JSON.stringify(normalizedUrl)},\n};\n`;

  writeFileSync(resolve('src/environments/environment.vercel.ts'), content, 'utf8');
  if (isVercelBuild) {
    writeFileSync(resolve('src/environments/environment.prod.ts'), content, 'utf8');
  }
  console.log(`[set-env] Configured apiBaseUrl = "${normalizedUrl || '(same-origin Vercel proxy)'}"`);
}
