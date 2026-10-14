import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getActivationEffect } from '../interaction.js';

const bounds = { left: 100, top: 200, width: 80, height: 40 };

test('pointer activation follows the click on a link', () => {
  assert.deepEqual(getActivationEffect({ tagName: 'A' }, { detail: 1, clientX: 125, clientY: 215 }, bounds), { x: 125, y: 215 });
});

test('keyboard activation centers the effect on a button', () => {
  assert.deepEqual(getActivationEffect({ tagName: 'BUTTON' }, { detail: 0, clientX: 0, clientY: 0 }, bounds), { x: 140, y: 220 });
});

test('noninteractive cards do not produce click effects', () => {
  assert.equal(getActivationEffect({ tagName: 'ARTICLE' }, { detail: 1, clientX: 125, clientY: 215 }, bounds), null);
});
