import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchRepositories, buildSnapshot } from '../scripts/sync-repositories.mjs';

const repo = (name, overrides = {}) => ({
  name, html_url: `https://github.com/zajuak/${name}`, owner: { login: 'zajuak' },
  private: false, description: null, language: null, fork: false, ...overrides,
});

test('同步简介和语言，保留顺序，排除编辑器和私有仓库，移除失效仓库', () => {
  const result = buildSnapshot([
    repo('B', { description: '新的简介', language: 'Java', fork: true }),
    repo('A'), repo('new'), repo('match-editor'), repo('private', { private: true }),
  ], [{ name: 'B' }, { name: 'deleted' }, { name: 'A' }]);
  assert.deepEqual(result.map(item => item.name), ['new', 'B', 'A']);
  assert.deepEqual(result[1], {
    name: 'B', href: 'https://github.com/zajuak/B', description: '新的简介', language: 'Java', fork: true,
  });
  assert.equal(result[2].description, '');
  assert.equal(result[2].language, null);
});

test('获取所有分页，避免 100 个仓库以上时漏项', async () => {
  const urls = [];
  const result = await fetchRepositories(async url => {
    urls.push(url);
    return new Response(JSON.stringify(urls.length === 1
      ? Array.from({ length: 100 }, (_, i) => repo(`repo${i}`)) : [repo('last')]));
  }, '');
  assert.equal(result.length, 101);
  assert.match(urls[1], /page=2$/);
});

test('API 错误或格式错误会中止同步', async () => {
  await assert.rejects(fetchRepositories(async () => new Response('', { status: 403 }), ''), /HTTP 403/);
  await assert.rejects(fetchRepositories(async () => new Response('{}'), ''), /格式无效/);
  assert.throws(() => buildSnapshot([repo('broken', { private: undefined })], []), /可见性/);
  assert.throws(() => buildSnapshot([repo('broken', { description: 123 })], []), /格式无效/);
});

test('其他账号的仓库不会进入快照', () => {
  assert.deepEqual(buildSnapshot([repo('foreign', { owner: { login: 'someone-else' } })], []), []);
});
