import { jsx as _jsx } from "react/jsx-runtime";
export const Card = ({ children, className = '', ...props }) => {
    return (_jsx("div", { className: `bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 lg:p-6 shadow-lg hover:shadow-xl hover:bg-gray-800/70 transition-all duration-200 ${className}`, ...props, children: children }));
};
//# sourceMappingURL=Card.js.map