-- Fix permissions for collaborative Tasks and Chat, and allow Poll deletion

-- 1. Polls: Allow deletion by creator or group creator
CREATE POLICY "Creators can delete polls"
ON public.polls FOR DELETE
TO authenticated
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = polls.group_id
    AND groups.created_by = auth.uid()
  )
);

-- 2. Tasks: Allow any group member to UPDATE tasks in the group
DROP POLICY IF EXISTS "Users can update tasks" ON public.tasks;
CREATE POLICY "Group members can update tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR -- Task Creator
  (group_id IS NOT NULL AND EXISTS ( -- Group Member
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = tasks.group_id
    AND group_members.user_id = auth.uid()
  )) OR
  (group_id IS NOT NULL AND EXISTS ( -- Group Creator
    SELECT 1 FROM public.groups
    WHERE groups.id = tasks.group_id
    AND groups.created_by = auth.uid()
  ))
); 
-- Note: usage of WITH CHECK is implicit to match USING if omitted in simple cases, 
-- but explicitly omitting it allows updates as long as the row remains visible in the NEW state 
-- (which it should, as user remains member).

-- 3. Tasks: Allow any group member to DELETE tasks in the group
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Group members can delete tasks"
ON public.tasks FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR -- Task Creator
  (group_id IS NOT NULL AND EXISTS ( -- Group Member
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = tasks.group_id
    AND group_members.user_id = auth.uid()
  )) OR
  (group_id IS NOT NULL AND EXISTS ( -- Group Creator
    SELECT 1 FROM public.groups
    WHERE groups.id = tasks.group_id
    AND groups.created_by = auth.uid()
  ))
);

-- 4. Chat: Allow update/delete of own messages (already implemented logic, but need RLS support)
-- Allowing Update
CREATE POLICY "Users can update own messages"
ON public.group_messages FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allowing Delete
CREATE POLICY "Users can delete own messages"
ON public.group_messages FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS ( -- Group Creator can also delete messages (moderation)
    SELECT 1 FROM public.groups
    WHERE groups.id = group_messages.group_id
    AND groups.created_by = auth.uid()
  )
);
