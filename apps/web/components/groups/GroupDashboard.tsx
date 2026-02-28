'use client'

import { useState } from 'react'
import { GroupChat } from './GroupChat'
import { GroupPolls } from './GroupPolls'
import { DeleteGroupButton } from './DeleteGroupButton'

interface GroupDashboardProps {
    groupId: string
    groupName: string
    isCreator: boolean
    currentUserId: string
    children: React.ReactNode // The existing Task List and Members view
}

export function GroupDashboard({
    groupId,
    groupName,
    isCreator,
    currentUserId,
    children
}: GroupDashboardProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'polls'>('overview')

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{groupName}</h1>
                    <p className="text-gray-400">Manage team tasks and members</p>
                </div>
                <div className="flex items-center gap-3">
                    {isCreator && <DeleteGroupButton groupId={groupId} />}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700 space-x-6">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'overview'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-gray-300'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'chat'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-gray-300'
                        }`}
                >
                    Team Chat
                </button>
                <button
                    onClick={() => setActiveTab('polls')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'polls'
                        ? 'text-blue-500 border-b-2 border-blue-500'
                        : 'text-gray-400 hover:text-gray-300'
                        }`}
                >
                    Polls
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[500px]">
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {children}
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <GroupChat groupId={groupId} currentUserId={currentUserId} />
                    </div>
                )}

                {activeTab === 'polls' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <GroupPolls groupId={groupId} isCreator={isCreator} currentUserId={currentUserId} />
                    </div>
                )}
            </div>
        </div>
    )
}
