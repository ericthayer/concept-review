import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import {
  type RoutePosition,
  buildRouteTable,
  morphKeyFor,
  normalizePath,
  packRouteTable,
  positionFor,
  unpackRouteTable,
} from '../../src/lib/coordinates.js';
import { loadContent } from '../../src/lib/content.js';
import { resolveTransition } from '../../src/lib/resolve-transition.js';

const content = loadContent(join(process.cwd(), 'content'));
const table = buildRouteTable({
  halls: content.halls.halls,
  exhibitions: content.exhibitions,
  theaters: content.theaters,
});

const must = (path: string): RoutePosition => {
  const p = positionFor(table, path);
  assert.ok(p, `missing ${path}`);
  return p;
};

describe('route table', () => {
  it('places every §4 route', () => {
    for (const path of ['/', '/halls/', '/special-exhibitions/', '/theaters/', '/sturm-family-wing/', '/visit/', '/programs/', '/learn/', '/science/', '/about/', '/support/']) {
      must(path);
    }
    for (const hall of content.halls.halls) must(`/halls/${hall.slug}/`);
    for (const e of content.exhibitions) must(`/special-exhibitions/${e.slug}/`);
    for (const t of content.theaters) must(`/theaters/${t.slug}/`);
  });

  it('puts the Atrium at F1 depth 0 and the Directory at F1 depth 1', () => {
    assert.deepEqual([must('/').floor, must('/').depth], [1, 0]);
    assert.deepEqual([must('/halls/').floor, must('/halls/').depth], [1, 1]);
  });

  it('satisfies the §14 acceptance moves', () => {
    assert.equal(resolveTransition(must('/halls/'), must('/halls/prehistoric-journey/')), 'enter');
    assert.equal(resolveTransition(must('/halls/prehistoric-journey/'), must('/halls/')), 'exit');
    const lateral = resolveTransition(must('/halls/prehistoric-journey/'), must('/halls/egyptian-mummies/'));
    assert.ok(lateral === 'lateral-l' || lateral === 'lateral-r');
    assert.equal(resolveTransition(must('/halls/space-odyssey/'), must('/halls/prehistoric-journey/')), 'ascend');
  });

  it('round-trips through the packed form', () => {
    assert.deepEqual([...unpackRouteTable(packRouteTable(table))], [...table]);
  });

  it('ignores malformed packed entries', () => {
    assert.equal(unpackRouteTable('{"/x/":[9,0,0,"a"],"/y/":"nope"}').size, 0);
    assert.equal(unpackRouteTable('null').size, 0);
  });
});

describe('normalizePath', () => {
  it('strips origin, query, hash and index.html', () => {
    assert.equal(normalizePath('https://example.org/halls/index.html?x=1#y'), '/halls/');
    assert.equal(normalizePath('https://example.org'), '/');
    assert.equal(normalizePath('halls'), '/halls/');
    assert.equal(normalizePath('//halls//x'), '/halls/x/');
  });
});

describe('morphKeyFor', () => {
  it('keys halls and exhibitions only', () => {
    assert.equal(morphKeyFor('/halls/prehistoric-journey/'), 'hall-prehistoric-journey');
    assert.equal(morphKeyFor('/special-exhibitions/mythic-creatures/'), 'exhibition-mythic-creatures');
    assert.equal(morphKeyFor('/halls/'), null);
    assert.equal(morphKeyFor('/theaters/gates-planetarium/'), null);
  });
});
