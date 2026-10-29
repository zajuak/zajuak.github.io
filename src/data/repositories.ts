import snapshot from './repositories.json';

export interface Repository {
  name: string;
  href: string;
  description: string;
  language: string | null;
  fork: boolean;
}

// 构建时由 scripts/sync-repositories.mjs 刷新公开仓库信息。
export const repositories: Repository[] = snapshot;
