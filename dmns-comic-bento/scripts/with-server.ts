/** Runs a callback against a throwaway static server on dist/. */
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { ROOT } from './load-content.ts';

export async function withServer<T>(port: number, fn: (origin: string) => Promise<T>): Promise<T> {
  const child = spawn(process.execPath, [join(ROOT, 'scripts/serve.ts')], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise<void>((resolve, reject) => {
    child.stdout.on('data', (d: Buffer) => {
      if (d.toString().includes('Serving')) resolve();
    });
    child.on('exit', (code) => reject(new Error(`server exited ${code}`)));
  });
  try {
    return await fn(`http://localhost:${port}`);
  } finally {
    child.kill();
  }
}
