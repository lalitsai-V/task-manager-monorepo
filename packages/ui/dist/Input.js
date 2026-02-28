import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
    return (_jsxs("div", { className: "w-full", children: [label && (_jsx("label", { className: "block text-sm font-medium text-gray-200 mb-2", children: label })), _jsx("input", { ref: ref, className: `w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm lg:text-base [&::-webkit-calendar-picker-indicator]:invert(1) ${className}`, ...props }), error && (_jsxs("p", { className: "mt-1 text-sm text-primary/70 flex items-center gap-1", children: [_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), error] }))] }));
});
Input.displayName = 'Input';
//# sourceMappingURL=Input.js.map