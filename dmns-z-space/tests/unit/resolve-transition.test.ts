import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { RoutePosition } from '../../src/lib/coordinates.js';
import { resolveTransition } from '../../src/lib/resolve-transition.js';

const at = (path: string, floor: RoutePosition['floor'], depth: RoutePosition['depth'], x = 0): RoutePosition => ({
  path,
  floor,
  depth,
  x,
  wing: 'atrium',
});

describe('resolveTransition', () => {
  it('returns reload for the same path', () => {
    assert.equal(resolveTransition(at('/a/', 1, 1), at('/a/', 1, 1)), 'reload');
  });

  it('returns enter when depth increases on the same floor', () => {
    assert.equal(resolveTransition(at('/', 1, 0), at('/halls/', 1, 1)), 'enter');
  });

  it('returns exit when depth decreases on the same floor', () => {
    assert.equal(resolveTransition(at('/halls/x/', 1, 2), at('/halls/', 1, 1)), 'exit');
  });

  it('returns lateral-l when x decreases at the same depth and floor', () => {
    assert.equal(resolveTransition(at('/b/', 3, 2, 2), at('/a/', 3, 2, 0)), 'lateral-l');
  });

  it('returns lateral-r when x increases at the same depth and floor', () => {
    assert.equal(resolveTransition(at('/a/', 3, 2, 0), at('/b/', 3, 2, 1)), 'lateral-r');
  });

  it('returns lateral-r for distinct paths sharing every coordinate', () => {
    assert.equal(resolveTransition(at('/a/', 1, 1, 0), at('/b/', 1, 1, 0)), 'lateral-r');
  });

  it('returns ascend when the floor increases', () => {
    assert.equal(resolveTransition(at('/a/', 1, 2), at('/b/', 3, 2)), 'ascend');
  });

  it('returns descend when the floor decreases', () => {
    assert.equal(resolveTransition(at('/a/', 3, 2), at('/b/', 2, 2)), 'descend');
  });

  it('lets a floor change win over a depth change', () => {
    assert.equal(resolveTransition(at('/', 1, 0), at('/visit/', 0, 1)), 'descend');
    assert.equal(resolveTransition(at('/', 1, 0), at('/halls/p/', 3, 2)), 'ascend');
  });

  it('treats a room that spans floors as sharing them', () => {
    const directory: RoutePosition = { ...at('/halls/', 1, 1), spans: [1, 2, 3] };
    assert.equal(resolveTransition(directory, at('/halls/p/', 3, 2)), 'enter');
    assert.equal(resolveTransition(at('/halls/p/', 3, 2), directory), 'exit');
    assert.equal(resolveTransition(directory, at('/visit/', 0, 1)), 'descend');
  });

  it('lets a depth change win over a lateral change', () => {
    assert.equal(resolveTransition(at('/a/', 1, 1, 5), at('/b/', 1, 2, 0)), 'enter');
    assert.equal(resolveTransition(at('/a/', 1, 2, 0), at('/b/', 1, 1, 5)), 'exit');
  });
});
