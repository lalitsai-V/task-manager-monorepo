'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const Button = React.forwardRef(({ variant = 'primary', size = 'md', loading = false, className = '', ...props }, ref) => {
    const baseClasses = 'rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 active:scale-95';
    const variantClasses = {
        primary: 'bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white shadow-lg hover:shadow-xl',
        secondary: 'bg-gray-700 hover:bg-gray-600 focus:ring-gray-500 text-white border border-gray-600',
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white shadow-lg hover:shadow-xl',
    };
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };
    const finalClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
    return (_jsx("button", { ref: ref, disabled: loading, className: finalClasses, ...props, children: loading ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("svg", { className: "animate-spin w-4 h-4", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), props.children] })) : (props.children) }));
});
Button.displayName = 'Button';
//# sourceMappingURL=Button.js.map