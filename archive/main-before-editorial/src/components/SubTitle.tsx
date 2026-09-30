import { cn } from '@/lib/utils';
import { HTMLAttributes, PropsWithChildren } from 'react';

const SubTitle = ({
  children,
  className,
}: PropsWithChildren & HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn(`text-1.25 font-semibold`, className)}>{children}</h2>
);

export default SubTitle;
