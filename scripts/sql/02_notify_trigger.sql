-- Generic trigger function to NOTIFY row changes (sends JSON with op and id)
CREATE OR REPLACE FUNCTION notify_row_change() RETURNS trigger AS $$
DECLARE
  payload json;
  pk text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    pk := NEW.id::text;
    payload := json_build_object('op', 'INSERT', 'id', pk);
    PERFORM pg_notify('realtime_' || TG_TABLE_NAME, payload::text);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    pk := NEW.id::text;
    payload := json_build_object('op', 'UPDATE', 'id', pk);
    PERFORM pg_notify('realtime_' || TG_TABLE_NAME, payload::text);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    pk := OLD.id::text;
    payload := json_build_object('op', 'DELETE', 'id', pk);
    PERFORM pg_notify('realtime_' || TG_TABLE_NAME, payload::text);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Example to attach to events table:
-- CREATE TRIGGER notify_events_change AFTER INSERT OR UPDATE OR DELETE ON public.events
-- FOR EACH ROW EXECUTE FUNCTION notify_row_change();