import React from 'react';

const Footer = () => {
  return (
    <footer className="flex w-full flex-none items-center justify-center p-6 text-0.875">
      &copy; {new Date().getFullYear()} Lee Woo Jin. All Rights Reserved.
    </footer>
  );
};

export default Footer;
