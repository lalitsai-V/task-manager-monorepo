'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Task, TaskCompletion } from '@taskmanager/common-types'
import { deleteTask, markTaskCompleted, updateTask } from '@/app/actions/tasks'
import { createClient } from '@/lib/supabase/client'
import type { UpdateTaskInput } from '@taskmanager/common-types'
import { useRealtimeTasks } from '@/hooks/useRealtimeTasks'

interface GroupMember {
  userId: string;
  email: string;
  createdAt: string;
}

export function TaskList({
  tasks: initialTasks,
  currentUserId,
  pollUrl,
  groupCompletions,
  groupMembers
}: {
  tasks?: Task[];
  currentUserId?: string;
  pollUrl?: string;
  groupCompletions?: Record<string, TaskCompletion[]>;
  groupMembers?: GroupMember[];
}) {
  const [previewTask, setPreviewTask] = useState<string | null>(null)
  const [detailTask, setDetailTask] = useState<string | null>(null)
  const [editTask, setEditTask] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const router = useRouter()

  const { tasks, loading, handleComplete, handleDelete } = useRealtimeTasks(pollUrl, initialTasks || []);


  const getFileExtension = (url: string) => {
    const parts = url.split('.')
    return parts[parts.length - 1]?.toLowerCase() || ''
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpen && !(event.target as Element).closest('.mobile-menu')) {
        setMenuOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const handleEdit = async (task: Task) => {
    setEditTask(task.id)
  }

  if (loading && tasks.length === 0) {
    // simple skeleton placeholders
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className="h-12 bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 250, damping: 30 }}
            className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors group active:bg-gray-650 touch-manipulation"
          >
            <button
              onClick={() => handleComplete(task.id)}
              disabled={loading === task.id}
              className={`relative px-4 py-2 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 flex-shrink-0 overflow-hidden border-2 ${task.is_completed
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border-emerald-400 shadow-lg hover:shadow-emerald-500/30'
                : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white border-slate-500 shadow-lg hover:shadow-slate-500/30'
                } ${loading === task.id ? 'opacity-90 cursor-wait transform scale-[1.02]' : 'transform hover:scale-105'}`}
              aria-label={task.is_completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              <span className={`flex items-center gap-2 transition-all duration-300`}>
                {task.is_completed ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden sm:inline">Done</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="hidden sm:inline">Mark Done</span>
                  </>
                )}
                {loading === task.id && (
                  <svg className="w-3 h-3 animate-spin ml-1" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </span>
            </button>
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetailTask(task.id)}
                  className="text-left hover:underline cursor-pointer block py-1 -my-1 px-1 -mx-1 rounded transition-colors hover:bg-gray-600/50 active:bg-gray-600/70"
                >
                  <span className={`block ${task.is_completed ? 'line-through text-gray-400' : 'text-white'}`}>
                    {task.title}
                  </span>
                </button>
                {task.attachment_url && <span className="text-blue-300 text-lg flex-shrink-0">📎</span>}
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${task.priority === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                  task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                    'bg-green-500/20 text-green-300 border border-green-500/30'
                  }`}>
                  {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
                </span>
                {(() => {
                  // For personal tasks (no groupMembers), don't show "by [username]" since it's always the current user
                  if (!groupMembers) return null;

                  const creatorEmail = task.user?.email || groupMembers?.find(m => m.userId === task.user_id)?.email;
                  if (!creatorEmail) return null;
                  return (
                    <span className="text-[10px] text-gray-500 truncate max-w-[100px]" title={`Created by ${creatorEmail}`}>
                      by {creatorEmail.split('@')[0]}
                    </span>
                  );
                })()}
              </div>

              {(() => {
                const completions = task.task_completions || (groupCompletions ? groupCompletions[task.id] : []);

                // For completions, we also need to resolve emails if they are missing
                const enritchedCompletions = completions?.map(c => ({
                  ...c,
                  user: c.user || { email: groupMembers?.find(m => m.userId === c.user_id)?.email || 'Unknown' }
                }));

                // For completed tasks, always show completion info
                if (task.is_completed) {
                  return (
                    <div className="mt-2 flex flex-wrap gap-1 items-center">
                      <span className="text-xs uppercase tracking-wider text-gray-500 font-bold mr-1">Completed by:</span>
                      {completions && completions.length > 0 ? (
                        completions.map((c) => (
                          <span
                            key={c.user_id}
                            className={`text-xs px-2 py-1 rounded-full border border-emerald-500/30 ${c.user_id === currentUserId ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-800 text-gray-400'
                              }`}
                            title={c.user?.email || 'Unknown user'}
                          >
                            {c.user_id === currentUserId ? 'You' : (c.user?.email ? c.user.email.split('@')[0] : 'User')}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full border border-gray-500/30 bg-gray-800 text-gray-400 flex items-center gap-1">
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </span>
                      )}
                    </div>
                  );
                }

                // For active tasks, only show if there are completions (previously completed by someone)
                if (!completions || completions.length === 0) return null;

                return (
                  <div className="mt-2 flex flex-wrap gap-1 items-center">
                    <span className="text-xs uppercase tracking-wider text-gray-500 font-bold mr-1">Completed by:</span>
                    {completions.map((c) => (
                      <span
                        key={c.user_id}
                        className={`text-xs px-2 py-1 rounded-full border border-emerald-500/30 ${c.user_id === currentUserId ? 'bg-emerald-500/20 text-emerald-300' : 'bg-gray-800 text-gray-400'
                          }`}
                        title={c.user?.email || 'Unknown user'}
                      >
                        {c.user_id === currentUserId ? 'You' : (c.user?.email ? c.user.email.split('@')[0] : 'User')}
                      </span>
                    ))}
                  </div>
                );
              })()}

              <div className="text-xs text-gray-400 mt-1 space-y-1">
                {task.due_date && <div>Due: {formatDate(task.due_date)}</div>}
                {task.attachment_url && (
                  <div className="flex items-center gap-2 mt-2 pt-1 border-t border-gray-600">
                    <span className="text-gray-400">File ({getFileExtension(task.attachment_url).toUpperCase()}):</span>
                    <button
                      onClick={() => setPreviewTask(task.id)}
                      className="text-blue-300 hover:text-blue-200 hover:underline text-xs"
                    >
                      View
                    </button>
                    <a
                      href={task.attachment_url}
                      download
                      className="text-blue-300 hover:text-blue-200 hover:underline text-xs"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <div className="relative md:hidden">
                <button
                  onClick={() => setMenuOpen(menuOpen === task.id ? null : task.id)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {menuOpen === task.id && (
                  <div className="mobile-menu absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 min-w-32">
                    {task.user_id === currentUserId && (
                      <button
                        onClick={() => { handleEdit(task); setMenuOpen(null); }}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 rounded-t-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => { handleDelete(task.id); setMenuOpen(null); }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700 rounded-b-lg flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {task.user_id === currentUserId && (
                <button
                  onClick={() => handleEdit(task)}
                  className="hidden md:inline-flex opacity-0 group-hover:opacity-100 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>
              )}
              <button
                onClick={() => handleDelete(task.id)}
                className="hidden md:inline-flex opacity-0 group-hover:opacity-100 px-3 py-1.5 text-sm bg-primary hover:bg-primary-hover text-white rounded-lg transition-all duration-200 items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {previewTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 flex flex-col relative">
            <button onClick={() => setPreviewTask(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl z-10">✕</button>
            {tasks.find((t) => t.id === previewTask)?.attachment_url && (
              <PreviewContent url={tasks.find((t) => t.id === previewTask)!.attachment_url!} />
            )}
          </div>
        </div>
      )}

      {detailTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-3xl max-h-[85vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setDetailTask(null)}
              className="sticky top-4 right-4 absolute text-gray-400 hover:text-white text-2xl z-10 bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
            {tasks.find((t) => t.id === detailTask) && (
              <TaskDetail task={tasks.find((t) => t.id === detailTask)!} currentUserId={currentUserId} onClose={() => setDetailTask(null)} />
            )}
          </div>
        </div>
      )}

      {editTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden relative shadow-2xl">
            {tasks.find((t) => t.id === editTask) && (
              <EditTaskModal
                task={tasks.find((t) => t.id === editTask)!}
                onClose={() => setEditTask(null)}
                onSave={async (title, description, priority) => {
                  if (!editTask) return
                  const result = await updateTask(editTask, { title, description, priority })
                  if (result.error && !result.error.includes('not found') && !result.error.includes('Task not found')) {
                    alert(result.error)
                  }
                  setEditTask(null)
                  // Realtime will update
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

function TaskDetail({ task, currentUserId, onClose }: { task: Task; currentUserId?: string; onClose: () => void }) {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">{task.title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
      </div>
      {task.description && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{task.description}</p>
        </div>
      )}
      {task.due_date && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Due Date</h3>
          <p className="text-gray-300">{new Date(task.due_date).toLocaleString()}</p>
        </div>
      )}
      {task.attachment_url && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Attachment</h3>
          <div className="bg-gray-900 border-2 border-gray-600 rounded-lg p-8 mb-4 min-h-80 flex items-center justify-center w-full">
            <PreviewContent url={task.attachment_url} />
          </div>
          <div className="flex items-center gap-3">
            <a href={task.attachment_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium">Open File</a>
            <a href={task.attachment_url} download className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium">Download File</a>
          </div>
        </div>
      )}
      <div className="text-xs text-gray-400 mt-8 pt-4 border-t border-gray-700">
        <p>Created: {new Date(task.created_at).toLocaleString()}</p>
        {task.is_completed && <p>Status: Completed ✓</p>}
      </div>
    </div>
  )
}

function EditTaskModal({ task, onClose, onSave }: { task: Task; onClose: () => void; onSave: (title: string, description: string, priority: 'low' | 'medium' | 'high') => Promise<void> }) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task.priority && ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (title.trim() === '') {
      alert('Title cannot be empty')
      return
    }
    setLoading(true)
    await onSave(title, description, priority)
    setLoading(false)
  }

  return (
    <div className="p-6 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Edit Task</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="edit-title" className="text-sm font-medium text-gray-300 block mb-2">Task Title</label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Enter task title"
          />
        </div>
        <div>
          <label htmlFor="edit-description" className="text-sm font-medium text-gray-300 block mb-2">Description (optional)</label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            placeholder="Enter task description"
          />
        </div>
        <div>
          <label htmlFor="edit-priority" className="text-sm font-medium text-gray-300 block mb-2">Priority</label>
          <select
            id="edit-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
        <div className="flex gap-3 pt-4 border-t border-gray-700 mt-6">
          <button onClick={handleSave} disabled={loading} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={onClose} disabled={loading} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium disabled:opacity-50">Cancel</button>
        </div>
      </div>
    </div>
  )
}

function PreviewContent({ url }: { url: string }) {
  const urlWithoutParams = url.split('?')[0]
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(urlWithoutParams)
  const isPdf = /\.pdf$/i.test(urlWithoutParams)
  const ext = urlWithoutParams.split('.').pop()?.toLowerCase() || ''

  if (isImage) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4 p-4">
        <img
          src={url}
          alt="Attachment preview"
          className="w-full max-w-sm h-auto rounded border-2 border-gray-500"
          style={{ maxHeight: '400px', objectFit: 'contain' }}
        />
      </div>
    )
  }

  if (isPdf) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-4">
        <div className="text-8xl">📄</div>
        <p className="text-gray-300">PDF Document</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <div className="text-8xl">📎</div>
      <p className="text-gray-300 font-medium">File: {ext.toUpperCase()}</p>
      <p className="text-gray-400 text-sm">Document attachment</p>
    </div>
  )
}
