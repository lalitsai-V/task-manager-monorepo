"use client";

import { useEffect, useRef, useState } from "react";
import { Task } from "@taskmanager/common-types";
import { createClient } from "@/lib/supabase/client";
import { deleteTask, markTaskCompleted } from "@/app/actions/tasks";

export function useRealtimeTasks(pollUrl?: string, initialTasks: Task[] = []) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loading, setLoading] = useState<string | null>(null);
  // Track the serialized form of initialTasks so we only sync when server data actually changes
  const prevInitialRef = useRef<string>(JSON.stringify(initialTasks));

  // Sync state when server-side initialTasks actually changes (e.g. after router.refresh())
  useEffect(() => {
    const serialized = JSON.stringify(initialTasks);
    if (serialized !== prevInitialRef.current) {
      prevInitialRef.current = serialized;
      setTasks(initialTasks);
    }
  });

  const fetchTasks = async () => {
    if (!pollUrl) return;
    try {
      const res = await fetch(pollUrl, { 
        cache: "no-store",
        credentials: "include" // Include cookies for authentication
      });
      if (!res.ok) {
        console.error("Fetch failed:", res.status, res.statusText);
        return;
      }
      const data = await res.json();
      // Always update with the latest data from the API
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (e) {
      console.error("Fetch error:", e);
    }
  };

  useEffect(() => {
    if (!pollUrl) return;

    const supabase = createClient();

    // Parse pollUrl to extract filters
    const url = new URL(pollUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const groupId = url.searchParams.get('groupId');
    const completed = url.searchParams.get('completed');

    let filter: string | undefined;
    if (groupId) {
      filter = `group_id=eq.${groupId}`;
    } else {
      // For personal tasks, we need to get the current user ID
      // Since we can't easily get it here, we'll listen to all tasks
      // and rely on the API to filter them properly
      filter = undefined;
    }

    // Subscribe to task changes with proper filtering
    const tasksChannel = supabase
      .channel(`tasks-realtime-${pollUrl}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: filter,
        },
        (payload) => {
          console.log("Real-time task change:", payload);
          fetchTasks();
        }
      );

    // Also subscribe to task_completions for real-time completion updates
    const completionsChannel = supabase
      .channel(`task-completions-realtime-${pollUrl}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_completions",
        },
        (payload) => {
          console.log("Real-time completion change:", payload);
          fetchTasks();
        }
      );

    tasksChannel.subscribe();
    completionsChannel.subscribe();

    // Poll every 4 seconds as fallback
    const pollInterval = setInterval(fetchTasks, 4000);

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(completionsChannel);
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollUrl]);

  const handleComplete = async (id: string) => {
    setLoading(id);
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_completed: !t.is_completed } : t))
    );

    const result = await markTaskCompleted(id);
    if (result.error) {
      // Only show alert for errors other than "Task not found"
      // (since optimistic update already changed the state)
      if (!result.error.includes('Task not found') && !result.error.includes('not found')) {
        alert(result.error);
      }
      // Revert on error (but not for "not found" since task state might be correct)
      if (!result.error.includes('Task not found') && !result.error.includes('not found')) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, is_completed: !t.is_completed } : t))
        );
      }
    } else {
      // Fetch fresh data to reflect any server-side state changes
      await fetchTasks();
    }
    setLoading(null);
  };

  const handleDelete = async (id: string) => {
    setLoading(id);
    // Optimistic update
    const prevTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));

    const result = await deleteTask(id);
    if (result.error) {

      if (!result.error.includes('Task not found') && !result.error.includes('not found')) {
        alert(result.error);
      }
      // Revert on error (but not for "not found" since task is actually gone)
      if (!result.error.includes('Task not found') && !result.error.includes('not found')) {
        setTasks(prevTasks);
      }
    }
    setLoading(null);
  };

  return { tasks, loading, handleComplete, handleDelete, refetch: fetchTasks };
}
