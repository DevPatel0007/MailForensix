import React from 'react';
import { cn } from '../../lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-neutral-200/80 dark:bg-neutral-800/80',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
