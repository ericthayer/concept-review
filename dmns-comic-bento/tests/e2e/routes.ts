import { buildRoutes } from '../../src/lib/routes.ts';
import { loadContent } from '../../scripts/load-content.ts';

export const content = loadContent();
export const ROUTES: readonly string[] = buildRoutes(content).map((r) => r.position.path);
