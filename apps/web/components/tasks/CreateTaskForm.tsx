'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@taskmanager/ui'
import { createTask } from '@/app/actions/tasks'

type Props = { groupId?: string }

export function CreateTaskForm({ groupId }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [dueDate, setDueDate] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await createTask({
        title,
        description: description || null,
        priority,
        group_id: groupId || null,
        due_date: dueDate || null,
        attachment_url: null,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      // Debug info: log server response so we can see failures
      // (helps diagnose why group tasks may not appear)
      // eslint-disable-next-line no-console
      console.log('createTask result:', result)

      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate(null)
      
      // Refresh the page data instead of full reload
      router.refresh()
    } catch (err) {
      setError('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
      {error && (
        <div className="p-3 lg:p-4 bg-primary/20 border border-primary rounded-lg text-primary/70 text-sm flex items-start gap-2">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Task Title <span className="text-primary/70">*</span>
        </label>
        <Input
          id="title"
          placeholder="Enter a clear, actionable task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="text-sm lg:text-base"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Add more details about this task..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none text-sm lg:text-base"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="priority" className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm lg:text-base"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <p className="text-xs text-gray-500">Set the importance level of this task</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="due-date" className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Due Date <span className="text-gray-400">(optional)</span>
        </label>
        <Input
          id="due-date"
          name="due-date"
          type="datetime-local"
          value={dueDate || ''}
          onChange={(e) => setDueDate(e.target.value || null)}
          className="text-sm lg:text-base"
        />
        <p className="text-xs text-gray-500">Set a deadline to help you stay on track</p>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full lg:w-auto px-6 lg:px-8"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Task...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Task
            </div>
          )}
        </Button>
      </div>
    </form>
  )
}

