import React from 'react';

const Footer = () => {
  return (
    <footer className="text-0.875 flex-none flex items-center justify-center w-full p-6">
      &copy; {new Date().getFullYear()} Lee Woo Jin. All Rights Reserved.
    </footer>
  );
};

export default Footer;
