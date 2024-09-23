'use client';

import { useTheme } from 'next-themes';
import { MdDarkMode, MdWbSunny } from 'react-icons/md';

const themeIcon = {
  dark: (
    <MdWbSunny
      size={20}
      className="fill-white transition-all group-hover:rotate-[30deg] group-hover:scale-110 dark:fill-black"
    />
  ),
  light: (
    <MdDarkMode
      size={20}
      className="fill-white transition-all group-hover:rotate-[30deg] group-hover:scale-110 dark:fill-black"
    />
  ),
};

const DarkModeToggle = () => {
  const { setTheme, resolvedTheme: theme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      className="group rounded-sm bg-black p-1 dark:bg-white"
      onClick={toggleTheme}
    >
      {themeIcon[theme as 'dark' | 'light']}
    </button>
  );
};

export default DarkModeToggle;
