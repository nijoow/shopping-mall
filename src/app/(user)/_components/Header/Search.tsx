'use client';

import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef, useState } from 'react';
import { IoClose, IoSearch } from 'react-icons/io5';

const Search = () => {
  const outsideDivRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const openModal = () => setSearchModalOpen(true);
  const closeModal = () => setSearchModalOpen(false);

  const handleClickOutside = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (outsideDivRef.current && outsideDivRef.current === e.target) {
      closeModal();
    }
  };

  const clearInputValue = () => {
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex items-center gap-1 px-2"
      >
        <IoSearch size={20} />
        <span className="hidden text-0.75 md:block">SEARCH</span>
      </button>
      <AnimatePresence>
        {searchModalOpen && (
          <motion.div
            ref={outsideDivRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={handleClickOutside}
            className="fixed left-0 top-0 h-screen w-screen bg-white/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, x: '-50%' }}
              animate={{ scale: 1, opacity: 1, x: '-50%' }}
              exit={{ scale: 0.9, opacity: 0, x: '-50%' }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="fixed left-1/2 top-[1%] z-50 flex h-[98%] w-[98%] max-w-5xl flex-col rounded-md bg-black/60 p-4 shadow-lg backdrop-blur-lg"
            >
              <button
                type="button"
                className="self-end"
                onClick={closeModal}
                aria-label="close search modal"
              >
                <IoClose size={24} className="fill-white" />
              </button>
              <div className="relative mt-8 w-full">
                <IoSearch className="pointer-events-none absolute left-0 top-0 m-3 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  className="px-9"
                  placeholder="검색어를 입력해주세요"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 m-3 h-4 w-4 cursor-pointer text-muted-foreground"
                  onClick={clearInputValue}
                  aria-label="clear input"
                >
                  <IoClose />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Search;
