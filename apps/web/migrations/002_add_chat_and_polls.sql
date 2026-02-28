-- Create group_messages table
CREATE TABLE IF NOT EXISTS public.group_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT group_messages_pkey PRIMARY KEY (id),
  CONSTRAINT group_messages_group_id_fkey FOREIGN KEY (group_id)
    REFERENCES public.groups (id) ON DELETE CASCADE,
  CONSTRAINT group_messages_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create polls table
CREATE TABLE IF NOT EXISTS public.polls (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  question text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT polls_pkey PRIMARY KEY (id),
  CONSTRAINT polls_group_id_fkey FOREIGN KEY (group_id)
    REFERENCES public.groups (id) ON DELETE CASCADE,
  CONSTRAINT polls_created_by_fkey FOREIGN KEY (created_by)
    REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create poll_options table
CREATE TABLE IF NOT EXISTS public.poll_options (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL,
  option_text text NOT NULL,
  CONSTRAINT poll_options_pkey PRIMARY KEY (id),
  CONSTRAINT poll_options_poll_id_fkey FOREIGN KEY (poll_id)
    REFERENCES public.polls (id) ON DELETE CASCADE
);

-- Create poll_votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL,
  option_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT poll_votes_pkey PRIMARY KEY (id),
  CONSTRAINT poll_votes_poll_id_fkey FOREIGN KEY (poll_id)
    REFERENCES public.polls (id) ON DELETE CASCADE,
  CONSTRAINT poll_votes_option_id_fkey FOREIGN KEY (option_id)
    REFERENCES public.poll_options (id) ON DELETE CASCADE,
  CONSTRAINT poll_votes_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT poll_votes_unique UNIQUE (poll_id, user_id)
);

-- Enable RLS
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Policies for group_messages
CREATE POLICY "Members can view messages"
ON public.group_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_messages.group_id
    AND group_members.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = group_messages.group_id
    AND groups.created_by = auth.uid()
  )
);

CREATE POLICY "Members can send messages"
ON public.group_messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = group_messages.group_id
    AND group_members.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = group_messages.group_id
    AND groups.created_by = auth.uid()
  )
);

-- Policies for polls
CREATE POLICY "Members can view polls"
ON public.polls FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = polls.group_id
    AND group_members.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = polls.group_id
    AND groups.created_by = auth.uid()
  )
);

CREATE POLICY "Members can create polls"
ON public.polls FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_members.group_id = polls.group_id
    AND group_members.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = polls.group_id
    AND groups.created_by = auth.uid()
  )
);

-- Policies for poll_options
CREATE POLICY "Members can view poll options"
ON public.poll_options FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.polls
    JOIN public.group_members ON polls.group_id = group_members.group_id
    WHERE polls.id = poll_options.poll_id
    AND group_members.user_id = auth.uid()
  ) OR (
     EXISTS (
      SELECT 1 FROM public.polls
      JOIN public.groups on polls.group_id = groups.id
      WHERE polls.id = poll_options.poll_id
      AND groups.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Members can create poll options"
ON public.poll_options FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.polls
    JOIN public.group_members ON polls.group_id = group_members.group_id
    WHERE polls.id = poll_options.poll_id
    AND group_members.user_id = auth.uid()
  ) OR (
     EXISTS (
      SELECT 1 FROM public.polls
      JOIN public.groups on polls.group_id = groups.id
      WHERE polls.id = poll_options.poll_id
      AND groups.created_by = auth.uid()
    )
  )
);

-- Policies for poll_votes
CREATE POLICY "Members can view votes"
ON public.poll_votes FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.polls
    JOIN public.group_members ON polls.group_id = group_members.group_id
    WHERE polls.id = poll_votes.poll_id
    AND group_members.user_id = auth.uid()
  ) OR (
     EXISTS (
      SELECT 1 FROM public.polls
      JOIN public.groups on polls.group_id = groups.id
      WHERE polls.id = poll_votes.poll_id
      AND groups.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Members can vote"
ON public.poll_votes FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND (
    EXISTS (
      SELECT 1 FROM public.polls
      JOIN public.group_members ON polls.group_id = group_members.group_id
      WHERE polls.id = poll_votes.poll_id
      AND group_members.user_id = auth.uid()
    ) OR (
      EXISTS (
        SELECT 1 FROM public.polls
        JOIN public.groups on polls.group_id = groups.id
        WHERE polls.id = poll_votes.poll_id
        AND groups.created_by = auth.uid()
      )
    )
  )
);
