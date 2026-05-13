-- ============================================================================
-- MSK Paste — 002_widen_delete_token
-- Delete tokens are `dk_` + 64 hex chars = 67 chars total.
-- VARCHAR(64) from migration 001 was therefore too small.
-- ============================================================================

ALTER TABLE pastes
  MODIFY COLUMN delete_token VARCHAR(80) NOT NULL;
