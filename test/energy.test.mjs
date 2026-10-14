import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldFlash, makeBoltPoints } from '../energy.js';

test('scroll flashes wait for meaningful movement and a cooldown', () => {
  assert.equal(shouldFlash(0, 100, 0, 1000), false);
  assert.equal(shouldFlash(0, 320, 0, 300), false);
  assert.equal(shouldFlash(0, 320, 0, 800), true);
  assert.equal(shouldFlash(900, 580, 1000, 1800), true);
});

test('a lightning path crosses the viewport without leaving its vertical bounds', () => {
  const points = makeBoltPoints(1200, 800, 1);
  assert.ok(points.length >= 8);
  assert.ok(points[0][0] <= 0);
  assert.ok(points.at(-1)[0] >= 1200);
  assert.ok(points.every(([x, y]) => Number.isFinite(x) && y >= 0 && y <= 800));
});
