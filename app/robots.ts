import type { MetadataRoute } from 'next'

/**
 * robots.txt. Without this file `/robots.txt` fell through to the `[id]`
 * route and came back as a paste page. Raw text and downloads are the same
 * content as the paste page in another form, and the API is not for crawlers.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/raw/', '/dl/'] }],
  }
}
