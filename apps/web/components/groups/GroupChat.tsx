'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getGroupMessages, sendGroupMessage, deleteGroupMessage, editGroupMessage } from '@/app/actions/chat'
import { v4 as uuidv4 } from 'uuid'

interface Message {
    id: string
    content: string
    created_at: string
    user_id: string
    user: {
        email: string
    }
}

interface GroupChatProps {
    groupId: string
    currentUserId: string
}


export function GroupChat({ groupId, currentUserId }: GroupChatProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Function to load messages
    async function loadMessages(isInitial = false) {
        const { data } = await getGroupMessages(groupId)
        if (data) {
            setMessages((prev) => {
                // Determine if we have new messages to scroll
                // const hasNew = data.length > prev.length
                return data
            })
            if (isInitial) {
                setIsLoading(false)
                setTimeout(scrollToBottom, 500) // Increase timeout for rendering
            }
        } else {
            // Even if no data (error or empty), stop loading to avoid stuck state
            if (isInitial) setIsLoading(false)
        }
    }

    useEffect(() => {
        loadMessages(true)

        // 3-second polling as requested
        const interval = setInterval(() => {
            loadMessages()
        }, 3000)

        // Subscribe to changes on group_messages
        const channel = supabase
            .channel(`group-chat:${groupId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'group_messages',
                    filter: `group_id=eq.${groupId}`,
                },
                (payload) => {
                    // Reload messages on any change (INSERT, UPDATE, DELETE)
                    loadMessages().then(() => {
                        // Scroll to bottom only on new messages
                        if (payload.eventType === 'INSERT') {
                            setTimeout(scrollToBottom, 100)
                        }
                    })
                }
            )
            .subscribe()

        return () => {
            clearInterval(interval)
            supabase.removeChannel(channel)
        }
    }, [groupId, supabase])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const content = newMessage
        setNewMessage('') // Clear input immediately

        // 1. Optimistic Update
        const optimisticId = uuidv4()
        const optimisticMessage: Message = {
            id: optimisticId, // Temporary ID
            content,
            created_at: new Date().toISOString(),
            user_id: currentUserId,
            user: {
                email: 'You' // or fetching actual email from context if available, but 'You' is fine or we can pass email in props
            }
        }

        setMessages((prev) => [...prev, optimisticMessage])
        // Scroll to bottom specifically after optimistic add
        setTimeout(scrollToBottom, 10)

        // 2. Send to server
        const result = await sendGroupMessage(groupId, content)

        // 3. Handle success/failure
        if (result.error) {
            // Remove optimistic message or show error
            // setMessages(prev => prev.filter(m => m.id !== optimisticId)) 
            // alert('Failed to send')
            console.error('Failed to send message')
        }
        // If success, the polling or realtime will eventually fetch the real message.
        // We will likely have a duplicate for 0-3 seconds until the next poll overwrites the list 
        // OR we can explicitly reload.
        // To fix duplicates: We can remove the optimistic one when we seek the real one. 
        // But we don't know which one is the real one easily without correlation ID.
        // Simple fix: loadMessages immediately after send.
        await loadMessages()
    }

    const handleDeleteMessage = async (messageId: string) => {
        // Optimistic delete
        setMessages(prev => prev.filter(m => m.id !== messageId))

        const result = await deleteGroupMessage(messageId)
        if (result.error) {
            // Revert if failed (simple revert: reload)
            loadMessages()
            // Don't show alert for "not found" errors since message might already be deleted
            if (!result.error.includes('not found') && !result.error.includes('Message not found')) {
                alert('Failed to delete message')
            }
        }
    }

    const handleStartEdit = (message: Message) => {
        setEditingMessageId(message.id)
        setNewMessage(message.content)
    }

    const cancelEdit = () => {
        setEditingMessageId(null)
        setNewMessage('')
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !editingMessageId) return

        const content = newMessage
        const messageId = editingMessageId

        // Optimistic update
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content } : m))
        setEditingMessageId(null)
        setNewMessage('')

        const result = await editGroupMessage(messageId, content)
        if (result.error) {
            loadMessages()
            // Don't show alert for "not found" errors since message might already be deleted/edited
            if (!result.error.includes('not found') && !result.error.includes('Message not found')) {
                alert('Failed to update message')
            }
        }
    }

    return (
        <div className="flex flex-col h-[500px] bg-gray-900/50 rounded-lg border border-gray-800">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {isLoading ? (
                    <div className="text-center text-gray-500 mt-10 animate-pulse">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10 animate-in fade-in zoom-in duration-300">No messages yet. Say hello!</div>
                ) : (
                    messages.map((message) => {
                        const isMe = message.user_id === currentUserId
                        return (
                            <div
                                key={message.id}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 fade-in duration-300 group`}
                            >
                                <div className="flex items-center gap-2">
                                    {isMe && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <button
                                                onClick={() => handleStartEdit(message)}
                                                className="text-gray-500 hover:text-blue-400 p-1"
                                                title="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMessage(message.id)}
                                                className="text-gray-500 hover:text-red-400 p-1"
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 0 0 1-2-2V6m3 0V4a2 0 0 1 2-2h4a2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                            : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-1 px-1">
                                    <span className="text-[10px] text-gray-500 font-medium">
                                        {isMe ? 'You' : message.user?.email || 'User'}
                                    </span>
                                    <span className="text-[10px] text-gray-600">
                                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={editingMessageId ? handleEditSubmit : handleSendMessage} className="p-4 border-t border-gray-800 bg-gray-900/80 rounded-b-lg backdrop-blur-sm">
                <div className="flex gap-2 relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={editingMessageId ? "Edit your message..." : "Type a message..."}
                        className={`flex-1 bg-gray-800 border-none rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 ${editingMessageId ? 'focus:ring-yellow-500/50' : 'focus:ring-blue-500/50'} outline-none transition-all shadow-inner`}
                    />
                    {editingMessageId && (
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-medium transition-all"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`${editingMessageId ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-blue-600 hover:bg-blue-500'} text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95`}
                    >
                        {editingMessageId ? 'Update' : 'Send'}
                    </button>
                </div>
            </form>

        </div>
    )
}
