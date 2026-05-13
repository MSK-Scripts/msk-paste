/**
 * Supported languages for syntax highlighting.
 * Order matters: this is the order the dropdown will display.
 */
export const SUPPORTED_LANGUAGES = [
  'plaintext',
  'bash', 'shell', 'powershell',
  'c', 'cpp', 'csharp', 'go', 'java', 'kotlin', 'rust', 'swift',
  'javascript', 'typescript', 'jsx', 'tsx',
  'python', 'ruby', 'php', 'perl',
  'html', 'css', 'scss', 'sass',
  'json', 'yaml', 'toml', 'xml',
  'sql', 'graphql',
  'markdown',
  'dockerfile',
  'lua',
  'diff',
] as const

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
}

/**
 * Maps the user-facing language id to the file extension used by /dl/:id.
 */
export const LANGUAGE_EXTENSIONS: Record<SupportedLanguage, string> = {
  plaintext:  'txt',
  bash:       'sh',
  shell:      'sh',
  powershell: 'ps1',
  c:          'c',
  cpp:        'cpp',
  csharp:     'cs',
  go:         'go',
  java:       'java',
  kotlin:     'kt',
  rust:       'rs',
  swift:      'swift',
  javascript: 'js',
  typescript: 'ts',
  jsx:        'jsx',
  tsx:        'tsx',
  python:     'py',
  ruby:       'rb',
  php:        'php',
  perl:       'pl',
  html:       'html',
  css:        'css',
  scss:       'scss',
  sass:       'sass',
  json:       'json',
  yaml:       'yaml',
  toml:       'toml',
  xml:        'xml',
  sql:        'sql',
  graphql:    'graphql',
  markdown:   'md',
  dockerfile: 'dockerfile',
  lua:        'lua',
  diff:       'diff',
}

export function extensionFor(language: string): string {
  if (isSupportedLanguage(language)) {
    return LANGUAGE_EXTENSIONS[language]
  }
  return 'txt'
}
