
import React from 'react';

// --- Types ---

interface SoftCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

interface SoftButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

interface SoftBadgeProps {
    label: string;
    variant?: 'high' | 'medium' | 'low' | 'neutral';
    className?: string;
}

interface SoftInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

// --- Components ---

export const SoftCard: React.FC<SoftCardProps> = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-background-primary rounded-card shadow-soft p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const SoftButton: React.FC<SoftButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-pill font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary: 'bg-foreground-primary text-foreground-on-dark shadow-floating hover:opacity-90 active:scale-95 text-white',
        secondary: 'bg-background-secondary text-foreground-primary hover:bg-gray-200 active:scale-95',
        ghost: 'bg-transparent text-foreground-secondary hover:bg-background-secondary',
    };

    const sizes = {
        sm: 'text-sm px-4 h-8',
        md: 'text-base px-6 h-12', // Pill shape often likes height
        lg: 'text-lg px-8 h-14',
    };

    return (
        <button
            className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
};

export const SoftBadge: React.FC<SoftBadgeProps> = ({ label, variant = 'neutral', className = '' }) => {
    const variants = {
        high: 'bg-priority-high-bg text-priority-high-text',
        medium: 'bg-priority-medium-bg text-priority-medium-text',
        low: 'bg-priority-low-bg text-priority-low-text',
        neutral: 'bg-background-secondary text-foreground-secondary',
    };

    // Using arbitrary values from design if variables not fully wired yet, or using the new config vars
    const variantStyles = {
        high: 'bg-priority-high-bg text-priority-high-text',
        medium: 'bg-priority-medium-bg text-priority-medium-text',
        low: 'bg-priority-low-bg text-priority-low-text',
        neutral: 'bg-background-secondary text-foreground-secondary',
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-[8px] text-xs font-bold uppercase tracking-wide ${variantStyles[variant]} ${className}`}>
            {label}
        </span>
    );
};

export const SoftInput: React.FC<SoftInputProps> = ({ label, error, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-foreground-secondary mb-1">
                    {label}
                </label>
            )}
            <input
                className={`
          w-full bg-background-secondary border-none rounded-inner px-4 py-3 
          text-foreground-primary placeholder-foreground-muted
          focus:ring-2 focus:ring-brand-purple focus:bg-background-primary transition-all
          ${error ? 'ring-2 ring-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};
