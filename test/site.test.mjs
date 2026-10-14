import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('recruiters can reach the main sections and external profiles from the page', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  for (const id of ['experience', 'open-source', 'projects', 'about']) {
    assert.match(html, new RegExp(`id="${id}"`));
    assert.match(html, new RegExp(`href="#${id}"`));
  }
  assert.match(html, /https:\/\/github\.com\/marcuslin123/);
  assert.match(html, /https:\/\/linkedin\.com\/in\/marcuslin123/);
  assert.match(html, /href="assets\/Marcus_Lin_Resume\.pdf"/);
});

test('the main work is directly present in HTML and the resume resolves locally', async () => {
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  for (const title of ['NextEra Energy', 'InFLOWS AI', 'Apache Spark', 'Distributed Load Testing Platform', 'SmartCharge']) {
    assert.ok(html.includes(title), `Missing ${title}`);
  }
  const pdf = await stat(resolve(root, 'assets/Marcus_Lin_Resume.pdf'));
  assert.ok(pdf.size > 10_000);
});

test('visual effects respect reduced motion and keyboard focus', async () => {
  const css = await readFile(resolve(root, 'styles.css'), 'utf8');
  const js = await readFile(resolve(root, 'script.js'), 'utf8');
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
  assert.match(js, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
});
