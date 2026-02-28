'use client'

import { useEffect, useState } from 'react'
import { getGroupPolls, createPoll, votePoll, deletePoll } from '@/app/actions/polls'
import { createClient } from '@/lib/supabase/client'
import { createTask } from '@/app/actions/tasks'

interface PollOption {
    id: string
    option_text: string
    votes: number
    isVotedByUser: boolean
}

interface Poll {
    id: string
    question: string
    created_at: string
    created_by: string
    options: PollOption[]
}

interface GroupPollsProps {
    groupId: string
    isCreator: boolean
    currentUserId: string
}

export function GroupPolls({ groupId, isCreator, currentUserId }: GroupPollsProps) {

    const [polls, setPolls] = useState<Poll[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [newQuestion, setNewQuestion] = useState('')
    const [newOptions, setNewOptions] = useState(['', ''])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadPolls()

        // Subscribe to poll updates
        const channel = supabase
            .channel(`group-polls:${groupId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'polls', filter: `group_id=eq.${groupId}` },
                () => loadPolls()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'poll_votes' }, // Ideally filter by poll_id but we don't know ids easily
                () => loadPolls()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [groupId])

    async function loadPolls() {
        const { data } = await getGroupPolls(groupId)
        if (data) {
            setPolls(data)
        }
        setIsLoading(false)
    }

    const handleAddOption = () => {
        setNewOptions([...newOptions, ''])
    }

    const handleOptionChange = (idx: number, val: string) => {
        const opts = [...newOptions]
        opts[idx] = val
        setNewOptions(opts)
    }

    const handleCreatePoll = async (e: React.FormEvent) => {
        e.preventDefault()
        const validOptions = newOptions.filter(o => o.trim())
        if (!newQuestion.trim() || validOptions.length < 2) return

        await createPoll(groupId, newQuestion, validOptions)
        setNewQuestion('')
        setNewOptions(['', ''])
        setIsCreating(false)
        loadPolls()
    }

    const handleVote = async (pollId: string, optionId: string) => {
        // Optimistic UI update could be complex, let's wait for server
        await votePoll(pollId, optionId)
        // loadPolls() // Realtime should handle it, but fallback:
        loadPolls()
    }

    const handleDeletePoll = async (pollId: string) => {
        await deletePoll(pollId)
        // Realtime will handle removal
        loadPolls()
    }


    const handleCreateTask = async (optionText: string) => {
        await createTask({
            title: optionText,
            description: `Created from poll`,
            priority: 'medium',
            group_id: groupId
        })
        alert('Task created!')
    }

    // Calculate percentage
    const getPercentage = (poll: Poll, option: PollOption) => {
        const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0)
        if (totalVotes === 0) return 0
        return Math.round((option.votes / totalVotes) * 100)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Polls</h2>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm transition-colors"
                >
                    {isCreating ? 'Cancel' : 'Create Poll'}
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreatePoll} className="bg-gray-800 p-4 rounded-lg space-y-4 border border-gray-700">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Question</label>
                        <input
                            type="text"
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. What task should we prioritize?"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Options</label>
                        <div className="space-y-2">
                            {newOptions.map((opt, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder={`Option ${idx + 1}`}
                                />
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddOption}
                            className="mt-2 text-sm text-blue-400 hover:text-blue-300"
                        >
                            + Add Option
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={!newQuestion.trim() || newOptions.filter(o => o.trim()).length < 2}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 transition-colors"
                    >
                        Post Poll
                    </button>
                </form>
            )}

            {isLoading ? (
                <div className="text-center text-gray-500">Loading polls...</div>
            ) : polls.length === 0 ? (
                <div className="text-center text-gray-500">No polls yet. Create one to gather opinions!</div>
            ) : (
                <div className="grid gap-6">
                    {polls.map((poll) => {
                        const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
                        return (
                            <div key={poll.id} className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-xl transition-all hover:border-gray-600">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-white leading-tight">{poll.question}</h3>
                                    <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {totalVotes} {totalVotes === 1 ? 'Vote' : 'Votes'}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {poll.options.map((option) => {
                                        const percentage = getPercentage(poll, option)
                                        return (
                                            <div key={option.id} className="flex gap-2 items-center group/option">
                                                <button
                                                    onClick={() => handleVote(poll.id, option.id)}
                                                    className={`relative flex-1 text-left p-4 rounded-lg overflow-hidden transition-all duration-300 ${option.isVotedByUser
                                                            ? 'ring-2 ring-blue-500/50 bg-blue-900/30'
                                                            : 'hover:bg-gray-700/80 bg-gray-900/40'
                                                        }`}
                                                >
                                                    {/* Progress Bar Background */}
                                                    <div
                                                        className={`absolute top-0 left-0 h-full transition-all duration-700 ease-out ${option.isVotedByUser ? 'bg-blue-500/20' : 'bg-gray-600/10'
                                                            }`}
                                                        style={{ width: `${percentage}%` }}
                                                    />

                                                    <div className="relative flex justify-between items-center z-10">
                                                        <div className="flex items-center gap-2">
                                                            {option.isVotedByUser && (
                                                                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                            <span className={`text-sm ${option.isVotedByUser ? 'text-blue-100 font-semibold' : 'text-gray-200'}`}>
                                                                {option.option_text}
                                                            </span>
                                                        </div>
                                                        <span className={`text-xs font-mono ${option.isVotedByUser ? 'text-blue-300' : 'text-gray-400'}`}>
                                                            {percentage}%
                                                        </span>
                                                    </div>
                                                </button>
                                                {isCreator && (
                                                    <button
                                                        onClick={() => handleCreateTask(option.option_text)}
                                                        title="Create Task from this option"
                                                        className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-blue-400 transition-colors opacity-0 group-hover/option:opacity-100"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-700/50 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-[8px] text-white font-bold">
                                            {poll.created_by.slice(0, 2).toUpperCase()}
                                        </div>
                                        <span>Posted on {new Date(poll.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>

                                    {(isCreator || poll.created_by === currentUserId) && (
                                        <button
                                            onClick={() => handleDeletePoll(poll.id)}
                                            className="text-xs font-medium text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1.5"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    )
}
