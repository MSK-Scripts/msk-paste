/**
 * Standardized API error envelope.
 */
export type ApiError = {
  error:    string
  details?: Record<string, string[]>
}

/**
 * Database row for `pastes`.
 */
export interface PasteRow {
  id:               number
  paste_id:         string
  title:            string | null
  content:          string
  language:         string
  password_hash:    string | null
  expires_at:       Date
  burn_after_read:  number  // tinyint 0/1
  view_count:       number
  delete_token:     string
  size_bytes:       number
  created_at:       Date
  created_ip_hash:  Buffer
}

/**
 * Public paste view (no secrets).
 */
export interface PublicPaste {
  pasteId:       string
  title:         string | null
  content:       string
  language:      string
  createdAt:     string
  expiresAt:     string
  viewCount:     number
  burnAfterRead: boolean
  sizeBytes:     number
}

/**
 * Response when creating a paste.
 */
export interface CreatePasteResponse {
  pasteId:       string
  url:           string
  rawUrl:        string
  deleteToken:   string
  expiresAt:     string
  hasPassword:   boolean
  burnAfterRead: boolean
}

/**
 * Supported expiration window choice.
 */
export type ExpiresIn = '10min' | '1h' | '1d' | '1w' | '1mo' | '1y'

/**
 * Global statistics payload.
 */
export interface GlobalStats {
  totalPastes:    number
  pastesToday:    number
  pastesThisWeek: number
  topLanguages:   { language: string; count: number }[]
}
