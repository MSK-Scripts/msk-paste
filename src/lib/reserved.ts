/**
 * Reserved paste IDs that may not be used as custom IDs.
 * The router would catch many of these anyway, but we reject at create time
 * so the user gets a clear error instead of mysterious behaviour.
 */
export const RESERVED_PASTE_IDS = new Set<string>([
  'api',
  'app',
  'admin',
  'about',
  'assets',
  'auth',
  'burned',
  'create',
  'dl',
  'docs',
  'expired',
  'favicon.ico',
  'help',
  'home',
  'index',
  'legal',
  'login',
  'logo.png',
  'logout',
  'manifest.json',
  'new',
  'paste',
  'pastes',
  'password',
  'privacy',
  'public',
  'raw',
  'register',
  'robots.txt',
  'root',
  'settings',
  'signin',
  'signup',
  'sitemap.xml',
  'static',
  'stats',
  'support',
  'terms',
  '_next',
])

export function isReservedId(id: string): boolean {
  return RESERVED_PASTE_IDS.has(id.toLowerCase())
}
