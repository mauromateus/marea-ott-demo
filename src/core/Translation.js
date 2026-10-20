import dictionaries from 'i18n'

export const DEFAULT_LANGUAGE = 'es'

let language = DEFAULT_LANGUAGE

export const getLanguage = () => language

/** Unknown codes fall back to the default language instead of leaving the UI without text. */
export const setLanguage = (code) => {
  language = dictionaries[code] ? code : DEFAULT_LANGUAGE
  return language
}

/** Call once at boot, after the config is loaded. */
export const initLanguage = (config) => {
  const code = setLanguage(config?.app?.language)
  document.documentElement.lang = code
  return code
}

/**
 * Same convention as the real product: translate(key, params) with {name}-style placeholders.
 * A missing key returns the key itself, and warns in development so it is easy to spot.
 */
export const translate = (key, params) => {
  const text = dictionaries[language]?.[key]

  if (typeof text !== 'string') {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[i18n] Missing translation key "${key}" for language "${language}"`)
    }
    return key
  }

  if (!params) {
    return text
  }
  return text.replace(/\{(\w+)\}/g, (placeholder, name) => (name in params ? String(params[name]) : placeholder))
}

export default translate
