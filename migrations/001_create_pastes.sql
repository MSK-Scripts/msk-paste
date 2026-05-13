-- ============================================================================
-- MSK Paste — 001_create_pastes
-- Creates the main `pastes` table.
-- ============================================================================

CREATE TABLE pastes (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  paste_id        VARCHAR(32)     NOT NULL UNIQUE,
  title           VARCHAR(100)    NULL,
  content         LONGTEXT        NOT NULL,
  language        VARCHAR(50)     NOT NULL DEFAULT 'plaintext',
  password_hash   VARCHAR(255)    NULL,
  expires_at      DATETIME        NOT NULL,
  burn_after_read TINYINT(1)      NOT NULL DEFAULT 0,
  view_count      INT UNSIGNED    NOT NULL DEFAULT 0,
  delete_token    VARCHAR(80)     NOT NULL UNIQUE,
  size_bytes      INT UNSIGNED    NOT NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_ip_hash VARBINARY(32)   NOT NULL,

  INDEX idx_paste_id    (paste_id),
  INDEX idx_expires_at  (expires_at),
  INDEX idx_created_ip  (created_ip_hash, created_at),
  INDEX idx_language    (language),
  INDEX idx_created_at  (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
