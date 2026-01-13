'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'gold' | 'charcoal';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading = false,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            'inline-flex items-center justify-center rounded-xl font-bold uppercase tracking-widest transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

        const variants = {
            primary:
                'bg-white text-black hover:bg-yellow-500 hover:text-black shadow-xl shadow-white/5 focus:ring-white',
            gold:
                'bg-yellow-500 text-black hover:bg-yellow-400 shadow-xl shadow-yellow-500/20 focus:ring-yellow-500',
            charcoal:
                'bg-gray-900 text-white border border-white/10 hover:bg-gray-800 shadow-xl focus:ring-gray-700',
            secondary:
                'bg-gray-600/20 backdrop-blur-md text-white border border-white/10 hover:bg-gray-600/30 focus:ring-gray-500',
            success:
                'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/20 focus:ring-green-500',
            danger:
                'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20 focus:ring-red-500',
            ghost:
                'bg-transparent hover:bg-white/10 text-white focus:ring-white',
        };

        const sizes = {
            sm: 'text-xs px-4 py-2',
            md: 'text-sm px-6 py-3',
            lg: 'text-base px-8 py-4',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Yükleniyor...
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
