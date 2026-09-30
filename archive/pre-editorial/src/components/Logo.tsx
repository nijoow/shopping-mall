import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

/**
 * NIJOOW 스트릿 워드마크.
 * 디스플레이 폰트 + 볼트 컬러 도트로 구성된 타이포 로고.
 */
const Logo = ({ className, ...rest }: HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(
      'display inline-flex select-none items-baseline gap-0.5 text-1.375 leading-none',
      className,
    )}
    {...rest}
  >
    NIJOOW
    <span aria-hidden className="mb-0.5 inline-block h-1.5 w-1.5 bg-volt" />
  </span>
);

export default Logo;
