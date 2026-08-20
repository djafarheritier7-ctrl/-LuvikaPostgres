-- Create get_daily_scans function
CREATE OR REPLACE FUNCTION public.get_daily_scans(
  p_profile_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  date DATE,
  scan_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    date_trunc('day', created_at)::DATE as date,
    COUNT(*) as scan_count
  FROM public.scans 
  WHERE profile_id = p_profile_id 
    AND created_at >= (NOW() - (p_days || ' days')::INTERVAL)
  GROUP BY date_trunc('day', created_at)::DATE
  ORDER BY date DESC;
END;
$$;

-- Create index for better performance on scans table
CREATE INDEX IF NOT EXISTS scans_profile_id_created_at_idx 
ON public.scans(profile_id, created_at);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_daily_scans(UUID, INTEGER) TO authenticated;