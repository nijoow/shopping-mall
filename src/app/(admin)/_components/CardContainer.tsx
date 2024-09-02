import { cn } from '@/lib/utils';
import React from 'react';

const CardContainer = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'flex h-fit w-full flex-col rounded-lg bg-white p-4',
      className,
    )}
  >
    {children}
  </div>
);

export default CardContainer;
