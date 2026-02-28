-- TaskFlow Database Setup SQL
-- Copy and paste these queries into your Supabase SQL Editor

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT groups_pkey PRIMARY KEY (id),
  CONSTRAINT groups_created_by_fkey FOREIGN KEY (created_by)
    REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_completed boolean NOT NULL DEFAULT false,
  due_date timestamp with time zone,
  attachment_url text,
  user_id uuid NOT NULL,
  group_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT tasks_group_id_fkey FOREIGN KEY (group_id)
    REFERENCES public.groups (id) ON DELETE CASCADE
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS public.group_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT group_members_pkey PRIMARY KEY (id),
  CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id)
    REFERENCES public.groups (id) ON DELETE CASCADE,
  CONSTRAINT group_members_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT group_members_unique UNIQUE (group_id, user_id)
);

-- Create task_completions table
CREATE TABLE IF NOT EXISTS public.task_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL,
  user_id uuid NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT task_completions_pkey PRIMARY KEY (id),
  CONSTRAINT task_completions_task_id_fkey FOREIGN KEY (task_id)
    REFERENCES public.tasks (id) ON DELETE CASCADE,
  CONSTRAINT task_completions_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT task_completions_unique UNIQUE (task_id, user_id)
);

-- ============================================
-- 2. CREATE INDEXES (for better performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks (user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_group_id ON public.tasks (group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members (group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members (user_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON public.task_completions (task_id);
CREATE INDEX IF NOT EXISTS idx_task_completions_user_id ON public.task_completions (user_id);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- ---- GROUPS POLICIES ----

-- Groups: Users can select groups they created
DROP POLICY IF EXISTS "Users can select own groups" ON public.groups;
CREATE POLICY "Users can select own groups"
ON public.groups FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by
);

-- Groups: Users can view groups they are members of
DROP POLICY IF EXISTS "Users can view groups as members" ON public.groups;
-- (Removed to prevent infinite recursion - use server function instead)

-- Groups: Users can create groups
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
CREATE POLICY "Users can create groups"
ON public.groups FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Groups: Only creator can delete group
DROP POLICY IF EXISTS "Only creator can delete groups" ON public.groups;
CREATE POLICY "Only creator can delete groups"
ON public.groups FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- ---- TASKS POLICIES ----

-- Tasks: Users can select their own tasks or tasks in groups they are members of or created
DROP POLICY IF EXISTS "Users can select own tasks" ON public.tasks;
CREATE POLICY "Users can select own tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (
  -- User's own tasks
  user_id = auth.uid() OR
  -- Tasks in groups user is a member of
  (
    group_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = tasks.group_id
      AND group_members.user_id = auth.uid()
    )
  ) OR
  -- Tasks in groups user created
  (
    group_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = tasks.group_id
      AND g.created_by = auth.uid()
    )
  )
);

-- Tasks: Users can create tasks
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
CREATE POLICY "Users can create tasks"
ON public.tasks FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Tasks: Users can update their own tasks, and group tasks they can access
DROP POLICY IF EXISTS "Users can update tasks" ON public.tasks;
CREATE POLICY "Users can update tasks"
ON public.tasks FOR UPDATE
TO authenticated
USING (
  -- User's own tasks
  user_id = auth.uid() OR
  -- Tasks in groups user is a member of
  (
    group_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = tasks.group_id
      AND group_members.user_id = auth.uid()
    )
  ) OR
  -- Tasks in groups user created
  (
    group_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = tasks.group_id
      AND g.created_by = auth.uid()
    )
  )
)
WITH CHECK (user_id = auth.uid());

-- Tasks: Users can delete their own tasks
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own tasks"
ON public.tasks FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ---- GROUP_MEMBERS POLICIES ----

-- Group Members: Users can select memberships they belong to, creators can see all members
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
CREATE POLICY "Users can view group members"
ON public.group_members FOR SELECT
TO authenticated
USING (
  -- Users can see their own membership
  user_id = auth.uid() OR
  -- Group creator can see all members in their group
  EXISTS (
    SELECT 1 FROM public.groups g
    WHERE g.id = group_members.group_id
    AND g.created_by = auth.uid()
  )
);

-- Group Members: Group creator or existing members can add new members
DROP POLICY IF EXISTS "Users can add group members" ON public.group_members;
CREATE POLICY "Users can add group members"
ON public.group_members FOR INSERT
TO authenticated
WITH CHECK (
  -- Group creator can add members
  EXISTS (
    SELECT 1 FROM public.groups g
    WHERE g.id = group_members.group_id
    AND g.created_by = auth.uid()
  )
);

-- Group Members: Users can remove themselves from groups
DROP POLICY IF EXISTS "Users can remove themselves from groups" ON public.group_members;
CREATE POLICY "Users can remove themselves from groups"
ON public.group_members FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ---- TASK_COMPLETIONS POLICIES ----

-- Task Completions: Users can view completions for tasks they can see
DROP POLICY IF EXISTS "Users can view task completions" ON public.task_completions;
CREATE POLICY "Users can view task completions"
ON public.task_completions FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_completions.task_id
    AND (
      -- User is task creator
      tasks.user_id = auth.uid() OR
      -- User is group member
      (
        tasks.group_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM public.group_members
          WHERE group_members.group_id = tasks.group_id
          AND group_members.user_id = auth.uid()
        )
      ) OR
      -- User created the group
      (
        tasks.group_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM public.groups g
          WHERE g.id = tasks.group_id
          AND g.created_by = auth.uid()
        )
      )
    )
  )
);

-- Task Completions: Users can mark tasks themselves
DROP POLICY IF EXISTS "Users can mark tasks complete" ON public.task_completions;
CREATE POLICY "Users can mark tasks complete"
ON public.task_completions FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_completions.task_id
    AND (
      -- User is task creator
      tasks.user_id = auth.uid() OR
      -- User is group member
      (
        tasks.group_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM public.group_members
          WHERE group_members.group_id = tasks.group_id
          AND group_members.user_id = auth.uid()
        )
      ) OR
      -- User created the group
      (
        tasks.group_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM public.groups g
          WHERE g.id = tasks.group_id
          AND g.created_by = auth.uid()
        )
      )
    )
  )
);

-- Task Completions: Users can unmark their own completions
DROP POLICY IF EXISTS "Users can unmark task completions" ON public.task_completions;
CREATE POLICY "Users can unmark task completions"
ON public.task_completions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Your database is now ready for TaskFlow!
-- 
-- Next steps:
-- 1. Add your environment variables from Settings > API
-- 2. Run the application: npm run dev
-- 3. Test the auth flow and task management
- -   C r e a t e   g r o u p _ m e s s a g e s   t a b l e 
 
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . g r o u p _ m e s s a g e s   ( 
 
     i d   u u i d   N O T   N U L L   D E F A U L T   g e n _ r a n d o m _ u u i d ( ) , 
 
     g r o u p _ i d   u u i d   N O T   N U L L , 
 
     u s e r _ i d   u u i d   N O T   N U L L , 
 
     c o n t e n t   t e x t   N O T   N U L L , 
 
     c r e a t e d _ a t   t i m e s t a m p   w i t h   t i m e   z o n e   N O T   N U L L   D E F A U L T   n o w ( ) , 
 
     C O N S T R A I N T   g r o u p _ m e s s a g e s _ p k e y   P R I M A R Y   K E Y   ( i d ) , 
 
     C O N S T R A I N T   g r o u p _ m e s s a g e s _ g r o u p _ i d _ f k e y   F O R E I G N   K E Y   ( g r o u p _ i d ) 
 
         R E F E R E N C E S   p u b l i c . g r o u p s   ( i d )   O N   D E L E T E   C A S C A D E , 
 
     C O N S T R A I N T   g r o u p _ m e s s a g e s _ u s e r _ i d _ f k e y   F O R E I G N   K E Y   ( u s e r _ i d ) 
 
         R E F E R E N C E S   a u t h . u s e r s   ( i d )   O N   D E L E T E   C A S C A D E 
 
 ) ; 
 
 
 
 - -   C r e a t e   p o l l s   t a b l e 
 
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . p o l l s   ( 
 
     i d   u u i d   N O T   N U L L   D E F A U L T   g e n _ r a n d o m _ u u i d ( ) , 
 
     g r o u p _ i d   u u i d   N O T   N U L L , 
 
     q u e s t i o n   t e x t   N O T   N U L L , 
 
     c r e a t e d _ b y   u u i d   N O T   N U L L , 
 
     c r e a t e d _ a t   t i m e s t a m p   w i t h   t i m e   z o n e   N O T   N U L L   D E F A U L T   n o w ( ) , 
 
     e x p i r e s _ a t   t i m e s t a m p   w i t h   t i m e   z o n e , 
 
     i s _ a c t i v e   b o o l e a n   N O T   N U L L   D E F A U L T   t r u e , 
 
     C O N S T R A I N T   p o l l s _ p k e y   P R I M A R Y   K E Y   ( i d ) , 
 
     C O N S T R A I N T   p o l l s _ g r o u p _ i d _ f k e y   F O R E I G N   K E Y   ( g r o u p _ i d ) 
 
         R E F E R E N C E S   p u b l i c . g r o u p s   ( i d )   O N   D E L E T E   C A S C A D E , 
 
     C O N S T R A I N T   p o l l s _ c r e a t e d _ b y _ f k e y   F O R E I G N   K E Y   ( c r e a t e d _ b y ) 
 
         R E F E R E N C E S   a u t h . u s e r s   ( i d )   O N   D E L E T E   C A S C A D E 
 
 ) ; 
 
 
 
 - -   C r e a t e   p o l l _ o p t i o n s   t a b l e 
 
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . p o l l _ o p t i o n s   ( 
 
     i d   u u i d   N O T   N U L L   D E F A U L T   g e n _ r a n d o m _ u u i d ( ) , 
 
     p o l l _ i d   u u i d   N O T   N U L L , 
 
     o p t i o n _ t e x t   t e x t   N O T   N U L L , 
 
     C O N S T R A I N T   p o l l _ o p t i o n s _ p k e y   P R I M A R Y   K E Y   ( i d ) , 
 
     C O N S T R A I N T   p o l l _ o p t i o n s _ p o l l _ i d _ f k e y   F O R E I G N   K E Y   ( p o l l _ i d ) 
 
         R E F E R E N C E S   p u b l i c . p o l l s   ( i d )   O N   D E L E T E   C A S C A D E 
 
 ) ; 
 
 
 
 - -   C r e a t e   p o l l _ v o t e s   t a b l e 
 
 C R E A T E   T A B L E   I F   N O T   E X I S T S   p u b l i c . p o l l _ v o t e s   ( 
 
     i d   u u i d   N O T   N U L L   D E F A U L T   g e n _ r a n d o m _ u u i d ( ) , 
 
     p o l l _ i d   u u i d   N O T   N U L L , 
 
     o p t i o n _ i d   u u i d   N O T   N U L L , 
 
     u s e r _ i d   u u i d   N O T   N U L L , 
 
     c r e a t e d _ a t   t i m e s t a m p   w i t h   t i m e   z o n e   N O T   N U L L   D E F A U L T   n o w ( ) , 
 
     C O N S T R A I N T   p o l l _ v o t e s _ p k e y   P R I M A R Y   K E Y   ( i d ) , 
 
     C O N S T R A I N T   p o l l _ v o t e s _ p o l l _ i d _ f k e y   F O R E I G N   K E Y   ( p o l l _ i d ) 
 
         R E F E R E N C E S   p u b l i c . p o l l s   ( i d )   O N   D E L E T E   C A S C A D E , 
 
     C O N S T R A I N T   p o l l _ v o t e s _ o p t i o n _ i d _ f k e y   F O R E I G N   K E Y   ( o p t i o n _ i d ) 
 
         R E F E R E N C E S   p u b l i c . p o l l _ o p t i o n s   ( i d )   O N   D E L E T E   C A S C A D E , 
 
     C O N S T R A I N T   p o l l _ v o t e s _ u s e r _ i d _ f k e y   F O R E I G N   K E Y   ( u s e r _ i d ) 
 
         R E F E R E N C E S   a u t h . u s e r s   ( i d )   O N   D E L E T E   C A S C A D E , 
 
     C O N S T R A I N T   p o l l _ v o t e s _ u n i q u e   U N I Q U E   ( p o l l _ i d ,   u s e r _ i d ) 
 
 ) ; 
 
 
 
 - -   E n a b l e   R L S 
 
 A L T E R   T A B L E   p u b l i c . g r o u p _ m e s s a g e s   E N A B L E   R O W   L E V E L   S E C U R I T Y ; 
 
 A L T E R   T A B L E   p u b l i c . p o l l s   E N A B L E   R O W   L E V E L   S E C U R I T Y ; 
 
 A L T E R   T A B L E   p u b l i c . p o l l _ o p t i o n s   E N A B L E   R O W   L E V E L   S E C U R I T Y ; 
 
 A L T E R   T A B L E   p u b l i c . p o l l _ v o t e s   E N A B L E   R O W   L E V E L   S E C U R I T Y ; 
 
 
 
 - -   P o l i c i e s   f o r   g r o u p _ m e s s a g e s 
 
 C R E A T E   P O L I C Y   " M e m b e r s   c a n   v i e w   m e s s a g e s " 
 
 O N   p u b l i c . g r o u p _ m e s s a g e s   F O R   S E L E C T 
 
 T O   a u t h e n t i c a t e d 
 
 U S I N G   ( 
 
     E X I S T S   ( 
 
         S E L E C T   1   F R O M   p u b l i c . g r o u p _ m e m b e r s 
 
         W H E R E   g r o u p _ m e m b e r s . g r o u p _ i d   =   g r o u p _ m e s s a g e s . g r o u p _ i d 
 
         A N D   g r o u p _ m e m b e r s . u s e r _ i d   =   a u t h . u i d ( ) 
 
     )   O R 
 
     E X I S T S   ( 
 
         S E L E C T   1   F R O M   p u b l i c . g r o u p s 
 
         W H E R E   g r o u p s . i d   =   g r o u p _ m e s s a g e s . g r o u p _ i d 
 
         A N D   g r o u p s . c r e a t e d _ b y   =   a u t h . u i d ( ) 
 
     ) 
 
 ) ; 
 
 
 
 C R E A T E   P O L I C Y   " M e m b e r s   c a n   s e n d   m e s s a g e s " 
 
 O N   p u b l i c . g r o u p _ m e s s a g e s   F O R   I N S E R T 
 
 T O   a u t h e n t i c a t e d 
 
 W I T H   C H E C K   ( 
 
     E X I S T S   ( 
 
         S E L E C T   1   F R O M   p u b l i c . g r o u p _ m e m b e r s 
 
         W H E R E   g r o u p _ m e m b e r s . g r o u p _ i d   =   g r o u p _ m e s s a g e s . g r o u p _ i d 
 
         A N D   g r o u p _ m e m b e r s . u s e r _ i d   =   a u t h . u i d ( ) 
 
     )   O R 
 
     E X I S T S   ( 
 
         S E L E C T   1   F R O M   p u b l i c . g r o u p s 
 
         W H E R E   g r o u p s . i d   =   g r o u p _ m e s s a g e s . g r o u p _ i d 
 
         A N D   g r o u p s . c r e a t e d _ b y   =   a u t h . u i d ( ) 
 
     ) 
 
 ) ; 
 
 
 
 - -   P o l i c i e s   f o r   p o l l s 
 
 C R E A T E   P O L I C Y   " M e m b e r s   c a n   v i e w   p o l l s " 
 
 O N   p u b l i c . p o l l s   F O R   S E L E C T 
 
 T O   a u t h e n t i c a t e d 
 
 U S I N G   ( 
 
     E X I S T S   ( 
 
         S E L E C T   1   F R O M   p u b l i c . g r o u p _ m e m b e r s 
 
         W H E R E   g r o u p _ m e m b e r s . g r o u p _ i d   =   p o l l s . g r o u p _ i d 
 
         A N D   g r o u p _ m e m b e r s . u s e r _ i d   =   a u t h . u i d ( ) 
 
     )   O R 
 
     E X I S T S   ( 
 
         S E L E C T   1   F R O M   p u b l i c . g r o u p s 
 
         W H E R E   g r o u p s . i d   =   p o l l s . g r o u p _ i d 
 
         A N D   g r o u p s . c r e a t e d _ b y   =   a u t h . u i d ( ) 
 
     ) 
 
 ) ; 
 
 
 
 C R E A T E   P O L I C Y   " M e m b e r s   c a n   c r e a t e   p o l l s " 
 
 O N   p u b l i c . p o l l s   F O R   I N S E R T 
 
 T O   a u t h e n t i c a t e d 
 
 W I T H   C H E C K   ( 
 
     E X I S T S   ( 
 
         S E L E C T   1   F R O M   p u b l i c . g r o u p _ m e m b e r s 
 
         W H E R E   g r o u p _ m e m b e r s . g r o u p _ i d   =   p o l l s . g r o u p _ i d 
 
         A N D   g r o u p _ m e m b e r s . u s e r _ i d   =   a u t h . u i d ( ) 
 
     )   O R 
 
     E X I S T S   ( 
 
         S E L E C T   1   F R O M   p u b l i c . g r o u p s 
 
         W H E R E   g r o u p s . i d   =   p o l l s . g r o u p _ i d 
 
         A N D   g r o u p s . c r e a t e d _ b y   =   a u t h . u i d ( ) 
 
     ) 
 
 ) ; 
 
 
 
 - -   P o l i c i e s   f o r   p o l l _ o p t i o n s 
 
 C R E A T E   P O L I C Y   " M e m b e r s   c a n   v i e w   p o l l   o p t i o n s " 
 
 O N   p u b l i c . p o l l _ o p t i o n s   F O R   S E L E C T 
 
 T O   a u t h e n t i c a t e d 
 
 U S I N G   ( 
 
     E X I S T S   ( 
 
         S E L E C T   1   F R O M   p u b l i c . p o l l s 
 
         J O I N   p u b l i c . g r o u p _ m e m b e r s   O N   p o l l s . g r o u p _ i d   =   g r o u p _ m e m b e r s . g r o u p _ i d 
 
         W H E R E   p o l l s . i d   =   p o l l _ o p t i o n s . p o l l _ i d 
 
         A N D   g r o u p _ m e m b e r s . u s e r _ i d   =   a u t h . u i d ( ) 
 
     )   O R   ( 
 
           E X I S T S   ( 
 
             S E L E C T   1   F R O M   p u b l i c . p o l l s 
 
             J O I N   p u b l i c . g r o u p s   o n   p o l l s . g r o u p _ i d   =   g r o u p s . i d 
 
             W H E R E   p o l l s . i d   =   p o l l _ o p t i o n s . p o l l _ i d 
 
             A N D   g r o u p s . c r e a t e d _ b y   =   a u t h . u i d ( ) 
 
         ) 
 
     ) 
 
 ) ; 
 
 
 
 C R E A T E   P O L I C Y   " M e m b e r s   c a n   c r e a t e   p o l l   o p t i o n s " 
 
 O N   p u b l i c . p o l l _ o p t i o n s   F O R   I N S E R T 
 
 T O   a u t h e n t i c a t e d 
 
 W I T H   C H E C K   ( 
 
     E X I S T S   ( 
 
         S E L E C T   1   F R O M   p u b l i c . p o l l s 
 
         J O I N   p u b l i c . g r o u p _ m e m b e r s   O N   p o l l s . g r o u p _ i d   =   g r o u p _ m e m b e r s . g r o u p _ i d 
 
         W H E R E   p o l l s . i d   =   p o l l _ o p t i o n s . p o l l _ i d 
 
         A N D   g r o u p _ m e m b e r s . u s e r _ i d   =   a u t h . u i d ( ) 
 
     )   O R   ( 
 
           E X I S T S   ( 
 
             S E L E C T   1   F R O M   p u b l i c . p o l l s 
 
             J O I N   p u b l i c . g r o u p s   o n   p o l l s . g r o u p _ i d   =   g r o u p s . i d 
 
             W H E R E   p o l l s . i d   =   p o l l _ o p t i o n s . p o l l _ i d 
 
             A N D   g r o u p s . c r e a t e d _ b y   =   a u t h . u i d ( ) 
 
         ) 
 
     ) 
 
 ) ; 
 
 
 
 - -   P o l i c i e s   f o r   p o l l _ v o t e s 
 
 C R E A T E   P O L I C Y   " M e m b e r s   c a n   v i e w   v o t e s " 
 
 O N   p u b l i c . p o l l _ v o t e s   F O R   S E L E C T 
 
 T O   a u t h e n t i c a t e d 
 
 U S I N G   ( 
 
     E X I S T S   ( 
 
         S E L E C T   1   F R O M   p u b l i c . p o l l s 
 
         J O I N   p u b l i c . g r o u p _ m e m b e r s   O N   p o l l s . g r o u p _ i d   =   g r o u p _ m e m b e r s . g r o u p _ i d 
 
         W H E R E   p o l l s . i d   =   p o l l _ v o t e s . p o l l _ i d 
 
         A N D   g r o u p _ m e m b e r s . u s e r _ i d   =   a u t h . u i d ( ) 
 
     )   O R   ( 
 
           E X I S T S   ( 
 
             S E L E C T   1   F R O M   p u b l i c . p o l l s 
 
             J O I N   p u b l i c . g r o u p s   o n   p o l l s . g r o u p _ i d   =   g r o u p s . i d 
 
             W H E R E   p o l l s . i d   =   p o l l _ v o t e s . p o l l _ i d 
 
             A N D   g r o u p s . c r e a t e d _ b y   =   a u t h . u i d ( ) 
 
         ) 
 
     ) 
 
 ) ; 
 
 
 
 C R E A T E   P O L I C Y   " M e m b e r s   c a n   v o t e " 
 
 O N   p u b l i c . p o l l _ v o t e s   F O R   I N S E R T 
 
 T O   a u t h e n t i c a t e d 
 
 W I T H   C H E C K   ( 
 
     u s e r _ i d   =   a u t h . u i d ( )   A N D   ( 
 
         E X I S T S   ( 
 
             S E L E C T   1   F R O M   p u b l i c . p o l l s 
 
             J O I N   p u b l i c . g r o u p _ m e m b e r s   O N   p o l l s . g r o u p _ i d   =   g r o u p _ m e m b e r s . g r o u p _ i d 
 
             W H E R E   p o l l s . i d   =   p o l l _ v o t e s . p o l l _ i d 
 
             A N D   g r o u p _ m e m b e r s . u s e r _ i d   =   a u t h . u i d ( ) 
 
         )   O R   ( 
 
             E X I S T S   ( 
 
                 S E L E C T   1   F R O M   p u b l i c . p o l l s 
 
                 J O I N   p u b l i c . g r o u p s   o n   p o l l s . g r o u p _ i d   =   g r o u p s . i d 
 
                 W H E R E   p o l l s . i d   =   p o l l _ v o t e s . p o l l _ i d 
 
                 A N D   g r o u p s . c r e a t e d _ b y   =   a u t h . u i d ( ) 
 
             ) 
 
         ) 
 
     ) 
 
 ) ; 
 
 