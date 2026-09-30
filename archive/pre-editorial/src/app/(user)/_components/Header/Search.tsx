'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { IoClose, IoSearch } from 'react-icons/io5';

const Search = () => {
  const router = useRouter();
  const outsideDivRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const openModal = () => setSearchModalOpen(true);
  const closeModal = () => setSearchModalOpen(false);

  useEffect(() => {
    if (!searchModalOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen]);

  const handleClickOutside = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    if (outsideDivRef.current && outsideDivRef.current === e.target) {
      closeModal();
    }
  };

  const clearInputValue = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const keyword = inputRef.current?.value.trim();
    if (!keyword) return;

    router.push(`/shop/all?q=${encodeURIComponent(keyword)}`);
    closeModal();
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        aria-label="검색"
        className="flex h-10 w-10 items-center justify-center transition-colors hover:text-volt"
      >
        <IoSearch size={20} />
      </button>
      <AnimatePresence>
        {searchModalOpen && (
          <motion.div
            ref={outsideDivRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            onClick={handleClickOutside}
            className="fixed inset-0 z-50 h-dvh w-screen bg-ink/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: -12, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -12, x: '-50%' }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="fixed left-1/2 top-20 z-50 flex w-[94%] max-w-2xl flex-col gap-5 border border-border bg-card p-6 shadow-street"
            >
              <div className="flex items-center justify-between">
                <span className="display text-1.25 leading-none">
                  SEARCH<span className="text-volt">.</span>
                </span>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="close search modal"
                  className="transition-transform hover:rotate-90"
                >
                  <IoClose size={24} />
                </button>
              </div>
              <form className="relative w-full" onSubmit={handleSubmit}>
                <IoSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={inputRef}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  className="input-field w-full px-9"
                  placeholder="찾는 아이템을 검색해보세요"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-muted-foreground"
                  onClick={clearInputValue}
                  aria-label="clear input"
                >
                  <IoClose />
                </button>
              </form>
              <p className="display text-0.625 tracking-widest text-muted-foreground">
                ENTER TO SEARCH — ESC TO CLOSE
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Search;
