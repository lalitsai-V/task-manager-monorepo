import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 lg:p-6 shadow-lg hover:shadow-xl hover:bg-gray-800/70 transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
