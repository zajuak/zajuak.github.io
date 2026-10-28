export const site = {
  name: '赵俊凯',
  englishName: 'Junkai Zhao',
  title: 'JUN KAI · 数字手记',
  description: '赵俊凯的数字手记。记录计算机科学、机器学习与计算机系统中的学习、思考和实践。',
  github: 'https://github.com/zajuak',
  source: 'https://github.com/zajuak/zajuak.github.io',
};

export const projects = [
  {
    title: '从语言到机器',
    subtitle: 'COMPILER CONSTRUCTION',
    description: '编译原理课程实践，沿着语法分析、中间表示与代码生成，理解程序如何成为机器指令。',
    tags: ['编译原理', '课程实践'],
    href: 'https://github.com/zajuak/Compiler-Principle-lab-PKU2026Fall',
    art: 'compiler',
    number: '01',
  },
  {
    title: '从光影到形状',
    subtitle: 'COMPUTATIONAL PHOTOGRAPHY',
    description: '计算摄像学课程中的光度立体视觉作业，探索光照、表面法线与三维形状之间的联系。',
    tags: ['计算摄像学', 'Photometric Stereo'],
    href: 'https://github.com/zajuak/PKU-Computational-Photography-assignment-7--Photometric-Stereo',
    art: 'vision',
    number: '02',
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
