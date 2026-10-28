export const site = {
  name: 'zajuka',
  englishName: 'zajuka',
  title: 'zajuka · 数字手记',
  description: 'zajuka 的数字手记。记录计算机科学、机器学习与计算机系统中的学习、思考和实践。',
  github: 'https://github.com/zajuak',
  source: 'https://github.com/zajuak/zajuak.github.io',
};

export const projects = [
  {
    title: '赛果图编辑器',
    subtitle: 'FOOTBALL MATCH EDITOR',
    description: '',
    tags: ['在线工具', '足球赛果图'],
    href: 'https://zajuak.github.io/match-editor/',
    art: 'football',
    number: '01',
  },

];

export function url(path = '') {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
export function formatDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll('-', '.');
}
export function readingTime(body = '') {
  return Math.max(1, Math.ceil(body.replace(/\s/g, '').length / 400));
}
