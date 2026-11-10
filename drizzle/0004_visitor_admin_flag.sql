-- Add is_admin column to visitor_sessions and visitor_pageviews
-- Flags visits from admin/owner users for filtering in analytics dashboard

ALTER TABLE visitor_sessions ADD COLUMN is_admin integer NOT NULL DEFAULT 0;
ALTER TABLE visitor_pageviews ADD COLUMN is_admin integer NOT NULL DEFAULT 0;
