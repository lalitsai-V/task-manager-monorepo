export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: 'low' | 'medium' | 'high';
  is_completed: boolean;
  user_id: string;
  group_id: string | null;
  due_date?: string | null;
  attachment_url?: string | null;
  created_at: string;
  user?: {
    email: string;
  };
  task_completions?: {
    user_id: string;
    completed_at: string;
    user: {
      email: string;
    };
  }[];
}

export interface Group {
  id: string;
  name: string;
  created_by: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
}

export interface TaskCompletion {
  id: string;
  task_id: string;
  user_id: string;
  completed_at: string;
  user?: {
    email: string;
  };
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}
