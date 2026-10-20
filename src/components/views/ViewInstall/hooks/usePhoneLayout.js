import { useEffect, useState } from 'react'

// A narrow viewport or a touch-primary device: scanning your own screen is useless there.
const QUERIES = ['(max-width: 767px)', '(pointer: coarse)']

const read = () => QUERIES.some((query) => {
  try {
    return !!(window.matchMedia && window.matchMedia(query).matches)
  } catch (e) {
    return false
  }
})

export default function usePhoneLayout () {
  const [isPhone, setIsPhone] = useState(read)

  useEffect(() => {
    if (!window.matchMedia) {
      return undefined
    }
    const lists = QUERIES.map((query) => window.matchMedia(query))
    const update = () => setIsPhone(read())
    // addListener is the Safari before 14 spelling.
    lists.forEach((list) => (list.addEventListener ? list.addEventListener('change', update) : list.addListener(update)))
    update()
    return () => lists.forEach((list) => (list.removeEventListener ? list.removeEventListener('change', update) : list.removeListener(update)))
  }, [])

  return isPhone
}
