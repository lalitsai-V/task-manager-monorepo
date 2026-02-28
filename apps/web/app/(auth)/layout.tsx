import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white">
            <span className="text-red-500">Task</span>Flow
          </h1>
          <p className="text-gray-400 mt-2 text-sm lg:text-base">Manage tasks, collaborate with teams</p>
        </div>
        {children}
      </div>
    </div>
  )
}
