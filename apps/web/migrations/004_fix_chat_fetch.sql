-- Create a secure function to fetch messages with user emails (bypasses direct auth.users restrictions)
CREATE OR REPLACE FUNCTION get_group_messages(p_group_id uuid)
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamptz,
  user_id uuid,
  user_email varchar
)
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT gm.id, gm.content, gm.created_at, gm.user_id, CAST(u.email as varchar)
  FROM group_messages gm
  JOIN auth.users u ON gm.user_id = u.id
  WHERE gm.group_id = p_group_id
  AND ( -- Ensure only members can view
    EXISTS (SELECT 1 FROM group_members gm2 WHERE gm2.group_id = p_group_id AND gm2.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM groups g WHERE g.id = p_group_id AND g.created_by = auth.uid())
  )
  ORDER BY gm.created_at ASC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_group_messages TO authenticated;
