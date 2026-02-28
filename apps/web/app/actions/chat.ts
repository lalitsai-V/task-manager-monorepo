'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getGroupMessages(groupId: string) {
    try {
        const user = await getUser()
        if (!user) return { error: 'Unauthorized' }

        const supabase = await createClient()

        const { data, error } = await supabase.rpc('get_group_messages', { p_group_id: groupId })

        if (error) {
            return { error: error.message }
        }

        const formatted = (data as any[])?.map(msg => ({
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            user_id: msg.user_id,
            user: { email: msg.user_email }
        })) || []

        return { data: formatted }
    } catch (error) {
        return { error: 'Failed to fetch messages' }
    }
}

export async function sendGroupMessage(groupId: string, content: string) {
    try {
        const user = await getUser()
        if (!user) return { error: 'Unauthorized' }

        if (!content.trim()) return { error: 'Message cannot be empty' }

        const supabase = await createClient()

        const { error } = await supabase
            .from('group_messages')
            .insert({
                group_id: groupId,
                user_id: user.id,
                content,
            })

        if (error) {
            return { error: error.message }
        }

        revalidatePath(`/dashboard/groups/${groupId}`)

        return { success: true }
    } catch (error) {
        return { error: 'Failed to send message' }
    }
}

export async function deleteGroupMessage(messageId: string) {
    try {
        const user = await getUser()
        if (!user) return { error: 'Unauthorized' }

        const supabase = await createClient()

        const { data: message, error: messageError } = await supabase
            .from('group_messages')
            .select('user_id, group_id')
            .eq('id', messageId)
            .single()

        if (messageError || !message) {
            return { error: 'Message not found' }
        }

        if (message.user_id !== user.id) {
            return { error: 'Unauthorized' }
        }

        const { error } = await supabase
            .from('group_messages')
            .delete()
            .eq('id', messageId)

        if (error) {
            return { error: error.message }
        }

        revalidatePath(`/dashboard/groups/${message.group_id}`)

        return { success: true }
    } catch (error) {
        return { error: 'Failed to delete message' }
    }
}

export async function editGroupMessage(messageId: string, content: string) {
    try {
        const user = await getUser()
        if (!user) return { error: 'Unauthorized' }

        if (!content.trim()) return { error: 'Message cannot be empty' }

        const supabase = await createClient()

        const { data: message, error: messageError } = await supabase
            .from('group_messages')
            .select('user_id, group_id')
            .eq('id', messageId)
            .single()

        if (messageError || !message) {
            return { error: 'Message not found' }
        }

        if (message.user_id !== user.id) {
            return { error: 'Unauthorized' }
        }

        const { error } = await supabase
            .from('group_messages')
            .update({ content })
            .eq('id', messageId)

        if (error) {
            return { error: error.message }
        }

        revalidatePath(`/dashboard/groups/${message.group_id}`)

        return { success: true }
    } catch (error) {
        return { error: 'Failed to edit message' }
    }
}
