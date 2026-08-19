import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('avatar abre o perfil público e o perfil próprio aponta para a conta', async () => {
  const [header, creatorPage] = await Promise.all([
    readFile(new URL('../app/components/Header.js', import.meta.url), 'utf8'),
    readFile(new URL('../app/creators/[username]/page.js', import.meta.url), 'utf8'),
  ]);
  assert.match(header, /\/creators\/\$\{encodeURIComponent\(user\.login\)\}/);
  assert.match(header, /aria-label="Meu perfil público"/);
  assert.match(creatorPage, /isOwnProfile/);
  assert.match(creatorPage, /href="\/account">⚙ Minha conta e tokens/);
});
