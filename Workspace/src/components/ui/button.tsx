import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-[#00C896] text-white hover:bg-[#00b084] active:bg-[#009b74] dark:bg-[#00D4A4] dark:text-[#0C0E12] dark:hover:bg-[#00C896] shadow-sm',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-600/90 dark:hover:bg-red-600 shadow-sm',
        outline:
          'border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-200 dark:hover:bg-neutral-800',
        secondary:
          'bg-neutral-100 text-neutral-900 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700/80',
        ghost:
          'text-neutral-700 hover:bg-neutral-100/80 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
        link: 'text-[#00C896] underline-offset-4 hover:underline dark:text-[#00D4A4]',
        mintGhost: 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70',
      },
      size: {
        default: 'h-8 px-3 py-1.5',
        sm: 'h-7 rounded-md px-2.5 text-xs',
        lg: 'h-9 rounded-md px-4 text-sm',
        icon: 'h-8 w-8',
        iconSm: 'h-7 w-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
