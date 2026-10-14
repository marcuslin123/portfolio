import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getScrollCharge } from '../energy.js';

test('charge tracks readable page progress and clamps overscroll', () => {
  assert.equal(getScrollCharge(0, 3000, 1000), 0);
  assert.equal(getScrollCharge(1000, 3000, 1000), 0.5);
  assert.equal(getScrollCharge(2000, 3000, 1000), 1);
  assert.equal(getScrollCharge(-100, 3000, 1000), 0);
  assert.equal(getScrollCharge(2500, 3000, 1000), 1);
});

test('a page without scrollable distance has no charge', () => {
  assert.equal(getScrollCharge(0, 800, 1000), 0);
});
