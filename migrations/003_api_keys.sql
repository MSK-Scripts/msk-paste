-- ============================================================================
-- MSK Paste — 003_api_keys
-- Keys for creating pastes through the API. Issued with scripts/api-key.sh on
-- the server; only the SHA-256 of a key is stored.
-- ============================================================================

CREATE TABLE api_keys (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  key_hash      CHAR(64)      NOT NULL UNIQUE,
  key_prefix    VARCHAR(16)   NOT NULL,
  label         VARCHAR(100)  NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at  DATETIME      NULL,
  revoked_at    DATETIME      NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
