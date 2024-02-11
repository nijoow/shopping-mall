import type { Config } from 'tailwindcss';

const fontSizeArray: number[] = [];
for (let i = 0.75; i <= 5.5; i = i + 0.125) {
  fontSizeArray.push(i);
}
const fontSize: Record<number, string> = {};
fontSizeArray.forEach(value => (fontSize[value] = `${value}rem`));

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        slide: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        slide: 'slide 60s linear infinite',
      },
    },
    fontSize: fontSize,
  },
  plugins: [],
};
export default config;
