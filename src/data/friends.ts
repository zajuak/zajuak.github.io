export interface Friend {
  name: string;
  description: string;
  href: string;
  image?: string;
}

// 在这里添加实际的友链资料。
export const friends: Friend[] = [
  {
    name: 'zzz~',
    description: 'not one, not two, not seven ~~',
    href: 'https://fuquan99666.github.io',
    image: 'https://fuquan99666.github.io/avatar.png',
  },
];
