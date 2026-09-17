import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, indeterminate, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = !!indeterminate;
      }
    }, [indeterminate]);

    return (
      <div className="relative inline-flex items-center justify-center">
        <input
          type="checkbox"
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="sr-only"
          {...props}
        />
        <div
          onClick={(e) => {
            e.stopPropagation();
            onCheckedChange?.(!checked);
          }}
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border border-neutral-300 transition-colors cursor-pointer dark:border-neutral-700',
            checked
              ? 'bg-[#00C896] border-[#00C896] text-white dark:bg-[#00D4A4] dark:border-[#00D4A4] dark:text-neutral-900'
              : 'bg-white hover:border-neutral-400 dark:bg-neutral-900 dark:hover:border-neutral-600',
            className
          )}
        >
          {checked && <Check className="h-3 w-3 stroke-[3]" />}
          {!checked && indeterminate && (
            <div className="h-1.5 w-1.5 rounded-xs bg-neutral-500" />
          )}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
