import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const owner = 'zajuak';
const excluded = new Set(['match-editor']);
const snapshotFile = new URL('../src/data/repositories.json', import.meta.url);

export async function fetchRepositories(fetcher = fetch, token = process.env.GITHUB_TOKEN) {
  const repositories = [];
  for (let page = 1; ; page++) {
    const response = await fetcher(
      `https://api.github.com/users/${owner}/repos?type=owner&sort=full_name&per_page=100&page=${page}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'zajuka-site-repository-sync',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(20_000),
      },
    );
    if (!response.ok) throw new Error(`GitHub API 请求失败：HTTP ${response.status}`);
    const batch = await response.json();
    if (!Array.isArray(batch)) throw new Error('GitHub API 返回的仓库列表格式无效');
    repositories.push(...batch);
    if (batch.length < 100) return repositories;
  }
}

export function buildSnapshot(repositories, previous) {
  const current = new Map();
  for (const repository of repositories) {
    if (typeof repository.private !== 'boolean') throw new Error('仓库可见性字段无效');
    if (repository.private || repository.owner?.login?.toLowerCase() !== owner) continue;
    if (excluded.has(repository.name)) continue;
    if (
      typeof repository.name !== 'string' || !repository.name ||
      repository.html_url !== `https://github.com/${owner}/${repository.name}` ||
      !(repository.description === null || typeof repository.description === 'string') ||
      !(repository.language === null || typeof repository.language === 'string') ||
      typeof repository.fork !== 'boolean'
    ) throw new Error('GitHub API 返回的仓库信息格式无效');
    current.set(repository.name, {
      name: repository.name,
      href: repository.html_url,
      description: repository.description ?? '',
      language: repository.language,
      fork: repository.fork,
    });
  }
  const previousNames = new Set(previous.map(repository => repository.name));
  const added = [...current.keys()].filter(name => !previousNames.has(name)).sort();
  // 新仓库置顶，保留已有条目的顺序；已删除或转为私有的仓库自动移除。
  return [...added, ...previous.map(repository => repository.name).filter(name => current.has(name))]
    .map(name => current.get(name));
}

async function main() {
  const before = await readFile(snapshotFile, 'utf8');
  const latest = await fetchRepositories();
  const snapshot = buildSnapshot(latest, JSON.parse(before));
  const after = `${JSON.stringify(snapshot, null, 2)}\n`;
  if (after !== before) await writeFile(snapshotFile, after);
  console.log(`已同步 ${snapshot.length} 个公开仓库${after === before ? '（无变化）' : ''}。`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(`仓库同步失败，保留原有快照：${error.message}`);
    process.exitCode = 1;
  });
}
