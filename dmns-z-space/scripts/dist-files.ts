import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Every file under dir, as dir-relative POSIX paths. */
export function walk(dir: string): string[] {
  const out: string[] = [];
  const visit = (current: string): void => {
    for (const name of readdirSync(current)) {
      const full = join(current, name);
      if (statSync(full).isDirectory()) visit(full);
      else out.push(relative(dir, full).split('\\').join('/'));
    }
  };
  visit(dir);
  return out;
}
