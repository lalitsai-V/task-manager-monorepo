'use server'

import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPoll(groupId: string, question: string, options: string[]) {
    try {
        const user = await getUser()
        if (!user) return { error: 'Unauthorized' }

        if (!question.trim()) return { error: 'Question cannot be empty' }
        if (options.length < 2) return { error: 'Please provide at least 2 options' }

        const supabase = await createClient()

        // Create poll
        const { data: poll, error: pollError } = await supabase
            .from('polls')
            .insert({
                group_id: groupId,
                question,
                created_by: user.id,
            })
            .select()
            .single()

        if (pollError) return { error: pollError.message }

        // Create options
        const optionsData = options.map(opt => ({
            poll_id: poll.id,
            option_text: opt,
        }))

        const { error: optionsError } = await supabase
            .from('poll_options')
            .insert(optionsData)

        if (optionsError) return { error: optionsError.message }

        revalidatePath(`/dashboard/groups/${groupId}`)
        return { success: true }
    } catch (error) {
        return { error: 'Failed to create poll' }
    }
}

export async function deletePoll(pollId: string) {
    try {
        const user = await getUser()
        if (!user) return { error: 'Unauthorized' }

        const supabase = await createClient()

        // Verify creator
        const { data: poll, error: fetchError } = await supabase
            .from('polls')
            .select('created_by, group_id')
            .eq('id', pollId)
            .single()

        if (fetchError || !poll) {
            return { error: 'Poll not found' }
        }

        if (poll.created_by !== user.id) {
            return { error: 'Only the creator can delete this poll' }
        }

        const { error: deleteError } = await supabase
            .from('polls')
            .delete()
            .eq('id', pollId)

        if (deleteError) {
            return { error: deleteError.message }
        }

        revalidatePath(`/dashboard/groups/${poll.group_id}`)
        return { success: true }
    } catch (error) {
        return { error: 'Failed to delete poll' }
    }
}

export async function votePoll(pollId: string, optionId: string) {
    try {
        const user = await getUser()
        if (!user) return { error: 'Unauthorized' }

        const supabase = await createClient()

        // Check if already voted
        const { data: existingVote } = await supabase
            .from('poll_votes')
            .select('id, option_id')
            .eq('poll_id', pollId)
            .eq('user_id', user.id)
            .single()

        if (existingVote) {
            // Delete existing vote
            await supabase.from('poll_votes').delete().eq('id', existingVote.id)

            // If they clicked the same option, they are toggling it off. Return.
            if (existingVote.option_id === optionId) {
                revalidatePath(`/dashboard/groups/${(await getGroupIdFromPoll(pollId))}`)
                return { success: true }
            }
        }

        // Insert new vote
        const { error } = await supabase
            .from('poll_votes')
            .insert({
                poll_id: pollId,
                option_id: optionId,
                user_id: user.id
            })

        if (error) return { error: error.message }

        // We need to revalidate the group page
        const groupId = await getGroupIdFromPoll(pollId)
        if (groupId) {
            revalidatePath(`/dashboard/groups/${groupId}`)
        }

        return { success: true }
    } catch (error) {
        return { error: 'Failed to vote' }
    }
}

async function getGroupIdFromPoll(pollId: string) {
    const supabase = await createClient()
    const { data } = await supabase.from('polls').select('group_id').eq('id', pollId).single()
    return data?.group_id
}

export async function getGroupPolls(groupId: string) {
    try {
        const user = await getUser()
        if (!user) return { error: 'Unauthorized' }

        const supabase = await createClient()

        // Get polls and their options
        const { data: polls, error } = await supabase
            .from('polls')
            .select(`
            *,
            poll_options (
                id,
                option_text
            )
          `)
            .eq('group_id', groupId)
            .order('created_at', { ascending: false })

        if (error) return { error: error.message }

        // Fetch votes separately to avoid deep nesting issues if any or just for clarity
        // Or we can use the join if set up correctly.
        // Let's do a second query for votes for these polls to map them easily
        const pollIds = polls.map(p => p.id)
        const { data: votes } = await supabase
            .from('poll_votes')
            .select('poll_id, option_id, user_id')
            .in('poll_id', pollIds)

        // Merge votes into polls
        const pollsWithVotes = polls.map(poll => {
            const pollVotes = votes ? votes.filter(v => v.poll_id === poll.id) : []
            return {
                ...poll,
                votes: pollVotes,
                options: poll.poll_options.map((opt: any) => ({
                    ...opt,
                    votes: pollVotes.filter(v => v.option_id === opt.id).length,
                    isVotedByUser: pollVotes.some(v => v.option_id === opt.id && v.user_id === user.id)
                }))
            }
        })

        return { data: pollsWithVotes }
    } catch (error) {
        return { error: 'Failed to fetch polls' }
    }
}
