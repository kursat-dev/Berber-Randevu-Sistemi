'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1"
                    >
                        {label}
                        {props.required && <span className="text-yellow-500 ml-1">*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={cn(
                        'w-full px-5 py-3 rounded-xl border transition-all duration-300',
                        'bg-white/5 dark:bg-black/40 backdrop-blur-sm',
                        'text-white',
                        'placeholder:text-gray-500',
                        'focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500',
                        error
                            ? 'border-red-500/50'
                            : 'border-white/10 dark:border-white/5 hover:border-white/20',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
