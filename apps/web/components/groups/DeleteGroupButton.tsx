'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteGroup } from '@/app/actions/groups'

export function DeleteGroupButton({ groupId }: { groupId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setIsDeleting(true)
        const result = await deleteGroup(groupId)

        if (result.error) {
            alert(result.error)
            setIsDeleting(false)
        } else {
            router.push('/dashboard/groups')
            router.refresh()
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
        >
            {isDeleting ? 'Deleting...' : 'Delete Group'}
        </button>
    )
}
