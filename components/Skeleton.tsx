import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'text',
    width,
    height
}) => {
    const baseClasses = "animate-pulse bg-slate-200 dark:bg-slate-700 rounded";

    const variantClasses = {
        text: "h-4 w-full rounded",
        circular: "rounded-full",
        rectangular: "rounded-lg"
    };

    const style = {
        width: width,
        height: height
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
};
