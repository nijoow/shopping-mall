'use client';
import React, { useRef, useState } from 'react';
import { IoClose, IoSearch } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

const Search = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const ref = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className="flex items-center gap-1 px-2"
      >
        <IoSearch size={20} /> <span className="text-0.75">SEARCH</span>
      </button>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={() => setIsSidebarOpen(false)}
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
                className="self-end"
                onClick={() => setIsSidebarOpen(false)}
              >
                <IoClose size={24} className="fill-white" />
              </button>
              <div className="relative mt-8 w-full">
                <IoSearch className="text-muted-foreground pointer-events-none absolute left-0 top-0 m-3 h-4 w-4" />
                <Input
                  ref={ref}
                  className="px-9"
                  placeholder="검색어를 입력해주세요"
                />
                <button
                  type="button"
                  className="text-muted-foreground absolute right-0 top-0 m-3 h-4 w-4 cursor-pointer"
                  onClick={() => {
                    if (ref.current) ref.current.value = '';
                  }}
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
