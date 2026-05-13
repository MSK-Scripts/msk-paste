import { getRequestConfig } from 'next-intl/server'
import { getCurrentLocale } from './getLocale'

/**
 * Called by next-intl on every server request.
 * Returns the active locale plus its translations.
 */
export default getRequestConfig(async () => {
  const locale = await getCurrentLocale()

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Europe/Berlin',
  }
})
