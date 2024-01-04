import { cn } from '@/lib/utils/cn';
import React from 'react';

const CardContainer = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg p-4 w-full h-fit flex flex-col',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default CardContainer;
