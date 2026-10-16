import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface BuildInfo {
  readonly today: string;
  readonly pages: readonly string[];
}

export const build: BuildInfo = JSON.parse(readFileSync(join(process.cwd(), 'dist', 'build.json'), 'utf8')) as BuildInfo;
export const ROUTES: readonly string[] = build.pages;
