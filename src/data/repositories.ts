export interface Repository {
  name: string;
  href: string;
  description: string;
  language: string | null;
  fork: boolean;
}

// 公开仓库快照；不包含私有仓库。
export const repositories: Repository[] = [
  {
    "name": "Compiler-Principle-lab-PKU2026Fall",
    "href": "https://github.com/zajuak/Compiler-Principle-lab-PKU2026Fall",
    "description": "2026Fall 编译原理lab",
    "language": "C++",
    "fork": false
  },
  {
    "name": "PKU-Computational-Photography-assignment-7--Photometric-Stereo",
    "href": "https://github.com/zajuak/PKU-Computational-Photography-assignment-7--Photometric-Stereo",
    "description": "北京大学计算摄像学2026春-第七次平时作业-光度立体视觉",
    "language": "Python",
    "fork": false
  },
  {
    "name": "PKU-Foundations-of-Natural-Language-Processing-2026-Spring",
    "href": "https://github.com/zajuak/PKU-Foundations-of-Natural-Language-Processing-2026-Spring",
    "description": "2026春 北京大学自然语言处理基础",
    "language": "TeX",
    "fork": false
  },
  {
    "name": "PKU-Design-And-Analysis-Of-Algorithms",
    "href": "https://github.com/zajuak/PKU-Design-And-Analysis-Of-Algorithms",
    "description": "北京大学算法设计与分析2026春 期末考试解答题部分复习资料 （by codex）",
    "language": null,
    "fork": false
  },
  {
    "name": "-TriDoS",
    "href": "https://github.com/zajuak/-TriDoS",
    "description": "2025Spring  程序设计实习 大作业",
    "language": "C++",
    "fork": false
  },
  {
    "name": "wuziqi",
    "href": "https://github.com/zajuak/wuziqi",
    "description": "2024Fall 计算概论A 五子棋大作业",
    "language": "C++",
    "fork": false
  },
  {
    "name": "wmhpc-training-camp-x-lcpu-ai-infra-seminars",
    "href": "https://github.com/zajuak/wmhpc-training-camp-x-lcpu-ai-infra-seminars",
    "description": "北京大学未名超算队与北京大学学生 Linux 俱乐部合办的暑期 AI Infra 系列活动仓库",
    "language": "Cuda",
    "fork": true
  },
  {
    "name": "zajuak.github.io",
    "href": "https://github.com/zajuak/zajuak.github.io",
    "description": "zajuka 的数字手记 · Computer Science, Machine Learning & Systems",
    "language": "JavaScript",
    "fork": false
  }
];
